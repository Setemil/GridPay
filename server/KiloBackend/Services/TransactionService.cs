using Kilo.DTOs.EnergyLogDto;
using Kilo.DTOs.TransactionDto;
using Kilo.Helpers;
using Kilo.Interfaces;
using Kilo.Models;
using Kilo.Response;

namespace Kilo.Services
{
    public class TransactionService : ITransactionService
    {
        private readonly ITransactionRepository _transactionRepository;
        private readonly IMeterRepository _meterRepository;
        private readonly IListingRepository _listingRepository;
        private readonly IEnergyLogService _energyLogService;
        private readonly ILogger<TransactionService> _logger;

        public TransactionService(ITransactionRepository transactionRepository, IMeterRepository meterRepository, IListingRepository listingRepository, IEnergyLogService energyLogService, ILogger<TransactionService> logger)
        {
            _transactionRepository = transactionRepository;
            _meterRepository = meterRepository;
            _listingRepository = listingRepository;
            _energyLogService = energyLogService;
            _logger = logger;
            _logger.LogDebug("Nlog is integrated to Transaction Service");
        }

        public async Task<ApiResponse> CreateTransactionAsync(BuyListingDto buyListingDto, int sellerId, int buyerId, int listingId)
        {
            try
            {
                var sellerListing = await _listingRepository.GetListingByIdAsync(listingId);

                if (sellerListing == null)
                {
                    return new ApiResponse
                    {
                        StatusCode = 404,
                        Message = "Energy listing not found",
                        Data = new { }
                    };
                }

                var buyerRequestedKwh = buyListingDto.RequestedKwh;

                var availableKwh = sellerListing.TotalGeneratedKwh - sellerListing.ConsumedKwh;

                if (availableKwh < buyerRequestedKwh)
                {
                    return new ApiResponse
                    {
                        StatusCode = 400,
                        Message = $"The requested energy {buyerRequestedKwh}kwh is more than the available energy {availableKwh}kwh",
                        Data = new { }
                    };
                }

                var amount = sellerListing.PricePerKwh * buyerRequestedKwh;
                var platformFee = amount/100;
                var status = TransactionStatus.PendingPayment;

                var transactionDto = new CreateTransactionDto
                {
                    TotalAmount = amount,
                    PricePerKwhSnapshot = sellerListing.PricePerKwh,
                    RequestedKwh = buyListingDto.RequestedKwh,
                    DeliveredKwh = 0,
                    PaymentReference = "",
                    PlatformFee = platformFee,
                };

                var createTransaction = await _transactionRepository.CreateTransactionAsync(transactionDto, sellerId, buyerId, status);

                if (createTransaction == null)
                {
                    return new ApiResponse
                    {
                        StatusCode = 500,
                        Message = "An error occured while creating transaction",
                        Data = new { }
                    };
                }

                return new ApiResponse
                {
                    StatusCode = 200,
                    Message = "Transaction Created Successfully",
                    Data = createTransaction
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Create Transaction failed");
                return new ApiResponse
                {
                    StatusCode = 500,
                    Message = "An internal server error occurred.",
                };
            }
        }

        public async Task<ApiResponse> ConfirmPaymentAsync(int listingId, Guid transactionId, string paymentReference)
        {
            try
            {
                var transaction = await _transactionRepository.GetTransactionByIdAsync(transactionId);

                if (transaction == null)
                {
                    return new ApiResponse
                    {
                        StatusCode = 404,
                        Message = "Transaction not found",
                        Data = new {}
                    };
                }

                var transactionByPaymentReference = await _transactionRepository.GetTransactionByPaymentReference(paymentReference);

                if (transactionByPaymentReference != null)
                {
                    return new ApiResponse
                    {
                        StatusCode = 400,
                        Message = "Payment reference already exists",
                        Data = new { }
                    };
                }

                if (transaction.Status != TransactionStatus.PendingPayment)
                {
                    return new ApiResponse
                    {
                        StatusCode = 500,
                        Message = "An error occurred while paying for energy listing",
                        Data = new { }
                    };
                }

                var listing = await _listingRepository.GetListingByIdAsync(listingId);

                if(listing == null)
                {
                    return new ApiResponse
                    {
                        StatusCode = 404,
                        Message = "Energy listing not found",
                        Data = new { }
                    };
                }

                var availableKwh = listing.TotalGeneratedKwh - listing.ConsumedKwh;

                if(availableKwh < transaction.RequestedKwh)
                {
                    return new ApiResponse
                    {
                        StatusCode = 400,
                        Message = $"The requested energy {transaction.RequestedKwh}kwh is more than the available energy {availableKwh}kwh",
                        Data = new { }
                    };

                }

                decimal newConsumedKwh = listing.ConsumedKwh + transaction.RequestedKwh;

                var updateAvailableKwhInListing = await _meterRepository.UpdateMeterConsumedKwhAsync(listing.MeterId, newConsumedKwh);

                if (updateAvailableKwhInListing == false)
                {
                    return new ApiResponse
                    {
                        StatusCode = 404,
                        Message = "Energy listing not found",
                        Data = new { }
                    };
                }

                transaction.Status = TransactionStatus.Paid;

                transaction.Status = TransactionStatus.EnergyLocked;

                var confirmPaymentDto = new ConfirmPaymentDto
                {
                    Status = transaction.Status,
                    PaymentReference = paymentReference
                };

                var paymentConfirmed = await _transactionRepository.ConfirmPaymentAsync(transactionId, confirmPaymentDto);

                if (paymentConfirmed == false)
                {
                    return new ApiResponse
                    {
                        StatusCode = 404,
                        Message = "Transaction not found",
                        Data = new { }
                    };
                }

                var energyLog = new CreateEnergyLogDto
                {
                    DeliveredKwh = 0
                };

                var createdEnergyLog = await _energyLogService.CreateEnergyLogAsync(energyLog, transactionId);

                if (createdEnergyLog == null)
                {
                    return new ApiResponse
                    {
                        StatusCode = 500,
                        Message = "An error occurred while logging energy",
                        Data = new {}
                    };
                }

                return new ApiResponse
                {
                    StatusCode = 200,
                    Message = "Confirm payment for transaction success",
                    Data = paymentConfirmed
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Confirm payment for transaction failed");
                return new ApiResponse
                {
                    StatusCode = 500,
                    Message = "An internal server error occurred.",
                };
            }
        }

        public async Task<ApiResponse> GetAllTransactionsAsync(QueryObjectForTransaction queryObject)
        {
            try
            {
                var transactions = await _transactionRepository.GetAllTransactionsAsync(queryObject);

                if(!transactions.Any())
                {
                    return new ApiResponse
                    {
                        StatusCode = 200,
                        Message = "No transactions have taken place.",
                        Data = new { }
                    };
                }

                return new ApiResponse
                {
                    StatusCode = 200,
                    Message = "All transactions gotten successfully.",
                    Data = transactions
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get all transactions failed");
                return new ApiResponse
                {
                    StatusCode = 500,
                    Message = "An internal server error occurred.",
                };
            }
        }

        public async Task<ApiResponse> GetTransactionByBuyerIdAsync(int buyerId)
        {
            try
            {
                var transactions = await _transactionRepository.GetTransactionByBuyerIdAsync(buyerId);

                if (transactions == null)
                {
                    return new ApiResponse
                    {
                        StatusCode = 404,
                        Message = "Buyer does not exist.",
                        Data = new { }
                    };
                }

                return new ApiResponse
                {
                    StatusCode = 200,
                    Message = "Buyer transactions gotten successfully.",
                    Data = transactions
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get transactions by buyer Id failed");
                return new ApiResponse
                {
                    StatusCode = 500,
                    Message = "An internal server error occurred.",
                };
            }
        }

        public async Task<ApiResponse> GetTransactionByIdAsync(Guid Id)
        {
            try
            {
                var transaction = await _transactionRepository.GetTransactionByIdAsync(Id);

                if (transaction == null)
                {
                    return new ApiResponse
                    {
                        StatusCode = 404,
                        Message = "Transaction does not exist.",
                        Data = new { }
                    };
                }

                return new ApiResponse
                {
                    StatusCode = 200,
                    Message = "Transaction gotten successfully.",
                    Data = transaction
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get transaction by Id failed");
                return new ApiResponse
                {
                    StatusCode = 500,
                    Message = "An internal server error occurred.",
                };
            }
        }

        public async Task<ApiResponse> GetTransactionBySellerIdAsync(int sellerId)
        {
            try
            {
                var transactions = await _transactionRepository.GetTransactionBySellerIdAsync(sellerId);

                if (transactions == null)
                {
                    return new ApiResponse
                    {
                        StatusCode = 404,
                        Message = "Seller does not exist.",
                        Data = new { }
                    };
                }

                return new ApiResponse
                {
                    StatusCode = 200,
                    Message = "Seller transactions gotten successfully.",
                    Data = transactions
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get all transactions by seller Id failed");
                return new ApiResponse
                {
                    StatusCode = 500,
                    Message = "An internal server error occurred.",
                };
            }
        }

        public async Task<ApiResponse> GetTransactionByUserIdAsync(int userId)
        {
            try
            {
                var transactions = await _transactionRepository.GetTransactionByUserIdAsync(userId);

                if (transactions == null)
                {
                    return new ApiResponse
                    {
                        StatusCode = 404,
                        Message = "The user does not exist.",
                        Data = new { }
                    };
                }

                return new ApiResponse
                {
                    StatusCode = 200,
                    Message = "All transactions performed by User gotten successfully.",
                    Data = transactions
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get transactions by user Id failed");
                return new ApiResponse
                {
                    StatusCode = 500,
                    Message = "An internal server error occurred.",
                };
            }
        }

        public async Task<ApiResponse> GetTransactionByPaymentReferenceAsync(string paymentReference)
        {
            try
            {
                var transaction = await _transactionRepository.GetTransactionByPaymentReference(paymentReference);

                if (transaction == null)
                {
                    return new ApiResponse
                    {
                        StatusCode = 404,
                        Message = "Transaction does not exist.",
                        Data = new { }
                    };
                }

                return new ApiResponse
                {
                    StatusCode = 200,
                    Message = "Transaction gotten by payment reference successful.",
                    Data = transaction
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get transactions by payment reference failed");
                return new ApiResponse
                {
                    StatusCode = 500,
                    Message = "An internal server error occurred.",
                };
            }
        }

        public async Task<ApiResponse> GetRequestedKwhInTransactionByIdAsync(Guid transactionId)
        {
            try
            {
                var requestedKwh = await _transactionRepository.GetRequestedKwhInTransactionById(transactionId);

                if (requestedKwh == null)
                {
                    return new ApiResponse
                    {
                        StatusCode = 404,
                        Message = "Transaction does not exist.",
                        Data = new { }
                    };
                }

                return new ApiResponse
                {
                    StatusCode = 200,
                    Message = "Available Kwh in Transaction successfully gotten.",
                    Data = requestedKwh
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get Available Kwh in Transaction failed.");
                return new ApiResponse
                {
                    StatusCode = 500,
                    Message = "An internal server error occurred.",
                };
            }
        }

        public async Task<ApiResponse> UpdateTransactionDeliveredKwh(Guid transactionId, decimal deliveredKwh)
        {
            try
            {
                var transactions = await _transactionRepository.UpdateTransactionDeliveredKwh(transactionId, deliveredKwh);

                if (transactions == false)
                {
                    return new ApiResponse
                    {
                        StatusCode = 404,
                        Message = "Transaction does not exist.",
                        Data = new { }
                    };
                }

                return new ApiResponse
                {
                    StatusCode = 200,
                    Message = "Delivered Kwh in Transaction successfully updated.",
                    Data = transactions
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Update Delivered Kwh in Transaction failed.");
                return new ApiResponse
                {
                    StatusCode = 500,
                    Message = "An internal server error occurred.",
                };
            }
        }
    }
}
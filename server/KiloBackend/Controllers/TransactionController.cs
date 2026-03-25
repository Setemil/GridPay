using Kilo.DTOs.TransactionDto;
using Kilo.Helpers;
using Kilo.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Kilo.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TransactionController : ControllerBase
    {
        private readonly ITransactionService _transactionService;
        ILogger<TransactionController> _logger;
        public TransactionController(ITransactionService transactionService, ILogger<TransactionController> logger)
        {
            _transactionService = transactionService;
            _logger = logger;
            _logger.LogDebug("Nlog is integrated to Transaction Controller");
        }

        [HttpPost("CreateTransaction/{sellerId}/{buyerId}/{listingId}")]
        [EnableRateLimiting("ip-sliding")]
        public async Task<IActionResult> CreateTransaction([FromBody] BuyListingDto buyListingDto, [FromRoute] int sellerId, [FromRoute] int buyerId, [FromRoute] int listingId)
        {
            try
            {
                var createdTransaction = await _transactionService.CreateTransactionAsync(buyListingDto, sellerId, buyerId, listingId);

                if (createdTransaction.StatusCode == 200 || createdTransaction.StatusCode == 404)
                {
                    return Ok(createdTransaction);
                }
                else if (createdTransaction.StatusCode == 400)
                {
                    return BadRequest(createdTransaction);
                }
                else
                {
                    return StatusCode(500, createdTransaction);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Create Transaction failed");
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpPost("ConfirmPayment/{listingId:int}/{transactionId:Guid}/{paymentReference}")]
        [EnableRateLimiting("ip-sliding")]
        public async Task<IActionResult> ConfirmPayment([FromRoute]int listingId, [FromRoute]Guid transactionId, [FromRoute]string paymentReference)
        {
            try
            {
                var confirmedPayment = await _transactionService.ConfirmPaymentAsync(listingId, transactionId, paymentReference);

                if (confirmedPayment.StatusCode == 200 || confirmedPayment.StatusCode == 404)
                {
                    return Ok(confirmedPayment);
                }
                else if (confirmedPayment.StatusCode == 400)
                {
                    return BadRequest(confirmedPayment);
                }
                else
                {
                    return StatusCode(500, confirmedPayment);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Confirm Transaction failed");
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpGet("GetAllTransactions")]
        [EnableRateLimiting("ip-sliding")]
        public async Task<IActionResult> GetAllTransactions([FromQuery] QueryObjectForTransaction queryObject)
        {
            try
            {
                var transactions = await _transactionService.GetAllTransactionsAsync(queryObject);

                if (transactions.StatusCode == 200)
                {
                    return Ok(transactions);
                }
                else
                {
                    return StatusCode(500, transactions);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get all transactions failed");
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpGet("GetTransactionByBuyerId/{buyerId:int}")]
        [EnableRateLimiting("ip-sliding")]
        public async Task<IActionResult> GetTransactionByBuyerId([FromRoute] int buyerId)
        {
            try
            {
                var transactions = await _transactionService.GetTransactionByBuyerIdAsync(buyerId);

                if (transactions.StatusCode == 200 || transactions.StatusCode == 404)
                {
                    return Ok(transactions);
                }
                else if (transactions.StatusCode == 400)
                {
                    return BadRequest(transactions);
                }
                else
                {
                    return StatusCode(500, transactions);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get Transactions by buyer Id failed");
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpGet("GetTransactionById/{Id:guid}")]
        [EnableRateLimiting("ip-sliding")]
        public async Task<IActionResult> GetTransactionById([FromRoute] Guid Id)
        {
            try
            {
                var transaction = await _transactionService.GetTransactionByIdAsync(Id);

                if (transaction.StatusCode == 200 || transaction.StatusCode == 404)
                {
                    return Ok(transaction);
                }
                else if (transaction.StatusCode == 400)
                {
                    return BadRequest(transaction);
                }
                else
                {
                    return StatusCode(500, transaction);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get Transactions by Id failed");
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpGet("GetTransactionBySellerId/{sellerId:Int}")]
        [EnableRateLimiting("ip-sliding")]
        public async Task<IActionResult> GetTransactionBySellerId([FromRoute] int sellerId)
        {
            try
            {
                var transactions = await _transactionService.GetTransactionBySellerIdAsync(sellerId);

                if (transactions.StatusCode == 200 || transactions.StatusCode == 404)
                {
                    return Ok(transactions);
                }
                else if (transactions.StatusCode == 400)
                {
                    return BadRequest(transactions);
                }
                else
                {
                    return StatusCode(500, transactions);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get Transactions by seller Id failed");
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpGet("GetTransactionByUserId/{userId:int}")]
        [EnableRateLimiting("ip-sliding")]
        public async Task<IActionResult> GetTransactionByUserId([FromRoute] int userId)
        {
            try
            {
                var transactions = await _transactionService.GetTransactionByUserIdAsync(userId);

                if (transactions.StatusCode == 200 || transactions.StatusCode == 404)
                {
                    return Ok(transactions);
                }
                else if (transactions.StatusCode == 400)
                {
                    return BadRequest(transactions);
                }
                else
                {
                    return StatusCode(500, transactions);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get Transactions by user Id failed");
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpGet("GetTransactionByPaymentReference/{paymentReference}")]
        [EnableRateLimiting("ip-sliding")]
        public async Task<IActionResult> GetTransactionByPaymentReference(string paymentReference)
        {
            try
            {
                var transaction = await _transactionService.GetTransactionByPaymentReferenceAsync(paymentReference);

                if (transaction.StatusCode == 200 || transaction.StatusCode == 404)
                {
                    return Ok(transaction);
                }
                else if (transaction.StatusCode == 400)
                {
                    return BadRequest(transaction);
                }
                else
                {
                    return StatusCode(500, transaction);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get Transactions by payment reference failed");
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpGet("GetRequestedKwhInTransactionById/{transactionId:guid}")]
        [EnableRateLimiting("ip-sliding")]
        public async Task<IActionResult> GetRequestedKwhInTransactionById([FromRoute] Guid transactionId)
        {
            try
            {
                var requestedKwh = await _transactionService.GetRequestedKwhInTransactionByIdAsync(transactionId);

                if (requestedKwh.StatusCode == 200 || requestedKwh.StatusCode == 404)
                {
                    return Ok(requestedKwh);
                }
                else if (requestedKwh.StatusCode == 400)
                {
                    return BadRequest(requestedKwh);
                }
                else
                {
                    return StatusCode(500, requestedKwh);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get Requested kwh in transaction by Transaction Id failed");
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpPost("UpdateTransactionDeliveredKwh/{transactionId:guid}/{deliveredKwh:decimal}")]
        [EnableRateLimiting("ip-sliding")]
        public async Task<IActionResult> UpdateTransactionDeliveredKwh([FromRoute] Guid transactionId, [FromRoute]decimal deliveredKwh)
        {
            try
            {
                var updatedDeliveredKwh = await _transactionService.UpdateTransactionDeliveredKwh(transactionId, deliveredKwh);

                if (updatedDeliveredKwh.StatusCode == 200 || updatedDeliveredKwh.StatusCode == 404)
                {
                    return Ok(updatedDeliveredKwh);
                }
                else if (updatedDeliveredKwh.StatusCode == 400)
                {
                    return BadRequest(updatedDeliveredKwh);
                }
                else
                {
                    return StatusCode(500, updatedDeliveredKwh);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Update Delivered kwh in transaction by Transaction Id failed");
                return StatusCode(500, "An internal server error occurred.");
            }
        }
    }
}
using Kilo.Data;
using Kilo.DTOs.ListingDto;
using Kilo.DTOs.TransactionDto;
using Kilo.Helpers;
using Kilo.Interfaces;
using Kilo.Mappers;
using Kilo.Models;
using Microsoft.EntityFrameworkCore;

namespace Kilo.Repository
{
    public class TransactionRepository : ITransactionRepository
    {
        private readonly ApplicationDbContext _context;

        public TransactionRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Transaction> CreateTransactionAsync(CreateTransactionDto transactionDto, int sellerId, int buyerId, TransactionStatus status)
        {
            var transaction = new Transaction
            {
                BuyerId = buyerId,
                SellerId = sellerId,
                TotalAmount = transactionDto.TotalAmount,
                Status = status,
                PricePerKwhSnapshot = transactionDto.PricePerKwhSnapshot,
                RequestedKwh = transactionDto.RequestedKwh,
                DeliveredKwh = transactionDto.DeliveredKwh,
                PaymentReference = transactionDto.PaymentReference,
                PlatformFee = transactionDto.PlatformFee,
            };

            await _context.Transactions.AddAsync(transaction);
            await _context.SaveChangesAsync();

            return transaction;
        }

        public async Task<ICollection<GetTransactionDto>> GetAllTransactionsAsync(QueryObjectForTransaction queryObject)
        {
            var transactions = _context.Transactions.AsQueryable();

            if (queryObject.Status.HasValue)
            {
                transactions = transactions.Where(s => s.Status == queryObject.Status.Value);
            }

            return await transactions
                .Select(t => new GetTransactionDto
                {
                    Id = t.Id,
                    BuyerId = t.Buyer.ExternalId,
                    SellerId = t.Seller.ExternalId,
                    Status = t.Status,
                    TotalAmount = t.TotalAmount,
                    PricePerKwhSnapshot = t.PricePerKwhSnapshot,
                    RequestedKwh = t.RequestedKwh,
                    DeliveredKwh = t.DeliveredKwh,
                    PaymentReference = t.PaymentReference,
                    PlatformFee = t.PlatformFee,
                    CreatedAt = t.CreatedAt,
                })
                .ToListAsync();
        }

        public async Task<ICollection<GetTransactionDto>> GetTransactionByBuyerIdAsync(int buyerId)
        {
            var transaction = await _context.Transactions.Where(x => x.BuyerId == buyerId).Select(s => s.ToGetTransactionDtoFromTransaction()).ToListAsync();

            return transaction;
        }

        public async Task<GetTransactionDto> GetTransactionByIdAsync(Guid Id)
        {
            var transaction = await _context.Transactions.FirstOrDefaultAsync(x => x.Id == Id);

            if (transaction == null) return null;

            var transactionDto = TransactionMapper.ToGetTransactionDtoFromTransaction(transaction);

            return transactionDto;
        }

        public async Task<ICollection<GetTransactionDto>> GetTransactionBySellerIdAsync(int sellerId)
        {
            var transaction = await _context.Transactions.Where(x => x.SellerId == sellerId).Select(s => s.ToGetTransactionDtoFromTransaction()).ToListAsync(); ;

            return transaction;
        }

        public async Task<ICollection<GetTransactionDto>> GetTransactionByUserIdAsync(int userId)
        {
            var transaction = await _context.Transactions.Where(x => x.BuyerId == userId || x.SellerId == userId).Select(s => s.ToGetTransactionDtoFromTransaction()).ToListAsync(); 

            return transaction;
        }

        public async Task<bool> UpdateTransactionDeliveredKwh(Guid transactionId, decimal deliveredKwh)
        {
            var transaction = await _context.Transactions.FirstOrDefaultAsync(x => x.Id == transactionId);

            if (transaction == null) return false;

            transaction.DeliveredKwh = deliveredKwh;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ConfirmPaymentAsync(Guid id, ConfirmPaymentDto confirmPaymentDto)
        {
            var transaction = await _context.Transactions.FirstOrDefaultAsync(x => x.Id == id);
            if (transaction == null) return false;

            transaction.Status = confirmPaymentDto.Status;
            transaction.PaymentReference = confirmPaymentDto.PaymentReference; 

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<decimal?> GetRequestedKwhInTransactionById(Guid transactionId)
        {
            var requestedKwh = await _context.Transactions
                .Where(x => x.Id == transactionId)
                .Select(x => x.RequestedKwh)
                .FirstOrDefaultAsync();

            if (requestedKwh == null) return null;

            return requestedKwh;
        }

        public async Task<GetTransactionDto> GetTransactionByPaymentReference(string paymentReference)
        {
            var transaction = await _context.Transactions.FirstOrDefaultAsync(x => x.PaymentReference == paymentReference);

            if (transaction == null) return null;

            var transactionDto = TransactionMapper.ToGetTransactionDtoFromTransaction(transaction);

            return transactionDto;
        }
    }
}
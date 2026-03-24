using Kilo.DTOs.TransactionDto;
using Kilo.Helpers;
using Kilo.Models;

namespace Kilo.Interfaces
{
    public interface ITransactionRepository
    {
        Task<ICollection<GetTransactionDto>> GetAllTransactionsAsync(QueryObjectForTransaction queryObject);
        Task<ICollection<GetTransactionDto>> GetTransactionByUserIdAsync(int userId);
        Task<ICollection<GetTransactionDto>> GetTransactionBySellerIdAsync(int sellerId);
        Task<ICollection<GetTransactionDto>> GetTransactionByBuyerIdAsync(int buyerId);
        Task<GetTransactionDto> GetTransactionByIdAsync(Guid Id);
        Task<GetTransactionDto> GetTransactionByPaymentReference(string paymentReference);
        Task<decimal?> GetRequestedKwhInTransactionById(Guid transactionId);
        Task<bool> UpdateTransactionDeliveredKwh(Guid transactionId, decimal deliveredKwh);
        Task<bool> ConfirmPaymentAsync(Guid id, ConfirmPaymentDto confirmPaymentDto);
        Task<Transaction> CreateTransactionAsync(CreateTransactionDto transactionDto, int sellerId, int buyerId, TransactionStatus status);
    }
}

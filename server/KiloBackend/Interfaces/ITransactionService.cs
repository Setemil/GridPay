using Kilo.DTOs.TransactionDto;
using Kilo.Helpers;
using Kilo.Models;
using Kilo.Response;

namespace Kilo.Interfaces
{
    public interface ITransactionService
    {
        Task<ApiResponse> GetAllTransactionsAsync(QueryObjectForTransaction queryObject);
        Task<ApiResponse> GetTransactionByUserIdAsync(int userId);
        Task<ApiResponse> GetTransactionBySellerIdAsync(int sellerId);
        Task<ApiResponse> GetTransactionByBuyerIdAsync(int buyerId);
        Task<ApiResponse> GetTransactionByIdAsync(Guid Id);
        Task<ApiResponse> GetRequestedKwhInTransactionByIdAsync(Guid transactionId);
        Task<ApiResponse> GetTransactionByPaymentReferenceAsync(string paymentReference);
        Task<ApiResponse> ConfirmPaymentAsync(int listingId, Guid transactionId, string paymentReference);
        Task<ApiResponse> UpdateTransactionDeliveredKwh(Guid transactionId, decimal deliveredKwh);
        Task<ApiResponse> UpdateTransactionStatus(Guid transactionId, TransactionStatus status);
        Task<ApiResponse> CreateTransactionAsync(BuyListingDto buyListingDto, int sellerId, int buyerId, int listingId);
    }
}

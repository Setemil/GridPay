using Kilo.DTOs.TransactionDto;
using Kilo.Models;

namespace Kilo.Mappers
{
    public static class TransactionMapper
    {
        public static GetTransactionDto ToGetTransactionDtoFromTransaction(this Transaction transactionModel)
        {
            return new GetTransactionDto
            {
                Id = transactionModel.Id,
                BuyerId = transactionModel.BuyerId,
                SellerId = transactionModel.SellerId,
                Status = transactionModel.Status,
                PricePerKwhSnapshot = transactionModel.PricePerKwhSnapshot,
                RequestedKwh = transactionModel.RequestedKwh,
                DeliveredKwh = transactionModel.DeliveredKwh,
                TotalAmount = transactionModel.TotalAmount,
                PaymentReference = transactionModel.PaymentReference,
                PlatformFee = transactionModel.PlatformFee,
                CreatedAt = transactionModel.CreatedAt,
            };
        }
    }
}

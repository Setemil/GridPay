using Kilo.Models;

namespace Kilo.DTOs.TransactionDto
{
    public class GetTransactionDto
    {
        public Guid Id { get; set; }

        public int BuyerId { get; set; }
        public int SellerId { get; set; }

        public decimal RequestedKwh { get; set; }
        public decimal DeliveredKwh { get; set; }
        public decimal PricePerKwhSnapshot { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal PlatformFee { get; set; }
        public TransactionStatus Status { get; set; }
        public string PaymentReference { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}

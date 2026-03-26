using System.Transactions;

namespace Kilo.Models
{
    public enum TransactionStatus
    {
        PendingPayment,
        Paid,
        EnergyLocked,
        EnergyDeliveryFailed,
        Delivering,
        Completed,
        Failed,
        Refunded
    }

    public class Transaction
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public int BuyerId { get; set; }
        public User Buyer { get; set; }

        public int SellerId { get; set; }
        public User Seller { get; set; }

        public decimal RequestedKwh { get; set; }
        public decimal DeliveredKwh { get; set; }
        public decimal PricePerKwhSnapshot { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal PlatformFee { get; set; }
        public TransactionStatus Status { get; set; }
        public string PaymentReference { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<EnergyLog> EnergyLogs { get; set; }
    }
}

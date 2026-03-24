namespace Kilo.Models
{
    public class EnergyLog
    {
        public Guid Id { get; set; }
        public Guid TransactionId { get; set; }
        public Transaction Transaction { get; set; }
        public decimal DeliveredKwh { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}

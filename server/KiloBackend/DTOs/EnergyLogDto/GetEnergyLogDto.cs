namespace Kilo.DTOs.EnergyLogDto
{
    public class GetEnergyLogDto
    {
        public Guid Id { get; set; }
        public Guid TransactionId { get; set; }
        public decimal DeliveredKwh { get; set; }
        public DateTime Timestamp { get; set; }
    }
}
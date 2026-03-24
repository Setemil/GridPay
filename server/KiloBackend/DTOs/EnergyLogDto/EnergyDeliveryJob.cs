namespace Kilo.DTOs.EnergyLogDto
{
    public class EnergyDeliveryJob
    {
        public Guid TransactionId { get; set; }
        public decimal RequestedKwh { get; set; }
    }
}

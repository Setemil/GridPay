using Kilo.Models;

namespace Kilo.DTOs.MeterDto
{
    public class GetMeterDto
    {
        public int Id { get; set; }

        public int SellerId { get; set; }

        public string DeviceId { get; set; }

        public decimal TotalGeneratedKwh { get; set; }

        public decimal ConsumedKwh { get; set; }

        public bool IsActive { get; set; }

        public DateTime LastUpdated { get; set; }
    }
}

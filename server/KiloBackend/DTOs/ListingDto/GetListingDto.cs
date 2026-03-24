using Kilo.Models;

namespace Kilo.DTOs.ListingDto
{
    public class GetListingDto
    {
        public int Id { get; set; }
        public int SellerId { get; set; }
        public int MeterId { get; set; }
        public string Location { get; set; }
        public decimal PricePerKwh { get; set; }
        public decimal TotalGeneratedKwh { get; set; }
        public decimal ConsumedKwh { get; set; }
        public decimal AvailableKwh => TotalGeneratedKwh - ConsumedKwh;
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }
}

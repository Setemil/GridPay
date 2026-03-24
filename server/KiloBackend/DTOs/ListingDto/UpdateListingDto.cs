namespace Kilo.DTOs.ListingDto
{
    public class UpdateListingDto
    {
        public string Location { get; set; }
        public decimal PricePerKwh { get; set; }
        public bool IsActive { get; set; }
    }
}

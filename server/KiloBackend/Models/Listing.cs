using Kilo.Models;

public class Listing
{
    public int Id { get; set; }

    public int SellerId { get; set; }
    public User Seller { get; set; }

    public int MeterId { get; set; }
    public Meter Meter { get; set; }

    public decimal PricePerKwh { get; set; }

    public string Location { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public bool IsDeleted { get; set; } = false;

    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
}
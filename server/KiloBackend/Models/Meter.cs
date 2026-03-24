using Kilo.Models;
public class Meter
{
    public int Id { get; set; }

    public int SellerId { get; set; }
    public User Seller { get; set; }

    public string DeviceId { get; set; }

    public decimal TotalGeneratedKwh { get; set; }
    public decimal ConsumedKwh { get; set; }
    public bool IsActive { get; set; } = true;

    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
}
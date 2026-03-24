using System.ComponentModel.DataAnnotations;

namespace Kilo.DTOs.TransactionDto
{
    public class BuyListingDto
    {
        [Required]
        public decimal RequestedKwh { get; set; }
    }
}

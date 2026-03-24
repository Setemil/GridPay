using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Kilo.Models
{
    public enum UserRole
    {
        User,
        Admin
    }

    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int ExternalId { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public UserRole Role { get; set; }
        public ICollection<Listing> Listings { get; set; }
        public ICollection<Transaction> BuyerTransactions { get; set; }
        public ICollection<Transaction> SellerTransactions { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

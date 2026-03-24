using Kilo.Models;
using System.ComponentModel.DataAnnotations;

namespace Kilo.DTOs.TransactionDto
{
    public class ConfirmPaymentDto
    {
        [Required]
        public TransactionStatus Status { get; set; }

        [Required]
        public string PaymentReference { get; set; }
    }
}

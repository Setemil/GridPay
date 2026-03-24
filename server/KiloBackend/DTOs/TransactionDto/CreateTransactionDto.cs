namespace Kilo.DTOs.TransactionDto
{
    public class CreateTransactionDto
    {
        public decimal RequestedKwh { get; set; }
        public decimal DeliveredKwh { get; set; }
        public decimal PricePerKwhSnapshot { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal PlatformFee { get; set; }
        public string PaymentReference { get; set; }
    }
}

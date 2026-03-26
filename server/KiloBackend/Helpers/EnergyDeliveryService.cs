using Kilo.DTOs.EnergyLogDto;
using Kilo.Interfaces;

public class EnergyDeliveryService
{
    private readonly IServiceScopeFactory _scopeFactory;

    public EnergyDeliveryService(IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    public async Task StartDelivery(Guid transactionId, decimal requestedKwh)
    {
        using var scope = _scopeFactory.CreateScope();

        var energyLogRepo = scope.ServiceProvider.GetRequiredService<IEnergyLogRepository>();
        var transactionRepo = scope.ServiceProvider.GetRequiredService<ITransactionRepository>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<EnergyDeliveryService>>();

        decimal deliveredKwh = 0;

        try { 

            while (deliveredKwh < requestedKwh)
            {
                await Task.Delay(TimeSpan.FromSeconds(10));

                var generated = Math.Round((decimal)Random.Shared.NextDouble() * 3, 2);
                var actualGenerated = Math.Min(generated, requestedKwh - deliveredKwh);

                deliveredKwh += actualGenerated;

                await energyLogRepo.CreateEnergyLogAsync(
                    new CreateEnergyLogDto
                    {
                        DeliveredKwh = actualGenerated
                    },
                    transactionId);

                await transactionRepo.UpdateTransactionDeliveredKwh(transactionId, deliveredKwh);
            }

            await transactionRepo.UpdateTransactionStatus(transactionId, Kilo.Models.TransactionStatus.Completed);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Background Energy Delivery failed for Transaction: {TransactionId}", transactionId);

            try
            {
                await transactionRepo.UpdateTransactionStatus(transactionId, Kilo.Models.TransactionStatus.EnergyDeliveryFailed);
            }
            catch (Exception finalEx)
            {
                logger.LogCritical(finalEx, "CRITICAL: Could not update Transaction {Id} to 'Failed' status. The database might be unreachable.", transactionId);
            }
        }
    }
}
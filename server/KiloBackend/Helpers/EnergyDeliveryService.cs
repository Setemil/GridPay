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

        decimal deliveredKwh = 0;

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
    }
}
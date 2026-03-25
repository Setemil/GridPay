using Kilo.DTOs.MeterDto;
using Kilo.Interfaces;

namespace Kilo.Helpers
{
    public class SurplusBackgroundService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;

        private string _lastUpdatedPeriod = "";

        public SurplusBackgroundService(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                var currentPeriod = GetTimePeriod();

                // Prevent duplicate updates in same period
                if (currentPeriod != _lastUpdatedPeriod)
                {
                    await UpdateMetersAsync(currentPeriod);
                    _lastUpdatedPeriod = currentPeriod;
                }

                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }
        }

        private async Task UpdateMetersAsync(string period)
        {
            using var scope = _scopeFactory.CreateScope();

            var meterRepo = scope.ServiceProvider.GetRequiredService<IMeterRepository>();

            var meters = await meterRepo.GetAllMetersRawAsync(); 

            foreach (var meter in meters)
            {
                var generated = GenerateBasedOnPeriod(period);
                var consumed = Math.Min(GenerateConsumption(), generated);

                var updateMeterDto = new UpdateMeterDto
                {
                    ConsumedKwh = consumed,
                    TotalGeneratedKwh = generated,
                };

                await meterRepo.UpdateMeterAsync(meter.Id, updateMeterDto);
            }
        }

        private string GetTimePeriod()
        {
            var hour = DateTime.Now.Hour;

            if (hour >= 6 && hour <= 9)
                return "Morning";

            if (hour >= 10 && hour <= 15)
                return "Afternoon";

            if (hour >= 16 && hour <= 18)
                return "Evening";

            return "Night";
        }

        private decimal GenerateBasedOnPeriod(string period)
        {
            return period switch
            {
                "Morning" => Random.Shared.Next(10, 25),
                "Afternoon" => Random.Shared.Next(40, 70),
                "Evening" => Random.Shared.Next(20, 35),
                _ => 0
            };
        }

        private decimal GenerateConsumption()
        {
            return Random.Shared.Next(5, 30);
        }
    }
}
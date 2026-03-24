using Kilo.DTOs.EnergyLogDto;
using Kilo.Models;

namespace Kilo.Mappers
{
    public static class EnergyLogMapper
    {
        public static GetEnergyLogDto ToGetEnergyLogDtoFromEnergyLog(this EnergyLog energyLogModel)
        {
            return new GetEnergyLogDto
            {
                Id = energyLogModel.Id,
                TransactionId = energyLogModel.TransactionId,
                DeliveredKwh = energyLogModel.DeliveredKwh,
                Timestamp = energyLogModel.Timestamp,
            };
        }
    }
}

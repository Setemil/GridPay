using Kilo.DTOs.MeterDto;
using Kilo.Models;

namespace Kilo.Mappers
{
    public static class MeterMapper
    {
        public static GetMeterDto ToGetMeterDtoFromMeter(this Meter meterModel)
        {
            return new GetMeterDto
            {
                Id = meterModel.Id,
                ConsumedKwh = meterModel.ConsumedKwh,
                DeviceId = meterModel.DeviceId,
                IsActive = meterModel.IsActive,
                SellerId = meterModel.SellerId,
                TotalGeneratedKwh = meterModel.TotalGeneratedKwh,
                LastUpdated = meterModel.LastUpdated,
            };
        }
    }
}

using Kilo.DTOs.MeterDto;
using Kilo.Models;
using Kilo.DTOs.UserDto;

namespace Kilo.Interfaces
{
    public interface IMeterRepository 
    {
        Task<ICollection<GetMeterDto>> GetAllMetersAsync();
        Task<ICollection<Meter>> GetAllMetersRawAsync();
        Task<ICollection<GetMeterDto>> GetAllMetersBySellerIdAsync(int sellerId);
        Task<GetMeterDto> GetMeterByDeviceIdAsync(string deviceId);
        Task<GetMeterDto> GetMeterByIdAsync(int id);
        Task<GetMeterDto> CreateMeterAsync(int sellerId, CreateMeterDto meterDto);
        Task<bool> UpdateMeterAsync(int id, UpdateMeterDto meterDto);
        Task<bool> UpdateMeterConsumedKwhAsync(int id, decimal consumedKwh);
        Task<bool> UpdateMeterByIsActiveAsync(int id, bool isActive);
    }
}

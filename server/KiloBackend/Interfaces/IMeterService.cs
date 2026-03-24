using Kilo.DTOs.MeterDto;
using Kilo.Response;

namespace Kilo.Interfaces
{
    public interface IMeterService
    {
        Task<ApiResponse> GetAllMetersAsync();
        Task<ApiResponse> GetMeterByDeviceIdAsync(string deviceId);
        Task<ApiResponse> GetMeterByIdAsync(int id);
        Task<ApiResponse> GetAllMetersBySellerIdAsync(int sellerId);
        Task<ApiResponse> CreateMeterAsync(int sellerId, CreateMeterDto meterDto);
    }
}

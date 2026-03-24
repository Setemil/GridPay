using Kilo.DTOs.EnergyLogDto;
using Kilo.Response;

namespace Kilo.Interfaces
{
    public interface IEnergyLogService
    {
        Task<ApiResponse> GetAllEnergyLogsAsync();
        Task<ApiResponse> GetEnergyLogsByTransactionIdAsync(Guid transactionId);
        Task<ApiResponse> GetEnergyLogByIdAsync(Guid Id);
        Task<ApiResponse> CreateEnergyLogAsync(CreateEnergyLogDto energyLogDto, Guid transactionId);
    }
}
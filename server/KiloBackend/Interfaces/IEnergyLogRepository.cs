using Kilo.DTOs.EnergyLogDto;
using Kilo.Models;

namespace Kilo.Interfaces
{
    public interface IEnergyLogRepository
    {
        Task<ICollection<GetEnergyLogDto>> GetAllEnergyLogsAsync();
        Task<ICollection<GetEnergyLogDto>> GetEnergyLogsByTransactionIdAsync(Guid transactionId);
        Task<GetEnergyLogDto> GetEnergyLogByIdAsync(Guid Id);
        Task<EnergyLog> CreateEnergyLogAsync(CreateEnergyLogDto energyLogDto, Guid transactionId);
    }
}

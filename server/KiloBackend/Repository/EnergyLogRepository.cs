using Kilo.Data;
using Kilo.DTOs.EnergyLogDto;
using Kilo.Interfaces;
using Kilo.Mappers;
using Kilo.Models;
using Microsoft.EntityFrameworkCore;

namespace Kilo.Repository
{
    public class EnergyLogRepository : IEnergyLogRepository
    {
        private readonly ApplicationDbContext _context;
        public EnergyLogRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<EnergyLog> CreateEnergyLogAsync(CreateEnergyLogDto energyLogDto, Guid transactionId)
        {
            var energyLog = new EnergyLog
            {
                TransactionId = transactionId,
                DeliveredKwh = energyLogDto.DeliveredKwh,
            };

            await _context.EnergyLogs.AddAsync(energyLog);
            await _context.SaveChangesAsync();

            return energyLog;
        }

        public async Task<ICollection<GetEnergyLogDto>> GetAllEnergyLogsAsync()
        {
            var energyLogs = await _context.EnergyLogs.Select(s => s.ToGetEnergyLogDtoFromEnergyLog()).ToListAsync();

            return energyLogs;
        }

        public async Task<GetEnergyLogDto> GetEnergyLogByIdAsync(Guid Id)
        {
            var energyLog = await _context.EnergyLogs.FirstOrDefaultAsync(x => x.Id == Id);

            if (energyLog == null) return null;

            var energyLogDto = EnergyLogMapper.ToGetEnergyLogDtoFromEnergyLog(energyLog);

            return energyLogDto;
        }

        public async Task<ICollection<GetEnergyLogDto>> GetEnergyLogsByTransactionIdAsync(Guid transactionId)
        {
            var energyLogs = await _context.EnergyLogs.Where(x => x.TransactionId == transactionId).Select(s => s.ToGetEnergyLogDtoFromEnergyLog()).ToListAsync();

            return energyLogs;
        }
    }
}

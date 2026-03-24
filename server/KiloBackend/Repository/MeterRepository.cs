using Kilo.Data;
using Kilo.DTOs.MeterDto;
using Kilo.Interfaces;
using Kilo.Mappers;
using Microsoft.EntityFrameworkCore;

namespace Kilo.Repository
{
    public class MeterRepository : IMeterRepository
    {
        private readonly ApplicationDbContext _context;
        public MeterRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<GetMeterDto> CreateMeterAsync(int sellerId, CreateMeterDto meterDto)
        {
            var meter = new Meter
            {
                SellerId = sellerId,
                DeviceId = meterDto.DeviceId,
            };

            await _context.Meters.AddAsync(meter);
            await _context.SaveChangesAsync();

            var createdMeter = await _context.Meters.FirstOrDefaultAsync(x => x.DeviceId == meter.DeviceId);

            var createdMeterDto = MeterMapper.ToGetMeterDtoFromMeter(createdMeter);

            return createdMeterDto;
        }

        public async Task<ICollection<GetMeterDto>> GetAllMetersAsync()
        {
            var meters = await _context.Meters.Select(s => s.ToGetMeterDtoFromMeter()).ToListAsync();

            return meters;
        }

        public async Task<ICollection<GetMeterDto>> GetAllMetersBySellerIdAsync(int sellerId)
        {
            var meters = await _context.Meters.Where(x => x.SellerId == sellerId).Select(s => s.ToGetMeterDtoFromMeter()).ToListAsync();

            if (meters == null)
            {
                return null;
            }

            return meters;
        }

        public async Task<ICollection<Meter>> GetAllMetersRawAsync()
        {
            var meters = await _context.Meters.ToListAsync();

            return meters;
        }

        public async Task<GetMeterDto> GetMeterByDeviceIdAsync(string deviceId)
        {
            var meter = await _context.Meters.FirstOrDefaultAsync(x => x.DeviceId == deviceId);

            if (meter == null)
            {
                return null;
            }

            var meterDto = MeterMapper.ToGetMeterDtoFromMeter(meter);

            return meterDto;
        }

        public async Task<GetMeterDto> GetMeterByIdAsync(int id)
        {
            var meter = await _context.Meters.FirstOrDefaultAsync(x => x.Id == id);

            if (meter == null)
            {
                return null;
            }

            var meterDto = MeterMapper.ToGetMeterDtoFromMeter(meter);

            return meterDto;
        }

        public async Task<bool> UpdateMeterAsync(int id, UpdateMeterDto meterDto)
        {
            var meter = await _context.Meters.FirstOrDefaultAsync(x => x.Id == id);

            if (meter == null)
            {
                return false;
            }

            meter.TotalGeneratedKwh = meterDto.TotalGeneratedKwh;
            meter.ConsumedKwh = meterDto.ConsumedKwh;
            meter.LastUpdated = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> UpdateMeterByIsActiveAsync(int id, bool isActive)
        {
            var meter = await _context.Meters.FirstOrDefaultAsync(x => x.Id == id);

            if (meter == null)
            {
                return false;
            }

            meter.IsActive = isActive;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> UpdateMeterConsumedKwhAsync(int id, decimal consumedKwh)
        {
            var meter = await _context.Meters.FirstOrDefaultAsync(x => x.Id == id);

            if (meter == null)
            {
                return false;
            }

            meter.ConsumedKwh = consumedKwh;

            await _context.SaveChangesAsync();

            return true;
        }
    }
}

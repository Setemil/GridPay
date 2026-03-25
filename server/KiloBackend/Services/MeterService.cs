using Kilo.DTOs.MeterDto;
using Kilo.Interfaces;
using Kilo.Repository;
using Kilo.Response;

namespace Kilo.Services
{
    public class MeterService : IMeterService
    {
        private readonly IMeterRepository _meterRepository;
        private readonly ILogger<MeterService> _logger;
        public MeterService(IMeterRepository meterRepository, ILogger<MeterService> logger)
        {
            _meterRepository = meterRepository;
            _logger = logger;
            _logger.LogDebug("Nlog is integrated to Meter Service");
        }

        public async Task<ApiResponse> CreateMeterAsync(int sellerId, CreateMeterDto meterDto)
        {
            try
            {
                var createdMeter = await _meterRepository.CreateMeterAsync(sellerId, meterDto);

                if (createdMeter == null)
                {
                    return new ApiResponse
                    {
                        StatusCode = 500,
                        Message = "An error occurred while creating meter",
                        Data = new { }
                    };
                }

                //seeding generated and consumed kwh for simulation
                decimal totalGeneratedKwh = Random.Shared.Next(10, 30);
                decimal consumedKwh = Random.Shared.Next(5, 15);

                var updateMeterDto = new UpdateMeterDto
                {
                    TotalGeneratedKwh = Random.Shared.Next(10, 30),
                    ConsumedKwh = Math.Min(consumedKwh, totalGeneratedKwh)
                };

                var updateMeter = await _meterRepository.UpdateMeterAsync(createdMeter.Id, updateMeterDto);

                if (updateMeter == false)
                {
                    return new ApiResponse
                    {
                        StatusCode = 404,
                        Message = "Meter does not exist",
                        Data = new { }
                    };
                }

                return new ApiResponse
                {
                    StatusCode = 200,
                    Message = "Meter Created Successfully",
                    Data = createdMeter
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Create Meter failed");
                return new ApiResponse
                {
                    StatusCode = 500,
                    Message = "An internal server error occurred.",
                };
            }
        }

        public async Task<ApiResponse> GetAllMetersAsync()
        {
            try
            {
                var allMeters = await _meterRepository.GetAllMetersAsync();
                if (!allMeters.Any())
                {
                    return new ApiResponse
                    {
                        StatusCode = 200,
                        Message = "You currently do not have any meters",
                        Data = allMeters
                    };
                }

                return new ApiResponse
                {
                    StatusCode = 200,
                    Message = "All meters gotten Successfully",
                    Data = allMeters
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get All Meters failed");
                return new ApiResponse
                {
                    StatusCode = 500,
                    Message = "An internal server error occurred.",
                };
            }
        }

        public async Task<ApiResponse> GetAllMetersBySellerIdAsync(int sellerId)
        {
            try
            {
                var meter = await _meterRepository.GetAllMetersBySellerIdAsync(sellerId);
                if (meter == null)
                {
                    return new ApiResponse
                    {
                        StatusCode = 404,
                        Message = "Seller's meter doesn't exist",
                        Data = new { }
                    };
                }

                return new ApiResponse
                {
                    StatusCode = 200,
                    Message = "Seller's meter gotten Successfully",
                    Data = meter
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get Meter by seller Id failed");
                return new ApiResponse
                {
                    StatusCode = 500,
                    Message = "An internal server error occurred.",
                };
            }
        }

        public async Task<ApiResponse> GetMeterByDeviceIdAsync(string deviceId)
        {
            try
            {
                var meter = await _meterRepository.GetMeterByDeviceIdAsync(deviceId);
                if (meter == null)
                {
                    return new ApiResponse
                    {
                        StatusCode = 404,
                        Message = "Meter doesn't exist",
                        Data = new { }
                    };
                }

                return new ApiResponse
                {
                    StatusCode = 200,
                    Message = "Meter gotten Successfully",
                    Data = meter
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get Meter by device Id failed");
                return new ApiResponse
                {
                    StatusCode = 500,
                    Message = "An internal server error occurred.",
                };
            }
        }

        public async Task<ApiResponse> GetMeterByIdAsync(int id)
        {
            try
            {
                var meter = await _meterRepository.GetMeterByIdAsync(id);
                if (meter == null)
                {
                    return new ApiResponse
                    {
                        StatusCode = 404,
                        Message = "Meter doesn't exist",
                        Data = new { }
                    };
                }

                return new ApiResponse
                {
                    StatusCode = 200,
                    Message = "Meter gotten Successfully",
                    Data = meter
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get Meter by Id failed");
                return new ApiResponse
                {
                    StatusCode = 500,
                    Message = "An internal server error occurred.",
                };
            }
        }
    }
}

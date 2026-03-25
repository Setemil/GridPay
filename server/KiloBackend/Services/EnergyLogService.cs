using Kilo.DTOs.EnergyLogDto;
using Kilo.Helpers;
using Kilo.Interfaces;
using Kilo.Repository;
using Kilo.Response;

namespace Kilo.Services
{
    public class EnergyLogService : IEnergyLogService
    {
        private readonly IEnergyLogRepository _energyLogRepository;
        private readonly ITransactionRepository _transactionRepository;
        private readonly EnergyDeliveryService _energyDeliveryService;
        private readonly ILogger<EnergyLogService> _logger;
        public EnergyLogService(IEnergyLogRepository energyLogRepository, ITransactionRepository transactionRepository, ILogger<EnergyLogService> logger, EnergyDeliveryService energyDeliveryService)
        {
            _energyLogRepository = energyLogRepository;
            _transactionRepository = transactionRepository;
            _energyDeliveryService = energyDeliveryService;
            _logger = logger;
            _logger.LogDebug("Nlog is integrated to EnergyLog Service");
        }

        public async Task<ApiResponse> CreateEnergyLogAsync(CreateEnergyLogDto energyLogDto, Guid transactionId)
        {
            try
            {
                var requestedKwh = await _transactionRepository.GetRequestedKwhInTransactionById(transactionId);

                if (requestedKwh == null)
                {
                    return new ApiResponse
                    {
                        StatusCode = 404,
                        Message = "Transaction does not exist.",
                        Data = new {}
                    };
                }

                _ = _energyDeliveryService.StartDelivery(transactionId, requestedKwh.Value);

                return new ApiResponse
                {
                    StatusCode = 200,
                    Message = "Energy delivery started."
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Create Energy Log failed");

                return new ApiResponse
                {
                    StatusCode = 500,
                    Message = "Internal server error"
                };
            }
        }

        public async Task<ApiResponse> GetAllEnergyLogsAsync()
        {
            try
            {
                var energyLogs = await _energyLogRepository.GetAllEnergyLogsAsync();

                if (!energyLogs.Any())
                {
                    return new ApiResponse
                    {
                        StatusCode = 200,
                        Message = "You do not have any energy logs.",
                        Data = new { }
                    };
                }

                return new ApiResponse
                {
                    StatusCode = 200,
                    Message = "All energy logs gotten successfully.",
                    Data = energyLogs
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get all Energy Logs failed");

                return new ApiResponse
                {
                    StatusCode = 500,
                    Message = "Internal server error"
                };
            }
        }

        public async Task<ApiResponse> GetEnergyLogByIdAsync(Guid Id)
        {
            try
            {
                var energyLog = await _energyLogRepository.GetEnergyLogByIdAsync(Id);

                if (energyLog == null)
                {
                    return new ApiResponse
                    {
                        StatusCode = 404,
                        Message = "Energy log does not exist.",
                        Data = new { }
                    };
                }

                return new ApiResponse
                {
                    StatusCode = 200,
                    Message = "Energy log gotten successfully.",
                    Data = energyLog
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get Energy Log by Id failed");

                return new ApiResponse
                {
                    StatusCode = 500,
                    Message = "Internal server error"
                };
            }
        }

        public async Task<ApiResponse> GetEnergyLogsByTransactionIdAsync(Guid transactionId)
        {
            try
            {
                var energyLogs = await _energyLogRepository.GetEnergyLogsByTransactionIdAsync(transactionId);

                if (energyLogs == null)
                {
                    return new ApiResponse
                    {
                        StatusCode = 404,
                        Message = "Energy logs under that transaction Id do not exist.",
                        Data = new { }
                    };
                }

                return new ApiResponse
                {
                    StatusCode = 200,
                    Message = "Get energy log by transaction Id successful.",
                    Data = energyLogs
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get all Energy Logs by transaction Id failed");

                return new ApiResponse
                {
                    StatusCode = 500,
                    Message = "Internal server error"
                };
            }
        }
    }
}
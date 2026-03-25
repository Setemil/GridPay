using Kilo.DTOs.EnergyLogDto;
using Kilo.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Kilo.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EnergyLogController : ControllerBase
    {
        private readonly IEnergyLogService _energyLogService;
        ILogger<EnergyLogController> _logger;
        public EnergyLogController(IEnergyLogService energyLogService, ILogger<EnergyLogController> logger)
        {
            _energyLogService = energyLogService;
            _logger = logger;
            _logger.LogDebug("Nlog is integrated to Energy Log Controller");
        }

        [HttpPost("CreateEnergyLog/{transactionId:guid}")]
        [EnableRateLimiting("ip-sliding")]
        public async Task<IActionResult> CreateEnergyLog(CreateEnergyLogDto energyLogDto, Guid transactionId)
        {
            try
            {
                var createdEnergyLog = await _energyLogService.CreateEnergyLogAsync(energyLogDto, transactionId);

                if (createdEnergyLog.StatusCode == 200 || createdEnergyLog.StatusCode == 404)
                {
                    return Ok(createdEnergyLog);
                }
                else
                {
                    return StatusCode(500, createdEnergyLog);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Create energy log failed");
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpGet("GetAllEnergyLogs")]
        [EnableRateLimiting("ip-sliding")]
        public async Task<IActionResult> GetAllEnergyLogs()
        {
            try
            {
                var energyLogs = await _energyLogService.GetAllEnergyLogsAsync();

                if (energyLogs.StatusCode == 200)
                {
                    return Ok(energyLogs);
                }
                else
                {
                    return StatusCode(500, energyLogs);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get all energy logs failed");
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpGet("GetEnergyLogById/{Id:guid}")]
        [EnableRateLimiting("ip-sliding")]
        public async Task<IActionResult> GetEnergyLogById([FromRoute] Guid Id)
        {
            try
            {
                var energyLog = await _energyLogService.GetEnergyLogByIdAsync(Id);

                if (energyLog.StatusCode == 200 || energyLog.StatusCode == 404)
                {
                    return Ok(energyLog);
                }
                else
                {
                    return StatusCode(500, energyLog);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get energy log by Id failed");
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpGet("GetEnergyLogsByTransactionId/{transactionId:guid}")]
        [EnableRateLimiting("ip-sliding")]
        public async Task<IActionResult> GetEnergyLogsByTransactionId(Guid transactionId)
        {
            try
            {
                var energyLogs = await _energyLogService.GetEnergyLogsByTransactionIdAsync(transactionId);

                if (energyLogs.StatusCode == 200 || energyLogs.StatusCode == 404)
                {
                    return Ok(energyLogs);
                }
                else
                {
                    return StatusCode(500, energyLogs);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get all energy logs by transaction Id failed");
                return StatusCode(500, "An internal server error occurred.");
            }
        }
    }
}

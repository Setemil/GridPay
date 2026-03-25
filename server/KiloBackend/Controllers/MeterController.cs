using Kilo.DTOs.MeterDto;
using Kilo.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Kilo.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MeterController : ControllerBase
    {
        private readonly IMeterService _meterService;
        ILogger<MeterController> _logger;
        public MeterController(IMeterService meterService, ILogger<MeterController> logger)
        {
            _meterService = meterService;
            _logger = logger;
            _logger.LogDebug("Nlog is integrated to Meter Controller");
        }

        [HttpGet("GetAllMeters")]
        [EnableRateLimiting("ip-sliding")]
        public async Task<IActionResult> GetAllMeters()
        {
            try
            {
                var meters = await _meterService.GetAllMetersAsync();

                if (meters.StatusCode == 200)
                {
                    return Ok(meters);
                }
                else
                {
                    return StatusCode(500, meters);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get all meters failed");
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpGet("GetAllMetersBysellerId")]
        [EnableRateLimiting("ip-sliding")]
        public async Task<IActionResult> GetAllMetersBySellerId([FromQuery] int sellerId)
        {
            try
            {
                var meters = await _meterService.GetAllMetersBySellerIdAsync(sellerId);

                if (meters.StatusCode == 200 || meters.StatusCode == 404)
                {
                    return Ok(meters);
                }
                else
                {
                    return StatusCode(500, meters);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get all meters by seller Id failed");
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpGet("GetMeterByDeviceId")]
        [EnableRateLimiting("ip-sliding")]
        public async Task<IActionResult> GetMeterByDeviceId([FromQuery] string deviceId)
        {
            try
            {
                var meter = await _meterService.GetMeterByDeviceIdAsync(deviceId);

                if (meter.StatusCode == 200 || meter.StatusCode == 404)
                {
                    return Ok(meter);
                }
                else
                {
                    return StatusCode(500, meter);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get meter by device Id failed");
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpGet("GetMeterById/{id:int}")]
        [EnableRateLimiting("ip-sliding")]
        public async Task<IActionResult> GetMeterById([FromRoute] int id)
        {
            try
            {
                var meter = await _meterService.GetMeterByIdAsync(id);

                if (meter.StatusCode == 200 || meter.StatusCode == 404)
                {
                    return Ok(meter);
                }
                else
                {
                    return StatusCode(500, meter);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get meter by Id failed");
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpPost("CreateMeter")]
        [EnableRateLimiting("ip-sliding")]
        public async Task<IActionResult> CreateMeter([FromQuery] int sellerId, [FromBody] CreateMeterDto meterDto)
        {
            try
            {
                var createdMeter = await _meterService.CreateMeterAsync(sellerId, meterDto);

                if (createdMeter.StatusCode == 200 || createdMeter.StatusCode == 404)
                {
                    return Ok(createdMeter);
                }
                else
                {
                    return StatusCode(500, createdMeter);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Create meter failed");
                return StatusCode(500, "An internal server error occurred.");
            }
        }
    }
}

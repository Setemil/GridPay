using Kilo.DTOs.UserDto;
using Kilo.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Kilo.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        ILogger<UserController> _logger;

        public UserController(IUserService userService, ILogger<UserController> logger)
        {
            _userService = userService;
            _logger = logger;
            _logger.LogDebug("Nlog is integrated to User Controller");
        }

        [HttpPost("CreateUser")]
        [EnableRateLimiting("ip-sliding")]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDto userDto)
        {
            try
            {
                var createdUser = await _userService.CreateUserAsync(userDto);

                if (createdUser.StatusCode == 200)
                {
                    return Ok(createdUser);
                }
                else
                {
                    return StatusCode(500, createdUser);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Create user failed");
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpGet("GetAllUsers")]
        [EnableRateLimiting("ip-sliding")]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var users = await _userService.GetAllUsersAsync();

                if (users.StatusCode == 200)
                {
                    return Ok(users);
                }
                else
                {
                    return StatusCode(500, users);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get all users failed");
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpGet("GetUserByEmail/{email}")]
        [EnableRateLimiting("ip-sliding")]
        public async Task<IActionResult> GetUserByEmail([FromRoute] string email)
        {
            try
            {
                var user = await _userService.GetUserByEmailAsync(email);

                if (user.StatusCode == 200 || user.StatusCode == 404)
                {
                    return Ok(user);
                }
                else
                {
                    return StatusCode(500, user);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get user by email failed");
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpGet("GetUserByExternalId/{externalId:int}")]
        [EnableRateLimiting("ip-sliding")]
        public async Task<IActionResult> GetUserByExternalId([FromRoute] int externalId)
        {
            try
            {
                var user = await _userService.GetUserByExternalIdAsync(externalId);

                if (user.StatusCode == 200 || user.StatusCode == 404)
                {
                    return Ok(user);
                }
                else
                {
                    return StatusCode(500, user);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get user by Id failed");
                return StatusCode(500, "An internal server error occurred.");
            }
        }
    }
}

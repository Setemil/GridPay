using Kilo.DTOs.UserDto;
using Kilo.Interfaces;
using Kilo.Response;

namespace Kilo.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly ILogger<UserService> _logger;

        public UserService(IUserRepository userRepository, ILogger<UserService> logger)
        {
            _userRepository = userRepository;
            _logger = logger;
            _logger.LogDebug("Nlog is integrated to User Service");
        }

        public async Task<ApiResponse> CreateUserAsync(CreateUserDto userDto)
        {
            try
            {
                var createdUser = await _userRepository.CreateUserAsync(userDto);
                if (createdUser == null)
                {
                    return new ApiResponse
                    {
                        StatusCode = 500,
                        Message = "An error occurred while creating user",
                        Data = new { }
                    };
                }

                return new ApiResponse
                {
                    StatusCode = 200,
                    Message = "User Created Successfully",
                    Data = createdUser
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Create User failed");
                return new ApiResponse
                {
                    StatusCode = 500,
                    Message = "An internal server error occurred.",
                };
            }
        }

        public async Task<ApiResponse> GetAllUsersAsync()
        {
            try
            {
                var allUsers = await _userRepository.GetAllUsersAsync();
                if (!allUsers.Any())
                {
                    return new ApiResponse
                    {
                        StatusCode = 200,
                        Message = "You currently do not have any users",
                        Data = allUsers
                    };
                }

                return new ApiResponse
                {
                    StatusCode = 200,
                    Message = "All users gotten Successfully",
                    Data = allUsers
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get All Users failed");
                return new ApiResponse
                {
                    StatusCode = 500,
                    Message = "An internal server error occurred.",
                };
            }
        }

        public async Task<ApiResponse> GetUserByEmailAsync(string email)
        {
            try
            {
                var user = await _userRepository.GetUserByEmailAsync(email);
                if (user == null)
                {
                    return new ApiResponse
                    {
                        StatusCode = 404,
                        Message = "User doesn't exist",
                        Data = new { }
                    };
                }

                return new ApiResponse
                {
                    StatusCode = 200,
                    Message = "User gotten Successfully",
                    Data = user
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get User by email failed");
                return new ApiResponse
                {
                    StatusCode = 500,
                    Message = "An internal server error occurred.",
                };
            }
        }

        public async Task<ApiResponse> GetUserByExternalIdAsync(int externalId)
        {
            try
            {
                var user = await _userRepository.GetUserByExternalIdAsync(externalId);
                if (user == null)
                {
                    return new ApiResponse
                    {
                        StatusCode = 404,
                        Message = "User doesn't exist",
                        Data = new { }
                    };
                }

                return new ApiResponse
                {
                    StatusCode = 200,
                    Message = "User gotten Successfully",
                    Data = user
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get User by External Id failed");
                return new ApiResponse
                {
                    StatusCode = 500,
                    Message = "An internal server error occurred.",
                };
            }
        }
    }
}

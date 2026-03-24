using Kilo.DTOs.UserDto;
using Kilo.Models;
using Kilo.Response;

namespace Kilo.Interfaces
{
    public interface IUserService
    {
        Task<ApiResponse> GetAllUsersAsync();
        Task<ApiResponse> GetUserByExternalIdAsync(int externalId);
        Task<ApiResponse> GetUserByEmailAsync(string email);
        Task<ApiResponse> CreateUserAsync(CreateUserDto userDto);
    }
}

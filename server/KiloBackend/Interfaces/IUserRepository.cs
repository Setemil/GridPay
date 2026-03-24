using Kilo.DTOs.UserDto;
using Kilo.Models;

namespace Kilo.Interfaces
{
    public interface IUserRepository
    {
        Task<ICollection<GetUserDto>> GetAllUsersAsync();
        Task<GetUserDto> GetUserByExternalIdAsync(int externalId);
        Task<GetUserDto> GetUserByEmailAsync(string email);
        Task<GetUserDto> CreateUserAsync(CreateUserDto userDto);
    }
}

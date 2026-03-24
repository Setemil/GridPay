using Kilo.Data;
using Kilo.DTOs.UserDto;
using Kilo.Interfaces;
using Kilo.Mappers;
using Microsoft.EntityFrameworkCore;

namespace Kilo.Repository
{
    public class UserRepository : IUserRepository
    {
        private readonly ApplicationDbContext _context;
        public UserRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<GetUserDto> CreateUserAsync(CreateUserDto userDto)
        {
            var user = UserMapper.ToUserFromCreateUserDto(userDto);
            var createdUser = await _context.Users.AddAsync(user);

            await _context.SaveChangesAsync();
            var getUserDto = UserMapper.ToGetUserDtoFromUser(user);
            return getUserDto;
        }

        public async Task<ICollection<GetUserDto>> GetAllUsersAsync()
        {
            var users = await _context.Users.Select(s => s.ToGetUserDtoFromUser()).ToListAsync();

            return users;
        }

        public async Task<GetUserDto> GetUserByEmailAsync(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(x => x.Email == email);

            if (user == null) return null;

            var getUserDto = UserMapper.ToGetUserDtoFromUser(user);
            return getUserDto;
        }

        public async Task<GetUserDto> GetUserByExternalIdAsync(int externalId)
        {
            var user = await _context.Users.FindAsync(externalId);

            if (user == null) return null;

            var getUserDto = UserMapper.ToGetUserDtoFromUser(user);
            return getUserDto;
        }
    }
}
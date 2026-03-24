using Kilo.DTOs.UserDto;
using Kilo.Models;

namespace Kilo.Mappers
{
    public static class UserMapper
    {
        public static CreateUserDto ToCreateUserDtoFromUser(this User userModel)
        {
            return new CreateUserDto
            {
                FullName = userModel.FullName,
                Email = userModel.Email,    
                Role = userModel.Role,
            };
        }

        public static User ToUserFromCreateUserDto(this CreateUserDto createUserDtoModel)
        {
            return new User
            {
                ExternalId = createUserDtoModel.Id,
                FullName = createUserDtoModel.FullName,
                Email = createUserDtoModel.Email,
                Role = createUserDtoModel.Role,
            };
        }

        public static GetUserDto ToGetUserDtoFromUser(this User userModel)
        {
            return new GetUserDto
            {
                ExternalId = userModel.ExternalId,
                FullName = userModel.FullName,
                Email = userModel.Email,
                Role = userModel.Role,
            };
        }
    }
}

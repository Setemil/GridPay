using Kilo.Models;
using System.ComponentModel.DataAnnotations;

namespace Kilo.DTOs.UserDto
{
    public class GetUserDto
    {
        public int ExternalId { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public UserRole Role { get; set; }
    }
}

using Kilo.Models;
using System.ComponentModel.DataAnnotations;

namespace Kilo.DTOs.UserDto
{
    public class CreateUserDto
    {
        [Required]
        public int Id { get; set; }

        [Required]
        [MaxLength(100, ErrorMessage = "Fullname cannot be more than 100 characters")]
        public string FullName { get; set; }

        [Required]
        [EmailAddress]
        [MaxLength(150, ErrorMessage = "Email cannot be more than 150 characters")]
        public string Email { get; set; }

        [Required]
        public UserRole Role { get; set; }
    }
}

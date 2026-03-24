using Kilo.DTOs.ListingDto;
using Kilo.Helpers;
using Kilo.Models;

namespace Kilo.Interfaces
{
    public interface IListingRepository
    {
        Task<ICollection<GetListingDto>> GetAllListingsAsync(QueryObjectForListing queryObject);
        Task<ICollection<GetListingDto>> GetListingBySellerIdAsync(int sellerId);
        Task<ICollection<GetListingDto>> GetActiveListingsAsync(string? location);
        Task<ICollection<GetLocationDto>> GetAvailableLocationsAsync();
        Task<GetListingDto> GetListingByIdAsync(int id);
        Task<Listing> CreateListingAsync(CreateListingDto listingDto, int sellerId, int meterId);
        Task<bool> UpdateListingAsync(UpdateListingDto listingDto, int id, int sellerId);
        Task<bool> UpdateListingByIsActiveAsync(int id, int sellerId, bool isActive);
        Task<bool> DeleteListingAsync(int id, int sellerId);
    }
}

using Kilo.DTOs.ListingDto;
using Kilo.Helpers;
using Kilo.Response;

namespace Kilo.Interfaces
{
    public interface IListingService
    {
        Task<ApiResponse> GetAllListingsAsync(QueryObjectForListing queryObject);
        Task<ApiResponse> GetListingBySellerIdAsync(int sellerId);
        Task<ApiResponse> GetActiveListingsAsync(string? location);
        Task<ApiResponse> GetAvailableLocationsAsync();
        Task<ApiResponse> GetListingByIdAsync(int id);
        Task<ApiResponse> CreateListingAsync(CreateListingDto listingDto, int sellerId, int meterId);
        Task<ApiResponse> UpdateListingAsync(UpdateListingDto listingDto, int Id, int sellerId);
        Task<ApiResponse> UpdateListingByIsActiveAsync(int Id, int sellerId, bool isActive);
        Task<ApiResponse> DeleteListingAsync(int id, int sellerId);
    }
}

using Kilo.DTOs.ListingDto;
using Kilo.Helpers;
using Kilo.Interfaces;
using Kilo.Models;
using Kilo.Repository;
using Kilo.Response;

namespace Kilo.Services
{
    public class ListingService : IListingService
    {
        private readonly IListingRepository _listingRepository;
        private readonly ILogger<ListingService> _logger;

        public ListingService(IListingRepository listingRepository, ILogger<ListingService> logger)
        {
            _listingRepository = listingRepository;
            _logger = logger;
            _logger.LogDebug("Nlog is integrated to Listing Service");
        }

        public async Task<ApiResponse> CreateListingAsync(CreateListingDto listingDto, int sellerId, int meterId)
        {
            try
            {
                var createdListing = await _listingRepository.CreateListingAsync(listingDto, sellerId, meterId);
                if (createdListing == null)
                {
                    return new ApiResponse
                    {
                        StatusCode = 404,
                        Message = "Meter does not exist",
                        Data = new { }
                    };
                }

                return new ApiResponse
                {
                    StatusCode = 200,
                    Message = "Energy listing Created Successfully",
                    Data = createdListing
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Create Energy Listing failed");
                return new ApiResponse
                {
                    StatusCode = 500,
                    Message = "An internal server error occurred.",
                };
            }
        }

        public async Task<ApiResponse> DeleteListingAsync(int id, int sellerId)
        {
            try
            {
                var deletedListing = await _listingRepository.DeleteListingAsync(id, sellerId);
                if (deletedListing == false)
                {
                    return new ApiResponse
                    {
                        StatusCode = 404,
                        Message = "Energy listing not found",
                        Data = new { }
                    };
                }

                return new ApiResponse
                {
                    StatusCode = 200,
                    Message = "Listing deleted Successfully",
                    Data = deletedListing
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Delete energy Listing failed");
                return new ApiResponse
                {
                    StatusCode = 500,
                    Message = "An internal server error occurred.",
                };
            }
        }

        public async Task<ApiResponse> GetActiveListingsAsync(string? location)
        {
            try
            {
                var activeListings = await _listingRepository.GetActiveListingsAsync(location);
                if (!activeListings.Any())
                    {
                    return new ApiResponse
                    {
                        StatusCode = 200,
                        Message = "You currently do not have any energy listings",
                        Data = new { }
                    };
                }

                return new ApiResponse
                {
                    StatusCode = 200,
                    Message = "Energy Listings gotten Successfully",
                    Data = activeListings
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get active energy listings failed");
                return new ApiResponse
                {
                    StatusCode = 500,
                    Message = "An internal server error occurred.",
                };
            }
        }

        public async Task<ApiResponse> GetAllListingsAsync(QueryObjectForListing queryObject)
        {
            try
            {
                var listings = await _listingRepository.GetAllListingsAsync(queryObject);
                if (!listings.Any())
                {
                    return new ApiResponse
                    {
                        StatusCode = 200,
                        Message = "You currently do not have any energy listing",
                        Data = new { }
                    };
                }

                return new ApiResponse
                {
                    StatusCode = 200,
                    Message = "Energy Listings gotten Successfully",
                    Data = listings
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get all energy listings failed");
                return new ApiResponse
                {
                    StatusCode = 500,
                    Message = "An internal server error occurred.",
                };
            }
        }

        public async Task<ApiResponse> GetAvailableLocationsAsync()
        {
            try
            {
                var locations = await _listingRepository.GetAvailableLocationsAsync();
                if (!locations.Any())
                {
                    return new ApiResponse
                    {
                        StatusCode = 200,
                        Message = "You currently do not have any locations",
                        Data = new { }
                    };
                }

                return new ApiResponse
                {
                    StatusCode = 200,
                    Message = "Locations gotten Successfully",
                    Data = locations
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get available locations failed");
                return new ApiResponse
                {
                    StatusCode = 500,
                    Message = "An internal server error occurred.",
                };
            }
        }

        public async Task<ApiResponse> GetListingByIdAsync(int id)
        {
            try
            {
                var listing = await _listingRepository.GetListingByIdAsync(id);
                if (listing == null)
                {
                    return new ApiResponse
                    {
                        StatusCode = 404,
                        Message = "Energy Listing does not exist",
                        Data = new { }
                    };
                }

                return new ApiResponse
                {
                    StatusCode = 200,
                    Message = "Energy Listing gotten Successfully",
                    Data = listing
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get energy listing by Id failed");
                return new ApiResponse
                {
                    StatusCode = 500,
                    Message = "An internal server error occurred.",
                };
            }
        }

        public async Task<ApiResponse> GetListingBySellerIdAsync(int sellerId)
        {
            try
            {
                var listings = await _listingRepository.GetListingBySellerIdAsync(sellerId);
                if (listings == null)
                {
                    return new ApiResponse
                    {
                        StatusCode = 404,
                        Message = "Energy Listing does not exist",
                        Data = new { }
                    };
                }

                return new ApiResponse
                {
                    StatusCode = 200,
                    Message = "Energy Listing gotten Successfully",
                    Data = listings
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get energy listing by seller Id failed");
                return new ApiResponse
                {
                    StatusCode = 500,
                    Message = "An internal server error occurred.",
                };
            }
        }

        public async Task<ApiResponse> UpdateListingAsync(UpdateListingDto listingDto, int Id, int sellerId)
        {
            try
            {
                var updatedListing = await _listingRepository.UpdateListingAsync(listingDto, Id, sellerId);
                if (updatedListing == false)
                {
                    return new ApiResponse
                    {
                        StatusCode = 404,
                        Message = "Energy Listing does not exist",
                        Data = new { }
                    };
                }

                return new ApiResponse
                {
                    StatusCode = 200,
                    Message = "Energy Listing updated Successfully",
                    Data = updatedListing
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "update energy listing failed");
                return new ApiResponse
                {
                    StatusCode = 500,
                    Message = "An internal server error occurred.",
                };
            }
        }

        public async Task<ApiResponse> UpdateListingByIsActiveAsync(int Id, int sellerId, bool isActive)
        {
            try
            {
                var updatedListing = await _listingRepository.UpdateListingByIsActiveAsync(Id, sellerId, isActive);
                if (updatedListing == false)
                {
                    return new ApiResponse
                    {
                        StatusCode = 404,
                        Message = "Energy Listing does not exist",
                        Data = new { }
                    };
                }

                return new ApiResponse
                {
                    StatusCode = 200,
                    Message = "Energy Listing updated Successfully",
                    Data = updatedListing
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Update energy listing by IsActive failed");
                return new ApiResponse
                {
                    StatusCode = 500,
                    Message = "An internal server error occurred.",
                };
            }
        }
    }
}

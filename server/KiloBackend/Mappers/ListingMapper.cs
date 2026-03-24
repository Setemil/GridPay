using Kilo.DTOs.ListingDto;
using Kilo.Models;

namespace Kilo.Mappers
{
    public static class ListingMapper
    {
        public static GetListingDto ToGetListingDtoFromListing(this Listing listingModel)
        {
            return new GetListingDto
            {
                Id = listingModel.Id,
                SellerId = listingModel.SellerId,
                Location = listingModel.Location,
                PricePerKwh = listingModel.PricePerKwh,
                TotalGeneratedKwh = listingModel.Meter.TotalGeneratedKwh,
                ConsumedKwh = listingModel.Meter.ConsumedKwh,
                IsActive = listingModel.IsActive,
                IsDeleted = listingModel.IsDeleted,
                LastUpdated = listingModel.LastUpdated,
            };
        }
    }
}

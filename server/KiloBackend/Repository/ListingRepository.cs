using Kilo.Data;
using Kilo.DTOs.ListingDto;
using Kilo.Helpers;
using Kilo.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Kilo.Repository
{
    public class ListingRepository : IListingRepository
    {
        private readonly ApplicationDbContext _context;
        public ListingRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Listing> CreateListingAsync(CreateListingDto listingDto, int sellerId, int meterId)
        {
            var meter = await _context.Meters.FirstOrDefaultAsync(m => m.Id == meterId && m.SellerId == sellerId);

            if (meter == null)
            {
                return null;
            }

            var listing = new Listing
            {
                SellerId = sellerId,
                MeterId = meterId,
                Location = listingDto.Location,
                PricePerKwh = listingDto.PricePerKwh,
            };

            await _context.Listings.AddAsync(listing);
            await _context.SaveChangesAsync();

            return listing;
        }

        public async Task<bool> DeleteListingAsync(int id, int sellerId)
        {
            var listing = await _context.Listings.FirstOrDefaultAsync(x => x.Id == id && x.SellerId == sellerId);
            if (listing == null) return false;

            listing.IsActive = false;
            listing.IsDeleted = true;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<ICollection<GetListingDto>> GetActiveListingsAsync(string? location)
        {
            var activeListings = _context.Listings.Where(x => x.IsActive == true && x.IsDeleted == false).AsQueryable();

            if (!string.IsNullOrEmpty(location))
            {
                activeListings = activeListings.Where(s => s.Location.ToLower() == location.ToLower());

                var listingsByLocation = await activeListings.Select(s => new GetListingDto
                {
                    Id = s.Id,
                    SellerId = s.SellerId,
                    MeterId = s.MeterId,
                    Location = s.Location,
                    PricePerKwh = s.PricePerKwh,

                    TotalGeneratedKwh = s.Meter.TotalGeneratedKwh,
                    ConsumedKwh = s.Meter.ConsumedKwh,

                    IsActive = s.IsActive,
                    IsDeleted = s.IsDeleted,
                    LastUpdated = s.LastUpdated
                })
                .ToListAsync();

                return listingsByLocation;
            }

            var listings = await activeListings.Select(s => new GetListingDto
            {
                Id = s.Id,
                SellerId = s.SellerId,
                MeterId = s.MeterId,
                Location = s.Location,
                PricePerKwh = s.PricePerKwh,

                TotalGeneratedKwh = s.Meter.TotalGeneratedKwh,
                ConsumedKwh = s.Meter.ConsumedKwh,

                IsActive = s.IsActive,
                IsDeleted = s.IsDeleted,
                LastUpdated = s.LastUpdated
            }).ToListAsync();

            return listings;
        }

        public async Task<ICollection<GetListingDto>> GetAllListingsAsync(QueryObjectForListing queryObject)
        {
            var listings = _context.Listings.AsQueryable();

            if (!string.IsNullOrEmpty(queryObject.Location))
            {
                listings = listings.Where(s => s.Location.ToLower() == queryObject.Location.ToLower());
            }

            if (queryObject.IsActive == false)
            {
                listings = listings.Where(a => a.IsActive == false);

                var inactiveListings = await listings.Select(s => new GetListingDto
                {
                    Id = s.Id,
                    SellerId = s.SellerId,
                    MeterId = s.MeterId,
                    Location = s.Location,
                    PricePerKwh = s.PricePerKwh,

                    TotalGeneratedKwh = s.Meter.TotalGeneratedKwh,
                    ConsumedKwh = s.Meter.ConsumedKwh,

                    IsActive = s.IsActive,
                    IsDeleted = s.IsDeleted,
                    LastUpdated = s.LastUpdated
                })
                .ToListAsync();

                return inactiveListings;
            }

            listings = listings.Where(a => a.IsActive == true);

            var activeListings = await listings.Select(s => new GetListingDto
            {
                Id = s.Id,
                SellerId = s.SellerId,
                MeterId = s.MeterId,
                Location = s.Location,
                PricePerKwh = s.PricePerKwh,

                TotalGeneratedKwh = s.Meter.TotalGeneratedKwh,
                ConsumedKwh = s.Meter.ConsumedKwh,

                IsActive = s.IsActive,
                IsDeleted = s.IsDeleted,
                LastUpdated = s.LastUpdated
            })
            .ToListAsync();

            return activeListings;
        }

        public async Task<ICollection<GetListingDto>> GetListingBySellerIdAsync(int sellerId)
        {
            var listing = await _context.Listings.Where(x => x.SellerId == sellerId && x.IsDeleted == false).Select(s => new GetListingDto
            {
                Id = s.Id,
                SellerId = s.SellerId,
                MeterId = s.MeterId,
                Location = s.Location,
                PricePerKwh = s.PricePerKwh,

                TotalGeneratedKwh = s.Meter.TotalGeneratedKwh,
                ConsumedKwh = s.Meter.ConsumedKwh,

                IsActive = s.IsActive,
                IsDeleted = s.IsDeleted,
                LastUpdated = s.LastUpdated
            })
            .ToListAsync();

            return listing;
        }

        public async Task<GetListingDto> GetListingByMeterIdAsync(int meterId)
        {
            var listingDto = await _context.Listings.Where(x => x.MeterId == meterId && !x.IsDeleted)
            .Select(l => new GetListingDto
            {
                Id = l.Id,
                SellerId = l.SellerId,
                MeterId = l.MeterId,
                Location = l.Location,
                PricePerKwh = l.PricePerKwh,
                TotalGeneratedKwh = l.Meter.TotalGeneratedKwh,
                ConsumedKwh = l.Meter.ConsumedKwh,
                IsActive = l.IsActive,
                IsDeleted = l.IsDeleted,
                LastUpdated = l.LastUpdated
            })
            .FirstOrDefaultAsync();

            return listingDto;
        }

        public async Task<GetListingDto> GetListingByIdAsync(int id)
        {
            var listingDto = await _context.Listings.Where(x => x.Id == id && !x.IsDeleted)
            .Select(l => new GetListingDto
            {
                Id = l.Id,
                SellerId = l.SellerId,
                MeterId = l.MeterId,
                Location = l.Location,
                PricePerKwh = l.PricePerKwh,
                TotalGeneratedKwh = l.Meter.TotalGeneratedKwh,
                ConsumedKwh = l.Meter.ConsumedKwh,
                IsActive = l.IsActive,
                IsDeleted = l.IsDeleted,
                LastUpdated = l.LastUpdated
            })
            .FirstOrDefaultAsync();

            return listingDto;
        }

        public async Task<ICollection<GetLocationDto>> GetAvailableLocationsAsync()
        {
            var locations = await _context.Listings
                .Select(s => new GetLocationDto
                {
                    Location = s.Location,
                }).ToListAsync();

            return locations;
        }

        public async Task<bool> UpdateListingAsync(UpdateListingDto listingDto, int id, int sellerId)
        {
            var listing = await _context.Listings.FirstOrDefaultAsync(x => x.Id == id && x.SellerId == sellerId && x.IsDeleted == false);
            if (listing == null) return false;

            listing.Location = listingDto.Location;
            listing.PricePerKwh = listingDto.PricePerKwh;
            listing.IsActive = listingDto.IsActive;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateListingByIsActiveAsync(int id, int sellerId, bool isActive)
        {
            var listing = await _context.Listings.FirstOrDefaultAsync(x => x.Id == id && x.SellerId == sellerId && x.IsDeleted == false);
            if (listing == null) return false;

            listing.IsActive = isActive;

            await _context.SaveChangesAsync();
            return true;
        }

        /* public async Task<bool> UpdateListingByAvailableKwhAsync(int id, decimal availableKwh)
        {
            var listing = await _context.Listings.FirstOrDefaultAsync(x => x.Id == id && x.IsDeleted == false);
            if (listing == null) return false;

            listing.AvailableKwh = availableKwh;

            await _context.SaveChangesAsync();
            return true;
        } */
    }
}

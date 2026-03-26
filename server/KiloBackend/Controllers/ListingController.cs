using Kilo.DTOs.ListingDto;
using Kilo.Helpers;
using Kilo.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Kilo.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ListingController : ControllerBase
    {
        private readonly IListingService _listingService;
        ILogger<ListingController> _logger;

        public ListingController(IListingService listingService, ILogger<ListingController> logger)
        {
            _listingService = listingService;
            _logger = logger;
            _logger.LogDebug("Nlog is integrated to Listing Controller");
        }

        [HttpPost("CreateEnergyListing/{sellerId:int}/{meterId:int}")]
        [EnableRateLimiting("ip-sliding")]
        public async Task<IActionResult> CreateListing([FromBody] CreateListingDto listingDto, [FromRoute]int sellerId, [FromRoute] int meterId)
        {
            try
            {
                var createdListing = await _listingService.CreateListingAsync(listingDto, sellerId, meterId);

                if (createdListing.StatusCode == 200 || createdListing.StatusCode == 404)
                {
                    return Ok(createdListing);
                }
                else if (createdListing.StatusCode == 400)
                {
                    return BadRequest(createdListing);
                }
                else
                {
                    return StatusCode(500, createdListing);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Create energy listing failed");
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpPost("DeleteEnergyListing/{id:int}/{sellerid:int}")]
        [EnableRateLimiting("ip-sliding")]
        public async Task<IActionResult> DeleteListing(int id, int sellerId)
        {
            try
            {
                var deletedListing = await _listingService.DeleteListingAsync(id, sellerId);

                if (deletedListing.StatusCode == 200 || deletedListing.StatusCode == 404) 
                {
                    return Ok(deletedListing);
                }
                else
                {
                    return StatusCode(500, deletedListing);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Delete energy listing failed");
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpGet("GetActiveEnergyListings")]
        [EnableRateLimiting("ip-sliding")]
        public async Task<IActionResult> GetActiveListings([FromQuery] string? location)
        {
            try
            {
                var activeListings = await _listingService.GetActiveListingsAsync(location);

                if (activeListings.StatusCode == 200)
                {
                    return Ok(activeListings);
                }
                else
                {
                    return StatusCode(500, activeListings);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get active energy listing failed");
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpGet("GetAllEnergyListings")]
        [EnableRateLimiting("ip-sliding")]
        public async Task<IActionResult> GetAllListings([FromQuery] QueryObjectForListing queryObject)
        {
            try
            {
                var allListings = await _listingService.GetAllListingsAsync(queryObject);

                if (allListings.StatusCode == 200)
                {
                    return Ok(allListings);
                }
                else
                {
                    return StatusCode(500, allListings);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get all energy listing failed");
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpGet("GetAvailableLocations")]
        [EnableRateLimiting("ip-sliding")]
        public async Task<IActionResult> GetAvailableLocations()
        {
            try
            {
                var locations = await _listingService.GetAvailableLocationsAsync();

                if (locations.StatusCode == 200)
                {
                    return Ok(locations);
                }
                else
                {
                    return StatusCode(500, locations);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get available locations failed");
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpGet("GetEnergyListingById/{id:int}")]
        [EnableRateLimiting("ip-sliding")]
        public async Task<IActionResult> GetListingById([FromRoute] int id)
        {
            try
            {
                var listing = await _listingService.GetListingByIdAsync(id);

                if (listing.StatusCode == 200 || listing.StatusCode == 404)
                {
                    return Ok(listing);
                }
                else
                {
                    return StatusCode(500, listing);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get energy listing by Id failed");
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpGet("GetEnergyListingBySellerId/{sellerId:int}")]
        [EnableRateLimiting("ip-sliding")]
        public async Task<IActionResult> GetListingBySellerId([FromRoute] int sellerId)
        {
            try
            {
                var sellerListings = await _listingService.GetListingBySellerIdAsync(sellerId);

                if (sellerListings.StatusCode == 200 || sellerListings.StatusCode == 404)
                {
                    return Ok(sellerListings);
                }
                else
                {
                    return StatusCode(500, sellerListings);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Get energy listing by seller Id failed");
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpPost("UpdateEnergyListing/{Id:int}/{sellerId:int}")]
        [EnableRateLimiting("ip-sliding")]
        public async Task<IActionResult> UpdateListing([FromBody] UpdateListingDto listingDto, [FromRoute] int Id, [FromRoute] int sellerId)
        {
            try
            {
                var updatedListing = await _listingService.UpdateListingAsync(listingDto, Id, sellerId);

                if (updatedListing.StatusCode == 200 || updatedListing.StatusCode == 404)
                {
                    return Ok(updatedListing);
                }
                else if (updatedListing.StatusCode == 400)
                {
                    return BadRequest(updatedListing);
                }
                else
                {
                    return StatusCode(500, updatedListing);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Update energy listing failed");
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpPost("UpdateListingByIsActive/{Id:int}/{sellerId:Int}/{isActive:bool}")]
        [EnableRateLimiting("ip-sliding")]
        public async Task<IActionResult> UpdateListingByIsActiveAsync([FromRoute] int Id, [FromRoute] int sellerId,[FromRoute] bool isActive)
        {
            try
            {
                var updatedListing = await _listingService.UpdateListingByIsActiveAsync(Id, sellerId, isActive);

                if (updatedListing.StatusCode == 200 || updatedListing.StatusCode == 404)
                {
                    return Ok(updatedListing);
                }
                else if (updatedListing.StatusCode == 400)
                {
                    return BadRequest(updatedListing);
                }
                else
                {
                    return StatusCode(500, updatedListing);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Update energy listing by isActive failed");
                return StatusCode(500, "An internal server error occurred.");
            }
        }
    }
}

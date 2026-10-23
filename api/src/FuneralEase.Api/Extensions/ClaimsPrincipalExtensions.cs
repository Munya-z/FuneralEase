using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using FuneralEase.Domain.Common;

namespace FuneralEase.Api.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static UserId GetUserId(this ClaimsPrincipal user)
    {
        var sub = user.FindFirstValue(JwtRegisteredClaimNames.Sub)
               ?? user.FindFirstValue(ClaimTypes.NameIdentifier);
        return sub is not null && Guid.TryParse(sub, out var guid)
            ? new UserId(guid)
            : UserId.Empty;
    }

    public static HouseholdId GetHouseholdId(this ClaimsPrincipal user)
    {
        var val = user.FindFirstValue("household_id");
        return val is not null && Guid.TryParse(val, out var guid)
            ? new HouseholdId(guid)
            : HouseholdId.Empty;
    }
}

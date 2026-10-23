using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Common;
using FuneralEase.Domain.Households;
using Microsoft.AspNetCore.Http;

namespace FuneralEase.Infrastructure.Auth;

public class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    private ClaimsPrincipal? User => httpContextAccessor.HttpContext?.User;

    public UserId UserId
    {
        get
        {
            var sub = User?.FindFirstValue(JwtRegisteredClaimNames.Sub)
                   ?? User?.FindFirstValue(ClaimTypes.NameIdentifier);
            return sub is not null && Guid.TryParse(sub, out var guid)
                ? new UserId(guid)
                : UserId.Empty;
        }
    }

    public HouseholdId HouseholdId
    {
        get
        {
            var val = User?.FindFirstValue("household_id");
            return val is not null && Guid.TryParse(val, out var guid)
                ? new HouseholdId(guid)
                : HouseholdId.Empty;
        }
    }

    public MemberRole Role
    {
        get
        {
            var role = User?.FindFirstValue("role");
            return Enum.TryParse<MemberRole>(role, out var parsed) ? parsed : MemberRole.Beneficiary;
        }
    }

    public bool IsAdmin => User?.FindFirstValue("scope") == "funeralease:admin";

    public bool IsAuthenticated => User?.Identity?.IsAuthenticated == true;
}

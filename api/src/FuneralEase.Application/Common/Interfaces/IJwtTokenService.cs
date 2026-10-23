using FuneralEase.Domain.Common;
using FuneralEase.Domain.Households;

namespace FuneralEase.Application.Common.Interfaces;

public record TokenPair(string AccessToken, string RefreshToken, int ExpiresInSeconds);

public interface IJwtTokenService
{
    TokenPair GenerateTokenPair(UserId userId, HouseholdId householdId, MemberRole role, string fullName = "", bool isAdmin = false);
    bool TryValidateRefreshToken(string refreshToken, out UserId userId);
}

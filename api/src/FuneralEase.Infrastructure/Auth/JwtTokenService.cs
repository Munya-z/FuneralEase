using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Common;
using FuneralEase.Domain.Households;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace FuneralEase.Infrastructure.Auth;

public class JwtTokenService(IOptions<JwtOptions> options) : IJwtTokenService
{
    private readonly JwtOptions _opts = options.Value;

    public TokenPair GenerateTokenPair(UserId userId, HouseholdId householdId, MemberRole role, string fullName = "", bool isAdmin = false)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId.Value.ToString()),
            new Claim(JwtRegisteredClaimNames.Name, fullName),
            new Claim("household_id", householdId.Value.ToString()),
            new Claim("role", role.ToString()),
            new Claim("scope", isAdmin ? "funeralease:admin" : "funeralease:user"),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_opts.Secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _opts.Issuer,
            audience: _opts.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_opts.AccessTokenExpiryMinutes),
            signingCredentials: credentials);

        var accessToken = new JwtSecurityTokenHandler().WriteToken(token);
        var refreshToken = GenerateRefreshToken(userId);

        return new TokenPair(accessToken, refreshToken, _opts.AccessTokenExpiryMinutes * 60);
    }

    public bool TryValidateRefreshToken(string refreshToken, out UserId userId)
    {
        userId = UserId.Empty;
        // Refresh tokens are stored hashed; this validates format and extracts embedded userId
        // Format: base64(userId:randomBytes)
        try
        {
            var decoded = Encoding.UTF8.GetString(Convert.FromBase64String(refreshToken));
            var parts = decoded.Split(':');
            if (parts.Length != 2 || !Guid.TryParse(parts[0], out var guid)) return false;
            userId = new UserId(guid);
            return true;
        }
        catch
        {
            return false;
        }
    }

    private string GenerateRefreshToken(UserId userId)
    {
        var randomBytes = RandomNumberGenerator.GetBytes(32);
        var payload = $"{userId.Value}:{Convert.ToBase64String(randomBytes)}";
        return Convert.ToBase64String(Encoding.UTF8.GetBytes(payload));
    }
}

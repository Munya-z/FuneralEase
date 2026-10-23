using FuneralEase.Application.Common.Exceptions;
using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Common;
using FuneralEase.Domain.Households;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Auth.Commands.RefreshToken;

public class RefreshTokenCommandHandler(
    IJwtTokenService jwtTokenService,
    IApplicationDbContext db) : IRequestHandler<RefreshTokenCommand, TokenPair>
{
    public async Task<TokenPair> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        if (!jwtTokenService.TryValidateRefreshToken(request.RefreshToken, out var userId))
            throw new ForbiddenException("Invalid or expired refresh token.");

        var user = await db.Users.FindAsync([userId], cancellationToken)
            ?? throw new ForbiddenException("User not found.");

        var householdId = user.PrimaryHouseholdId ?? HouseholdId.Empty;
        var household = await db.Households
            .Include(h => h.Members)
            .FirstOrDefaultAsync(h => h.Id == householdId, cancellationToken);

        var role = household?.IsAdministrator(userId) == true
            ? MemberRole.Administrator
            : MemberRole.Beneficiary;

        user.RecordLogin();
        await db.SaveChangesAsync(cancellationToken);

        return jwtTokenService.GenerateTokenPair(userId, householdId, role, user.FullName);
    }
}

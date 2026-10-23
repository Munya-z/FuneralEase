using FuneralEase.Application.Common.Exceptions;
using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Common;
using FuneralEase.Domain.Households;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Auth.Commands.LoginWithPin;

public class LoginWithPinCommandHandler(
    IApplicationDbContext db,
    IJwtTokenService jwtTokenService) : IRequestHandler<LoginWithPinCommand, TokenPair>
{
    public async Task<TokenPair> Handle(LoginWithPinCommand request, CancellationToken cancellationToken)
    {
        var user = await db.Users
            .FirstOrDefaultAsync(u => u.MobileNumber == request.MobileNumber, cancellationToken);

        if (user is null || !user.VerifyPin(request.Pin))
            throw new ForbiddenException("Invalid mobile number or PIN.");

        user.RecordLogin();
        await db.SaveChangesAsync(cancellationToken);

        var householdId = user.PrimaryHouseholdId ?? HouseholdId.Empty;
        var household = await db.Households
            .Include(h => h.Members)
            .FirstOrDefaultAsync(h => h.Id == householdId, cancellationToken);

        var role = household?.IsAdministrator(user.Id) == true
            ? MemberRole.Administrator
            : MemberRole.Beneficiary;

        return jwtTokenService.GenerateTokenPair(user.Id, householdId, role, user.FullName);
    }
}

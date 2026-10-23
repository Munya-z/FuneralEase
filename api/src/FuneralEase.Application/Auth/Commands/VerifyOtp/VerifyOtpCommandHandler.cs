using FuneralEase.Application.Common.Exceptions;
using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Common;
using FuneralEase.Domain.Households;
using FuneralEase.Domain.Subscriptions;
using FuneralEase.Domain.Users;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Auth.Commands.VerifyOtp;

public class VerifyOtpCommandHandler(
    IOtpService otpService,
    IApplicationDbContext db,
    IJwtTokenService jwtTokenService) : IRequestHandler<VerifyOtpCommand, TokenPair>
{
    public async Task<TokenPair> Handle(VerifyOtpCommand request, CancellationToken cancellationToken)
    {
        var valid = await otpService.VerifyOtpAsync(request.MobileNumber, request.Code, cancellationToken);
        if (!valid)
            throw new ForbiddenException("Invalid or expired OTP.");

        // Upsert user
        var user = await db.Users
            .FirstOrDefaultAsync(u => u.MobileNumber == request.MobileNumber, cancellationToken);

        HouseholdId householdId;
        MemberRole role;

        if (user is null)
        {
            // First login: create user + household + free subscription
            user = User.Create(request.MobileNumber, request.FullName, request.PopiaConsentGiven);
            db.Users.Add(user);

            var household = Household.Create(user.Id, request.FullName, request.MobileNumber, $"{request.FullName}'s Household");
            db.Households.Add(household);

            var subscription = Subscription.CreateFree(household.Id);
            db.Subscriptions.Add(subscription);

            user.SetPrimaryHousehold(household.Id);
            householdId = household.Id;
            role = MemberRole.Administrator;
        }
        else
        {
            user.RecordLogin();
            householdId = user.PrimaryHouseholdId ?? HouseholdId.Empty;
            var household = await db.Households
                .Include(h => h.Members)
                .FirstOrDefaultAsync(h => h.Id == householdId, cancellationToken);
            role = household?.IsAdministrator(user.Id) == true
                ? MemberRole.Administrator
                : MemberRole.Beneficiary;
        }

        await db.SaveChangesAsync(cancellationToken);

        return jwtTokenService.GenerateTokenPair(user.Id, householdId, role, user.FullName);
    }
}

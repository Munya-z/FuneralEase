using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Common;
using FuneralEase.Domain.Households;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Households.Commands.AddMember;

public record AddHouseholdMemberCommand(
    HouseholdId HouseholdId,
    string MobileNumber,
    string FullName,
    MemberRole Role = MemberRole.Beneficiary) : IRequest<MemberAddedResult>;

public record MemberAddedResult(string UserId, string FullName, string Role);

public class AddHouseholdMemberCommandHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<AddHouseholdMemberCommand, MemberAddedResult>
{
    public async Task<MemberAddedResult> Handle(AddHouseholdMemberCommand request, CancellationToken cancellationToken)
    {
        // Only an administrator of the household can add members
        if (!currentUser.IsAuthenticated)
            throw new InvalidOperationException("Not authenticated.");

        var household = await db.Households
            .Include(h => h.Members)
            .FirstOrDefaultAsync(h => h.Id == request.HouseholdId, cancellationToken)
            ?? throw new InvalidOperationException("Household not found.");

        if (!household.IsAdministrator(currentUser.UserId))
            throw new InvalidOperationException("Only an administrator can add household members.");

        // Find or create the user by mobile number
        var user = await db.Users
            .FirstOrDefaultAsync(u => u.MobileNumber == request.MobileNumber, cancellationToken);

        UserId userId;
        if (user is null)
        {
            // Create a placeholder user (they'll complete signup via OTP)
            user = Domain.Users.User.Create(request.MobileNumber, request.FullName, popiaConsentGiven: true);
            db.Users.Add(user);
            await db.SaveChangesAsync(cancellationToken);
        }

        userId = user.Id;

        household.AddMember(userId, request.FullName, request.MobileNumber, request.Role);
        await db.SaveChangesAsync(cancellationToken);

        return new MemberAddedResult(userId.Value.ToString(), request.FullName, request.Role.ToString());
    }
}

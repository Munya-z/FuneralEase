using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Households.Commands.RemoveMember;

public record RemoveHouseholdMemberCommand(HouseholdId HouseholdId, UserId MemberUserId) : IRequest;

public class RemoveHouseholdMemberCommandHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<RemoveHouseholdMemberCommand>
{
    public async Task Handle(RemoveHouseholdMemberCommand request, CancellationToken cancellationToken)
    {
        if (!currentUser.IsAuthenticated)
            throw new InvalidOperationException("Not authenticated.");

        var household = await db.Households
            .Include(h => h.Members)
            .FirstOrDefaultAsync(h => h.Id == request.HouseholdId, cancellationToken)
            ?? throw new InvalidOperationException("Household not found.");

        if (!household.IsAdministrator(currentUser.UserId))
            throw new InvalidOperationException("Only an administrator can remove household members.");

        if (request.MemberUserId == currentUser.UserId)
            throw new InvalidOperationException("An administrator cannot remove themselves.");

        // Remove via EF — the member entity is owned by the aggregate
        var member = household.Members.FirstOrDefault(m => m.Id == request.MemberUserId)
            ?? throw new InvalidOperationException("Member not found in this household.");

        db.HouseholdMembers.Remove(member);
        await db.SaveChangesAsync(cancellationToken);
    }
}

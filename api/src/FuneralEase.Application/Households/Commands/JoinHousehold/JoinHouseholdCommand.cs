using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Households;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Households.Commands.JoinHousehold;

/// <summary>
/// Records a referral conversion for the currently authenticated user's household.
/// Called post-signup when the user joined via a referral link.
/// Enforced: one referral per new household (unique index on ReferralLogs.NewHouseholdId).
/// </summary>
public record JoinHouseholdCommand(string ReferralCode) : IRequest;

public class JoinHouseholdCommandHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<JoinHouseholdCommand>
{
    public async Task Handle(JoinHouseholdCommand request, CancellationToken cancellationToken)
    {
        var newHouseholdId = currentUser.HouseholdId;
        var referralCode = request.ReferralCode.Trim().ToUpperInvariant();

        // Guard: already claimed a referral
        var alreadyClaimed = await db.ReferralLogs
            .AnyAsync(r => r.NewHouseholdId == newHouseholdId, cancellationToken);
        if (alreadyClaimed)
            throw new InvalidOperationException("A referral has already been recorded for this household.");

        var referrerHousehold = await db.Households
            .AsNoTracking()
            .FirstOrDefaultAsync(h => h.ReferralCode == referralCode, cancellationToken)
            ?? throw new InvalidOperationException($"Referral code '{referralCode}' is not valid.");

        // Cannot self-refer
        if (referrerHousehold.Id == newHouseholdId)
            throw new InvalidOperationException("Cannot use your own referral code.");

        db.ReferralLogs.Add(ReferralLog.Record(referrerHousehold.Id, newHouseholdId, referralCode));
        await db.SaveChangesAsync(cancellationToken);
    }
}

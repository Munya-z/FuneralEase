using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Households.Queries.GetReferral;

public record GetReferralQuery(HouseholdId HouseholdId) : IRequest<ReferralDto>;

public record ReferralDto(
    string HouseholdId,
    string HouseholdName,
    string ReferralCode,
    string ReferralLink,
    int ConversionsCount);

public class GetReferralQueryHandler(IApplicationDbContext db) : IRequestHandler<GetReferralQuery, ReferralDto>
{
    public async Task<ReferralDto> Handle(GetReferralQuery request, CancellationToken cancellationToken)
    {
        var household = await db.Households
            .AsNoTracking()
            .FirstOrDefaultAsync(h => h.Id == request.HouseholdId, cancellationToken)
            ?? throw new InvalidOperationException("Household not found.");

        var count = await db.ReferralLogs
            .AsNoTracking()
            .CountAsync(r => r.ReferrerHouseholdId == household.Id, cancellationToken);

        return new ReferralDto(
            household.Id.Value.ToString(),
            household.Name,
            household.ReferralCode,
            $"https://funeralease.co.za/join?ref={household.ReferralCode}",
            count);
    }
}

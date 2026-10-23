using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Admin.Queries.GetHouseholdDetail;

public record HouseholdMemberDetailDto(string UserId, string FullName, string MobileNumber, string Role, DateTimeOffset JoinedAt);

public record HouseholdPolicySummaryDto(
    string PolicyId,
    string InsurerName,
    string PolicyNumber,
    decimal PremiumAmount,
    string NextDueDate,
    string LapseStatus);

public record HouseholdDetailDto(
    Guid HouseholdId,
    string Name,
    string ReferralCode,
    DateTimeOffset CreatedAt,
    // Subscription
    string SubscriptionTier,
    bool IsInTrial,
    DateTimeOffset? TrialEndsAt,
    DateTimeOffset? EntitlementExpiresAt,
    // Members
    List<HouseholdMemberDetailDto> Members,
    // Policies
    List<HouseholdPolicySummaryDto> Policies,
    // Audit
    List<HouseholdAuditEventDto> RecentAuditEvents);

public record HouseholdAuditEventDto(
    string Action,
    string Category,
    string Subject,
    string? Detail,
    DateTimeOffset OccurredAt);

public record GetHouseholdDetailQuery(HouseholdId HouseholdId) : IRequest<HouseholdDetailDto?>;

public class GetHouseholdDetailQueryHandler(IApplicationDbContext db)
    : IRequestHandler<GetHouseholdDetailQuery, HouseholdDetailDto?>
{
    public async Task<HouseholdDetailDto?> Handle(GetHouseholdDetailQuery request, CancellationToken cancellationToken)
    {
        var household = await db.Households
            .AsNoTracking()
            .Include(h => h.Members)
            .FirstOrDefaultAsync(h => h.Id == request.HouseholdId, cancellationToken);

        if (household is null) return null;

        var subscription = await db.Subscriptions
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.HouseholdId == request.HouseholdId, cancellationToken);

        var policies = await db.Policies
            .AsNoTracking()
            .Where(p => p.HouseholdId == request.HouseholdId)
            .OrderBy(p => p.NextDueDate)
            .ToListAsync(cancellationToken);

        var auditEvents = await db.SystemAuditLogs
            .AsNoTracking()
            .Where(a => a.Subject.Contains(request.HouseholdId.Value.ToString()))
            .OrderByDescending(a => a.OccurredAt)
            .Take(20)
            .ToListAsync(cancellationToken);

        var members = household.Members.Select(m => new HouseholdMemberDetailDto(
            m.Id.Value.ToString(),
            m.FullName,
            m.MobileNumber,
            m.Role.ToString(),
            m.JoinedAt)).ToList();

        var policyDtos = policies.Select(p => new HouseholdPolicySummaryDto(
            p.Id.Value.ToString(),
            p.InsurerName,
            p.PolicyNumber,
            p.PremiumAmount,
            p.NextDueDate.ToString("yyyy-MM-dd"),
            p.LapseStatus.ToString())).ToList();

        var auditDtos = auditEvents.Select(a => new HouseholdAuditEventDto(
            a.Action,
            a.Category.ToString(),
            a.Subject,
            a.Detail,
            a.OccurredAt)).ToList();

        return new HouseholdDetailDto(
            household.Id.Value,
            household.Name,
            household.ReferralCode,
            household.CreatedAt,
            subscription?.Tier.ToString() ?? "Free",
            subscription?.IsInTrial ?? false,
            subscription?.TrialEndsAt,
            subscription?.EntitlementExpiresAt,
            members,
            policyDtos,
            auditDtos);
    }
}

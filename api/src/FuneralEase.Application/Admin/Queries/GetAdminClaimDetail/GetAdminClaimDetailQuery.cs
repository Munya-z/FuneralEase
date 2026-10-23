using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Admin.Queries.GetAdminClaimDetail;

public record AdminChecklistItemDto(Guid Id, string Description, string ItemType, bool IsChecked);

public record AdminClaimDetailDto(
    Guid ClaimId,
    Guid HouseholdId,
    string HouseholdName,
    Guid PolicyId,
    string InsurerName,
    string PolicyNumber,
    string DeceasedFullName,
    string Status,
    DateTimeOffset CreatedAt,
    DateTimeOffset? SubmittedAt,
    List<AdminChecklistItemDto> ChecklistItems);

public record GetAdminClaimDetailQuery(ClaimId ClaimId) : IRequest<AdminClaimDetailDto?>;

public class GetAdminClaimDetailQueryHandler(IApplicationDbContext db)
    : IRequestHandler<GetAdminClaimDetailQuery, AdminClaimDetailDto?>
{
    public async Task<AdminClaimDetailDto?> Handle(GetAdminClaimDetailQuery request, CancellationToken cancellationToken)
    {
        var claim = await db.Claims
            .AsNoTracking()
            .Include(c => c.ChecklistItems)
            .FirstOrDefaultAsync(c => c.Id == request.ClaimId, cancellationToken);

        if (claim is null) return null;

        var household = await db.Households
            .AsNoTracking()
            .FirstOrDefaultAsync(h => h.Id == claim.HouseholdId, cancellationToken);

        var policy = await db.Policies
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == claim.PolicyId, cancellationToken);

        return new AdminClaimDetailDto(
            claim.Id.Value,
            claim.HouseholdId.Value,
            household?.Name ?? "Unknown",
            claim.PolicyId.Value,
            policy?.InsurerName ?? "Unknown",
            policy?.PolicyNumber ?? "Unknown",
            claim.DeceasedFullName,
            claim.Status.ToString(),
            claim.CreatedAt,
            claim.SubmittedAt,
            claim.ChecklistItems
                .Select(i => new AdminChecklistItemDto(i.Id.Value, i.Description, i.ItemType.ToString(), i.IsChecked))
                .ToList());
    }
}

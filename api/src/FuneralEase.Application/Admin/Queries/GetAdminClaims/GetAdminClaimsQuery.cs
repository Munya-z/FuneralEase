using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Claims;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Admin.Queries.GetAdminClaims;

public record AdminClaimSummaryDto(
    Guid ClaimId,
    Guid HouseholdId,
    string HouseholdName,
    string DeceasedFullName,
    string Status,
    DateTimeOffset CreatedAt,
    DateTimeOffset? SubmittedAt);

public record GetAdminClaimsResult(List<AdminClaimSummaryDto> Items, int TotalCount);

public record GetAdminClaimsQuery(ClaimStatus? Status, int Page, int PageSize) : IRequest<GetAdminClaimsResult>;

public class GetAdminClaimsQueryHandler(IApplicationDbContext db)
    : IRequestHandler<GetAdminClaimsQuery, GetAdminClaimsResult>
{
    public async Task<GetAdminClaimsResult> Handle(GetAdminClaimsQuery request, CancellationToken cancellationToken)
    {
        var baseQuery =
            from c in db.Claims.AsNoTracking()
            join h in db.Households.AsNoTracking() on c.HouseholdId equals h.Id
            where request.Status == null || c.Status == request.Status
            orderby c.CreatedAt descending
            select new { c, h.Name };

        var total = await baseQuery.CountAsync(cancellationToken);

        var rows = await baseQuery
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var items = rows.Select(r => new AdminClaimSummaryDto(
            r.c.Id.Value,
            r.c.HouseholdId.Value,
            r.Name,
            r.c.DeceasedFullName,
            r.c.Status.ToString(),
            r.c.CreatedAt,
            r.c.SubmittedAt)).ToList();

        return new GetAdminClaimsResult(items, total);
    }
}

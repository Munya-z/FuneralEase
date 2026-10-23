using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Households.Queries.GetReferralConversions;

public record ReferralConversionDto(string HouseholdName, DateTimeOffset JoinedAt);

public record GetReferralConversionsQuery(HouseholdId HouseholdId) : IRequest<List<ReferralConversionDto>>;

public class GetReferralConversionsQueryHandler(IApplicationDbContext db)
    : IRequestHandler<GetReferralConversionsQuery, List<ReferralConversionDto>>
{
    public async Task<List<ReferralConversionDto>> Handle(GetReferralConversionsQuery request, CancellationToken cancellationToken)
    {
        var conversions =
            from log in db.ReferralLogs.AsNoTracking()
            join h in db.Households.AsNoTracking() on log.NewHouseholdId equals h.Id
            where log.ReferrerHouseholdId == request.HouseholdId
            orderby log.ConvertedAt descending
            select new ReferralConversionDto(h.Name, log.ConvertedAt);

        return await conversions.ToListAsync(cancellationToken);
    }
}

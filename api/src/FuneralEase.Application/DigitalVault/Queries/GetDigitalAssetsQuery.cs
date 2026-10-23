using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Application.DigitalVault.Commands;
using FuneralEase.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.DigitalVault.Queries;

public record GetDigitalAssetsQuery(HouseholdId HouseholdId) : IRequest<List<DigitalAssetDto>>;

public class GetDigitalAssetsQueryHandler(IApplicationDbContext db) : IRequestHandler<GetDigitalAssetsQuery, List<DigitalAssetDto>>
{
    public async Task<List<DigitalAssetDto>> Handle(GetDigitalAssetsQuery request, CancellationToken cancellationToken)
    {
        return await db.DigitalAssets
            .Where(a => a.HouseholdId == request.HouseholdId)
            .OrderBy(a => a.Category)
            .ThenBy(a => a.ServiceName)
            .Select(a => a.ToDto())
            .ToListAsync(cancellationToken);
    }
}

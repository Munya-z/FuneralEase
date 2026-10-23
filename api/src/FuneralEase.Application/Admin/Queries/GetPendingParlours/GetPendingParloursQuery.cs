using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Application.Parlours.DTOs;
using FuneralEase.Domain.Parlours;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Admin.Queries.GetPendingParlours;

public record GetPendingParloursQuery : IRequest<List<ParlourDto>>;

public class GetPendingParloursQueryHandler(IApplicationDbContext db)
    : IRequestHandler<GetPendingParloursQuery, List<ParlourDto>>
{
    public async Task<List<ParlourDto>> Handle(GetPendingParloursQuery request, CancellationToken cancellationToken)
    {
        return await db.Parlours
            .AsNoTracking()
            .Where(p => p.Status == ParlourStatus.PendingReview)
            .OrderBy(p => p.CreatedAt)
            .Select(p => p.ToDto())
            .ToListAsync(cancellationToken);
    }
}

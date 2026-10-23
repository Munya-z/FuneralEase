using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Application.Parlours.DTOs;
using FuneralEase.Domain.Parlours;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Parlours.Queries.SearchParlours;

public class SearchParloursQueryHandler(IApplicationDbContext db) : IRequestHandler<SearchParloursQuery, List<ParlourDto>>
{
    public async Task<List<ParlourDto>> Handle(SearchParloursQuery request, CancellationToken cancellationToken)
    {
        var query = db.Parlours.Where(p => p.Status == ParlourStatus.Active);

        if (!string.IsNullOrWhiteSpace(request.Area))
            query = query.Where(p => p.Area.ToLower().Contains(request.Area.ToLower()));

        if (!string.IsNullOrWhiteSpace(request.Province))
            query = query.Where(p => p.Province.ToLower() == request.Province.ToLower());

        return await query.Select(p => p.ToDto()).ToListAsync(cancellationToken);
    }
}

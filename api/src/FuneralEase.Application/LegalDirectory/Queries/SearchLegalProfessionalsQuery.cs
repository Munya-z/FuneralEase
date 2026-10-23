using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Application.LegalDirectory.Commands;
using FuneralEase.Domain.LegalDirectory;
using FuneralEase.Domain.Parlours;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.LegalDirectory.Queries;

public record SearchLegalProfessionalsQuery(
    string? Area,
    string? Province,
    LegalPracticeType? PracticeType) : IRequest<List<LegalProfessionalDto>>;

public class SearchLegalProfessionalsQueryHandler(IApplicationDbContext db)
    : IRequestHandler<SearchLegalProfessionalsQuery, List<LegalProfessionalDto>>
{
    public async Task<List<LegalProfessionalDto>> Handle(SearchLegalProfessionalsQuery request, CancellationToken cancellationToken)
    {
        var query = db.LegalProfessionals.Where(lp => lp.Status == ParlourStatus.Active);

        if (!string.IsNullOrWhiteSpace(request.Area))
            query = query.Where(lp => lp.Area.ToLower().Contains(request.Area.ToLower()));

        if (!string.IsNullOrWhiteSpace(request.Province))
            query = query.Where(lp => lp.Province.ToLower() == request.Province.ToLower());

        if (request.PracticeType.HasValue)
            query = query.Where(lp => lp.PracticeType == request.PracticeType.Value);

        return await query
            .OrderBy(lp => lp.FirmName)
            .Select(lp => lp.ToDto())
            .ToListAsync(cancellationToken);
    }
}

using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Application.Parlours.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Parlours.Queries.GetParlourByEmail;

public record GetParlourByEmailQuery(string Email) : IRequest<List<ParlourDto>>;

public class GetParlourByEmailQueryHandler(IApplicationDbContext db)
    : IRequestHandler<GetParlourByEmailQuery, List<ParlourDto>>
{
    public async Task<List<ParlourDto>> Handle(GetParlourByEmailQuery request, CancellationToken cancellationToken)
    {
        return await db.Parlours
            .AsNoTracking()
            .Where(p => p.EmailAddress.ToLower() == request.Email.ToLower())
            .Select(p => p.ToDto())
            .ToListAsync(cancellationToken);
    }
}

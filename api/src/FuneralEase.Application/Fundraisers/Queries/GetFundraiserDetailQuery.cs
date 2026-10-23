using FuneralEase.Application.Common.Exceptions;
using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Application.Fundraisers.Commands;
using FuneralEase.Domain.Common;
using FuneralEase.Domain.Fundraisers;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Fundraisers.Queries;

public record GetFundraiserDetailQuery(FundraiserId FundraiserId) : IRequest<FundraiserDetailDto>;

public class GetFundraiserDetailQueryHandler(IApplicationDbContext db) : IRequestHandler<GetFundraiserDetailQuery, FundraiserDetailDto>
{
    public async Task<FundraiserDetailDto> Handle(GetFundraiserDetailQuery request, CancellationToken cancellationToken)
    {
        var fundraiser = await db.Fundraisers
            .Include(f => f.Contributions)
            .FirstOrDefaultAsync(f => f.Id == request.FundraiserId, cancellationToken)
            ?? throw new NotFoundException(nameof(Fundraiser), request.FundraiserId);

        return fundraiser.ToDetailDto();
    }
}

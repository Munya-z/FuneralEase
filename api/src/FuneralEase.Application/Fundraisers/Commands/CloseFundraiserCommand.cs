using FuneralEase.Application.Common.Exceptions;
using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Common;
using FuneralEase.Domain.Fundraisers;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Fundraisers.Commands;

public record CloseFundraiserCommand(FundraiserId FundraiserId, HouseholdId HouseholdId) : IRequest<FundraiserDto>;

public class CloseFundraiserCommandHandler(IApplicationDbContext db) : IRequestHandler<CloseFundraiserCommand, FundraiserDto>
{
    public async Task<FundraiserDto> Handle(CloseFundraiserCommand request, CancellationToken cancellationToken)
    {
        var fundraiser = await db.Fundraisers
            .Include(f => f.Contributions)
            .FirstOrDefaultAsync(f => f.Id == request.FundraiserId && f.HouseholdId == request.HouseholdId, cancellationToken)
            ?? throw new NotFoundException(nameof(Fundraiser), request.FundraiserId);

        fundraiser.Close();
        await db.SaveChangesAsync(cancellationToken);
        return fundraiser.ToDto();
    }
}

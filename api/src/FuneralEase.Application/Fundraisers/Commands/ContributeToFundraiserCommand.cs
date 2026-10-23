using FuneralEase.Application.Common.Exceptions;
using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Application.Fundraisers.Commands;
using FuneralEase.Domain.Common;
using FuneralEase.Domain.Fundraisers;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Fundraisers.Commands;

public record ContributeToFundraiserCommand(
    FundraiserId FundraiserId,
    string DonorName,
    int AmountCents,
    string? Message) : IRequest<ContributionDto>;

public class ContributeToFundraiserCommandHandler(IApplicationDbContext db) : IRequestHandler<ContributeToFundraiserCommand, ContributionDto>
{
    public async Task<ContributionDto> Handle(ContributeToFundraiserCommand request, CancellationToken cancellationToken)
    {
        var fundraiser = await db.Fundraisers
            .Include(f => f.Contributions)
            .FirstOrDefaultAsync(f => f.Id == request.FundraiserId, cancellationToken)
            ?? throw new NotFoundException(nameof(Fundraiser), request.FundraiserId);

        var contribution = fundraiser.AddContribution(request.DonorName, request.AmountCents, request.Message);
        await db.SaveChangesAsync(cancellationToken);

        return new ContributionDto(
            contribution.Id.Value,
            contribution.DonorName,
            contribution.AmountCents,
            contribution.Message,
            contribution.DonatedAt);
    }
}

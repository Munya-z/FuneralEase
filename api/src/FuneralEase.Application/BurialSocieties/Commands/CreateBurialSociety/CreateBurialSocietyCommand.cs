using FuneralEase.Application.BurialSocieties.DTOs;
using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.BurialSocieties;
using FuneralEase.Domain.Common;
using MediatR;

namespace FuneralEase.Application.BurialSocieties.Commands.CreateBurialSociety;

public record CreateBurialSocietyCommand(
    HouseholdId AdminHouseholdId,
    string Name,
    decimal MonthlyContributionAmount,
    string? RegistrationNumber) : IRequest<BurialSocietyDto>;

public class CreateBurialSocietyCommandHandler(IApplicationDbContext db)
    : IRequestHandler<CreateBurialSocietyCommand, BurialSocietyDto>
{
    public async Task<BurialSocietyDto> Handle(CreateBurialSocietyCommand request, CancellationToken cancellationToken)
    {
        var society = BurialSociety.Create(
            request.AdminHouseholdId,
            request.Name,
            request.MonthlyContributionAmount,
            request.RegistrationNumber);

        db.BurialSocieties.Add(society);
        await db.SaveChangesAsync(cancellationToken);
        return society.ToDto();
    }
}

using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Common;
using FuneralEase.Domain.Fundraisers;
using MediatR;

namespace FuneralEase.Application.Fundraisers.Commands;

public record FundraiserDto(
    Guid Id,
    Guid HouseholdId,
    string Title,
    string Story,
    decimal GoalAmount,
    decimal TotalCollected,
    string Status,
    string DeceasedFullName,
    DateTimeOffset CreatedAt,
    int ContributionCount);

public record ContributionDto(
    Guid Id,
    string DonorName,
    int AmountCents,
    string? Message,
    DateTimeOffset DonatedAt);

public record FundraiserDetailDto(
    Guid Id,
    Guid HouseholdId,
    string Title,
    string Story,
    decimal GoalAmount,
    decimal TotalCollected,
    string Status,
    string DeceasedFullName,
    DateTimeOffset CreatedAt,
    int ContributionCount,
    List<ContributionDto> Contributions);

public static class FundraiserMappings
{
    public static FundraiserDto ToDto(this Fundraiser f) => new(
        f.Id.Value,
        f.HouseholdId.Value,
        f.Title,
        f.Story,
        f.GoalAmount,
        f.TotalCollected,
        f.Status.ToString(),
        f.DeceasedFullName,
        f.CreatedAt,
        f.Contributions.Count);

    public static FundraiserDetailDto ToDetailDto(this Fundraiser f) => new(
        f.Id.Value,
        f.HouseholdId.Value,
        f.Title,
        f.Story,
        f.GoalAmount,
        f.TotalCollected,
        f.Status.ToString(),
        f.DeceasedFullName,
        f.CreatedAt,
        f.Contributions.Count,
        f.Contributions.Select(c => new ContributionDto(c.Id.Value, c.DonorName, c.AmountCents, c.Message, c.DonatedAt)).ToList());
}

public record CreateFundraiserCommand(
    HouseholdId HouseholdId,
    string Title,
    string Story,
    decimal GoalAmount,
    string DeceasedFullName) : IRequest<FundraiserDto>;

public class CreateFundraiserCommandHandler(IApplicationDbContext db) : IRequestHandler<CreateFundraiserCommand, FundraiserDto>
{
    public async Task<FundraiserDto> Handle(CreateFundraiserCommand request, CancellationToken cancellationToken)
    {
        var fundraiser = Fundraiser.Create(
            request.HouseholdId,
            request.Title,
            request.Story,
            request.GoalAmount,
            request.DeceasedFullName);

        db.Fundraisers.Add(fundraiser);
        await db.SaveChangesAsync(cancellationToken);
        return fundraiser.ToDto();
    }
}

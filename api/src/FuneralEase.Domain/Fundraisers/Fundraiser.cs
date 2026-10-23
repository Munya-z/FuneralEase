using FuneralEase.Domain.Common;

namespace FuneralEase.Domain.Fundraisers;

public enum FundraiserStatus { Active, Closed, Cancelled }

public class Fundraiser : AggregateRoot<FundraiserId>
{
    private readonly List<FundraiserContribution> _contributions = [];

    public HouseholdId HouseholdId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string Story { get; private set; } = string.Empty;
    public decimal GoalAmount { get; private set; }
    public FundraiserStatus Status { get; private set; }
    public string DeceasedFullName { get; private set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }

    public IReadOnlyList<FundraiserContribution> Contributions => _contributions.AsReadOnly();

    public decimal TotalCollected => _contributions.Sum(c => c.AmountCents) / 100m;

    private Fundraiser() { }

    public static Fundraiser Create(
        HouseholdId householdId,
        string title,
        string story,
        decimal goalAmount,
        string deceasedFullName)
    {
        Guard.NotNullOrEmpty(title, nameof(title));
        Guard.NotNullOrEmpty(story, nameof(story));
        Guard.NotNullOrEmpty(deceasedFullName, nameof(deceasedFullName));
        Guard.GreaterThanZero(goalAmount, nameof(goalAmount));

        return new Fundraiser
        {
            Id = FundraiserId.New(),
            HouseholdId = householdId,
            Title = title,
            Story = story,
            GoalAmount = goalAmount,
            DeceasedFullName = deceasedFullName,
            Status = FundraiserStatus.Active,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };
    }

    public void Close()
    {
        if (Status != FundraiserStatus.Active)
            throw new InvalidOperationException("Only active fundraisers can be closed.");

        Status = FundraiserStatus.Closed;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void Cancel()
    {
        if (Status == FundraiserStatus.Cancelled)
            throw new InvalidOperationException("Fundraiser is already cancelled.");

        Status = FundraiserStatus.Cancelled;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public FundraiserContribution AddContribution(string donorName, int amountCents, string? message)
    {
        if (Status != FundraiserStatus.Active)
            throw new InvalidOperationException("Contributions can only be made to active fundraisers.");

        var contribution = FundraiserContribution.Create(Id, donorName, amountCents, message);
        _contributions.Add(contribution);
        UpdatedAt = DateTimeOffset.UtcNow;
        return contribution;
    }
}

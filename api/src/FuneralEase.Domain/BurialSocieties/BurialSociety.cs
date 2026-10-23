using FuneralEase.Domain.Common;

namespace FuneralEase.Domain.BurialSocieties;

public class BurialSociety : AggregateRoot<BurialSocietyId>
{
    private readonly List<BurialSocietyMember> _members = [];
    private readonly List<ContributionRecord> _contributions = [];

    public string Name { get; private set; } = string.Empty;
    /// <summary>Optional CIPC or informal society registration reference.</summary>
    public string? RegistrationNumber { get; private set; }
    /// <summary>The household that administers this burial society.</summary>
    public HouseholdId AdminHouseholdId { get; private set; }
    /// <summary>Expected monthly contribution per member in ZAR.</summary>
    public decimal MonthlyContributionAmount { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }

    public IReadOnlyList<BurialSocietyMember> Members => _members.AsReadOnly();
    public IReadOnlyList<ContributionRecord> Contributions => _contributions.AsReadOnly();

    private BurialSociety() { }

    public static BurialSociety Create(
        HouseholdId adminHouseholdId,
        string name,
        decimal monthlyContributionAmount,
        string? registrationNumber = null)
    {
        Guard.NotNullOrEmpty(name, nameof(name));
        if (monthlyContributionAmount <= 0)
            throw new ArgumentOutOfRangeException(nameof(monthlyContributionAmount));

        return new BurialSociety
        {
            Id = BurialSocietyId.New(),
            AdminHouseholdId = adminHouseholdId,
            Name = name,
            MonthlyContributionAmount = monthlyContributionAmount,
            RegistrationNumber = registrationNumber,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };
    }

    public BurialSocietyMember AddMember(HouseholdId householdId, string fullName, string mobileNumber)
    {
        if (_members.Any(m => m.HouseholdId == householdId))
            throw new InvalidOperationException("This household is already a member of the society.");

        var member = new BurialSocietyMember(Id, householdId, fullName, mobileNumber);
        _members.Add(member);
        UpdatedAt = DateTimeOffset.UtcNow;
        return member;
    }

    public ContributionRecord RecordContribution(
        BurialSocietyMemberId memberId,
        decimal amountPaid,
        string period,
        string? note = null)
    {
        if (!_members.Any(m => m.Id == memberId))
            throw new InvalidOperationException("Member not found in this society.");

        if (_contributions.Any(c => c.MemberId == memberId && c.Period == period))
            throw new InvalidOperationException($"Contribution already recorded for member in period {period}.");

        var record = new ContributionRecord(Id, memberId, amountPaid, period, note);
        _contributions.Add(record);
        UpdatedAt = DateTimeOffset.UtcNow;
        return record;
    }

    /// <summary>Returns the total amount collected for a given period.</summary>
    public decimal TotalCollectedForPeriod(string period) =>
        _contributions.Where(c => c.Period == period).Sum(c => c.AmountPaid);

    /// <summary>Returns member IDs that have NOT paid for a given period.</summary>
    public IEnumerable<BurialSocietyMemberId> UnpaidMembersForPeriod(string period) =>
        _members
            .Where(m => !_contributions.Any(c => c.MemberId == m.Id && c.Period == period))
            .Select(m => m.Id);
}

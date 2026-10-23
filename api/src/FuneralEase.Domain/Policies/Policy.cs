using FuneralEase.Domain.Common;
using FuneralEase.Domain.Policies.Events;

namespace FuneralEase.Domain.Policies;

public class Policy : AggregateRoot<PolicyId>
{
    private readonly List<PolicyBeneficiary> _beneficiaries = [];
    private readonly List<PolicyDocument> _documents = [];

    public HouseholdId HouseholdId { get; private set; }
    public string InsurerName { get; private set; } = string.Empty;
    public string PolicyNumber { get; private set; } = string.Empty;
    public decimal PremiumAmount { get; private set; }
    public decimal? CoverAmount { get; private set; }
    public DateOnly NextDueDate { get; private set; }
    public LapseStatus LapseStatus { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }

    public IReadOnlyList<PolicyBeneficiary> Beneficiaries => _beneficiaries.AsReadOnly();
    public IReadOnlyList<PolicyDocument> Documents => _documents.AsReadOnly();

    private Policy() { }

    public static Policy Create(
        HouseholdId householdId,
        string insurerName,
        string policyNumber,
        decimal premiumAmount,
        DateOnly nextDueDate,
        decimal? coverAmount = null)
    {
        Guard.NotNullOrEmpty(insurerName, nameof(insurerName));
        Guard.NotNullOrEmpty(policyNumber, nameof(policyNumber));
        Guard.GreaterThanZero(premiumAmount, nameof(premiumAmount));

        return new Policy
        {
            Id = PolicyId.New(),
            HouseholdId = householdId,
            InsurerName = insurerName,
            PolicyNumber = policyNumber,
            PremiumAmount = premiumAmount,
            CoverAmount = coverAmount,
            NextDueDate = nextDueDate,
            LapseStatus = LapseStatus.Current,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };
    }

    public void Update(string insurerName, string policyNumber, decimal premiumAmount, DateOnly nextDueDate, decimal? coverAmount = null)
    {
        InsurerName = Guard.NotNullOrEmpty(insurerName, nameof(insurerName));
        PolicyNumber = Guard.NotNullOrEmpty(policyNumber, nameof(policyNumber));
        PremiumAmount = Guard.GreaterThanZero(premiumAmount, nameof(premiumAmount));
        CoverAmount = coverAmount;
        NextDueDate = nextDueDate;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void MarkPremiumPaid(DateOnly paidForDate)
    {
        NextDueDate = paidForDate.AddMonths(1);
        LapseStatus = LapseStatus.Current;
        UpdatedAt = DateTimeOffset.UtcNow;
        RaiseDomainEvent(new PremiumPaidEvent(Id, HouseholdId, paidForDate));
    }

    public void Escalate()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var daysUntilDue = NextDueDate.DayNumber - today.DayNumber;

        var newStatus = daysUntilDue switch
        {
            > 7 => LapseStatus.Current,
            >= 0 => LapseStatus.DueSoon,
            >= -30 => LapseStatus.Overdue,
            _ => LapseStatus.Lapsed
        };

        if (newStatus == LapseStatus) return;

        LapseStatus = newStatus;
        UpdatedAt = DateTimeOffset.UtcNow;
        RaiseDomainEvent(new PolicyLapsedEvent(Id, HouseholdId, newStatus));
    }

    public void AddBeneficiary(string fullName, string relationship, decimal benefitPercentage)
    {
        var totalAllocation = _beneficiaries.Sum(b => b.BenefitPercentage) + benefitPercentage;
        if (totalAllocation > 100)
            throw new InvalidOperationException("Total beneficiary allocation cannot exceed 100%.");

        _beneficiaries.Add(new PolicyBeneficiary(Id, fullName, relationship, benefitPercentage));
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void RemoveBeneficiary(Guid beneficiaryId)
    {
        var beneficiary = _beneficiaries.FirstOrDefault(b => b.Id.Value == beneficiaryId)
            ?? throw new InvalidOperationException("Beneficiary not found.");
        _beneficiaries.Remove(beneficiary);
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void AddDocument(string storageKey, string originalFileName, string contentType)
    {
        _documents.Add(new PolicyDocument
        {
            StorageKey = Guard.NotNullOrEmpty(storageKey, nameof(storageKey)),
            OriginalFileName = Guard.NotNullOrEmpty(originalFileName, nameof(originalFileName)),
            ContentType = Guard.NotNullOrEmpty(contentType, nameof(contentType)),
            UploadedAt = DateTimeOffset.UtcNow
        });
        UpdatedAt = DateTimeOffset.UtcNow;
    }
}

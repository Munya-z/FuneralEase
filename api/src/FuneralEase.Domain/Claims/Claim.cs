using FuneralEase.Domain.Common;

namespace FuneralEase.Domain.Claims;

public class Claim : AggregateRoot<ClaimId>
{
    private readonly List<ChecklistItem> _checklistItems = [];
    private readonly List<ClaimDocument> _documents = [];

    public PolicyId PolicyId { get; private set; }
    public HouseholdId HouseholdId { get; private set; }
    public ClaimStatus Status { get; private set; }
    public string DeceasedFullName { get; private set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset? SubmittedAt { get; private set; }

    public IReadOnlyList<ChecklistItem> ChecklistItems => _checklistItems.AsReadOnly();
    public IReadOnlyList<ClaimDocument> Documents => _documents.AsReadOnly();

    private Claim() { }

    public ClaimDocument AddDocument(string storageKey, string originalFileName, string contentType)
    {
        var doc = new ClaimDocument
        {
            StorageKey = storageKey,
            OriginalFileName = originalFileName,
            ContentType = contentType,
            UploadedAt = DateTimeOffset.UtcNow
        };
        _documents.Add(doc);
        return doc;
    }

    public static Claim Create(
        PolicyId policyId,
        HouseholdId householdId,
        string deceasedFullName,
        IEnumerable<(string description, ChecklistItemType type)> checklistTemplate)
    {
        Guard.NotNullOrEmpty(deceasedFullName, nameof(deceasedFullName));

        var claimId = ClaimId.New();
        var claim = new Claim
        {
            Id = claimId,
            PolicyId = policyId,
            HouseholdId = householdId,
            DeceasedFullName = deceasedFullName,
            Status = ClaimStatus.InProgress,
            CreatedAt = DateTimeOffset.UtcNow
        };

        foreach (var (description, type) in checklistTemplate)
            claim._checklistItems.Add(new ChecklistItem(claimId, description, type));

        return claim;
    }

    public void UpdateChecklistItem(ChecklistItemId itemId, bool isChecked)
    {
        if (Status == ClaimStatus.Submitted)
            throw new InvalidOperationException("Cannot modify a submitted claim.");

        var item = _checklistItems.FirstOrDefault(i => i.Id == itemId)
            ?? throw new InvalidOperationException($"Checklist item {itemId} not found.");

        if (isChecked) item.Check();
        else item.Uncheck();
    }

    public void Complete()
    {
        if (Status == ClaimStatus.Submitted)
            throw new InvalidOperationException("Claim is already submitted.");

        var uncheckedRequired = _checklistItems
            .Where(i => i.ItemType == ChecklistItemType.Required && !i.IsChecked)
            .Select(i => i.Description)
            .ToList();

        if (uncheckedRequired.Count > 0)
            throw new InvalidOperationException(
                $"Cannot complete claim. Missing required items: {string.Join(", ", uncheckedRequired)}");

        Status = ClaimStatus.Submitted;
        SubmittedAt = DateTimeOffset.UtcNow;
    }

    /// <summary>
    /// Admin-only: advances the claim through the review workflow.
    /// Valid transitions: Submitted → UnderReview → Approved | Rejected.
    /// </summary>
    public void UpdateStatus(ClaimStatus newStatus)
    {
        var allowed = (Status, newStatus) switch
        {
            (ClaimStatus.Submitted, ClaimStatus.UnderReview) => true,
            (ClaimStatus.UnderReview, ClaimStatus.Approved) => true,
            (ClaimStatus.UnderReview, ClaimStatus.Rejected) => true,
            _ => false
        };

        if (!allowed)
            throw new InvalidOperationException(
                $"Cannot transition claim from {Status} to {newStatus}.");

        Status = newStatus;
    }
}

using FuneralEase.Domain.Common;

namespace FuneralEase.Domain.Claims;

public class ChecklistItem : Entity<ChecklistItemId>
{
    public ClaimId ClaimId { get; private set; }
    public string Description { get; private set; } = string.Empty;
    public ChecklistItemType ItemType { get; private set; }
    public bool IsChecked { get; private set; }

    private ChecklistItem() { }

    public ChecklistItem(ClaimId claimId, string description, ChecklistItemType itemType)
        : base(ChecklistItemId.New())
    {
        ClaimId = claimId;
        Description = Guard.NotNullOrEmpty(description, nameof(description));
        ItemType = itemType;
        IsChecked = false;
    }

    public void Check() => IsChecked = true;
    public void Uncheck() => IsChecked = false;
}

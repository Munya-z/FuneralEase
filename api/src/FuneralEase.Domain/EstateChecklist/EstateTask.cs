using FuneralEase.Domain.Common;

namespace FuneralEase.Domain.EstateChecklist;

public enum EstateTaskCategory
{
    HomeAffairs,
    Banking,
    Insurance,
    Legal,
    Medical,
    Property,
    Social,
    Utilities,
    Other
}

public class EstateTask : Entity<EstateTaskId>
{
    public EstateChecklistId ChecklistId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public EstateTaskCategory Category { get; private set; }
    public bool IsRequired { get; private set; }
    public bool IsCompleted { get; private set; }
    public DateTimeOffset? CompletedAt { get; private set; }
    public int SortOrder { get; private set; }

    private EstateTask() { }

    internal static EstateTask Create(
        EstateChecklistId checklistId,
        string title,
        string description,
        EstateTaskCategory category,
        bool isRequired,
        int sortOrder)
    {
        return new EstateTask
        {
            Id = EstateTaskId.New(),
            ChecklistId = checklistId,
            Title = title,
            Description = description,
            Category = category,
            IsRequired = isRequired,
            SortOrder = sortOrder,
            IsCompleted = false
        };
    }

    public void Complete()
    {
        IsCompleted = true;
        CompletedAt = DateTimeOffset.UtcNow;
    }

    public void Reopen()
    {
        IsCompleted = false;
        CompletedAt = null;
    }
}

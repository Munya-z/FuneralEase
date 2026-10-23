using FuneralEase.Domain.Common;

namespace FuneralEase.Domain.Obituaries;

public class Obituary : AggregateRoot<ObituaryId>
{
    public HouseholdId HouseholdId { get; private set; }
    public string DeceasedFullName { get; private set; } = string.Empty;
    public string Content { get; private set; } = string.Empty;
    public bool IsAiGenerated { get; private set; }
    public DateTimeOffset GeneratedAt { get; private set; }
    public bool IsPublished { get; private set; }

    private Obituary() { }

    public static Obituary Create(
        HouseholdId householdId,
        string deceasedFullName,
        string content,
        bool isAiGenerated)
    {
        Guard.NotNullOrEmpty(deceasedFullName, nameof(deceasedFullName));
        Guard.NotNullOrEmpty(content, nameof(content));

        return new Obituary
        {
            Id = ObituaryId.New(),
            HouseholdId = householdId,
            DeceasedFullName = deceasedFullName,
            Content = content,
            IsAiGenerated = isAiGenerated,
            GeneratedAt = DateTimeOffset.UtcNow,
            IsPublished = false
        };
    }

    public void Publish()
    {
        IsPublished = true;
    }

    public void UpdateContent(string content, bool isAiGenerated = false)
    {
        Content = Guard.NotNullOrEmpty(content, nameof(content));
        IsAiGenerated = isAiGenerated;
        GeneratedAt = DateTimeOffset.UtcNow;
    }
}

using FuneralEase.Domain.Common;

namespace FuneralEase.Domain.GriefJournal;

public enum JournalMood
{
    Devastated,
    Sad,
    Numb,
    Reflective,
    Grateful,
    Peaceful,
    Anxious,
    Angry,
    Other
}

public class GriefJournalEntry : AggregateRoot<GriefJournalEntryId>
{
    public UserId UserId { get; private set; }
    public HouseholdId HouseholdId { get; private set; }
    public string EncryptedContent { get; private set; } = string.Empty;
    public JournalMood Mood { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }

    private GriefJournalEntry() { }

    public static GriefJournalEntry Create(
        UserId userId,
        HouseholdId householdId,
        string encryptedContent,
        JournalMood mood)
    {
        Guard.NotNullOrEmpty(encryptedContent, nameof(encryptedContent));

        return new GriefJournalEntry
        {
            Id = GriefJournalEntryId.New(),
            UserId = userId,
            HouseholdId = householdId,
            EncryptedContent = encryptedContent,
            Mood = mood,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };
    }

    public void Update(string encryptedContent, JournalMood mood)
    {
        EncryptedContent = Guard.NotNullOrEmpty(encryptedContent, nameof(encryptedContent));
        Mood = mood;
        UpdatedAt = DateTimeOffset.UtcNow;
    }
}

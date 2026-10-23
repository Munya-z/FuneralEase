using FuneralEase.Domain.Common;

namespace FuneralEase.Domain.FuneralWishes;

public enum BurialType { Burial, Cremation, GreenBurial, Other }

public enum CeremonyType { Religious, Secular, Traditional, Graveside, Memorial, NoService }

public class FuneralWishes : AggregateRoot<FuneralWishesId>
{
    public HouseholdId HouseholdId { get; private set; }
    public BurialType BurialType { get; private set; }
    public CeremonyType CeremonyType { get; private set; }
    public string? MusicPreferences { get; private set; }
    public string? ReadingPreferences { get; private set; }
    public string? LegacyMessage { get; private set; }
    public string? SpecialRequests { get; private set; }
    public string? PreferredParlourName { get; private set; }
    public string? DonationsInLieuOf { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }

    private FuneralWishes() { }

    public static FuneralWishes Create(HouseholdId householdId)
    {
        return new FuneralWishes
        {
            Id = FuneralWishesId.New(),
            HouseholdId = householdId,
            BurialType = BurialType.Burial,
            CeremonyType = CeremonyType.Religious,
            UpdatedAt = DateTimeOffset.UtcNow
        };
    }

    public void Update(
        BurialType burialType,
        CeremonyType ceremonyType,
        string? musicPreferences,
        string? readingPreferences,
        string? legacyMessage,
        string? specialRequests,
        string? preferredParlourName,
        string? donationsInLieuOf)
    {
        BurialType = burialType;
        CeremonyType = ceremonyType;
        MusicPreferences = musicPreferences;
        ReadingPreferences = readingPreferences;
        LegacyMessage = legacyMessage;
        SpecialRequests = specialRequests;
        PreferredParlourName = preferredParlourName;
        DonationsInLieuOf = donationsInLieuOf;
        UpdatedAt = DateTimeOffset.UtcNow;
    }
}

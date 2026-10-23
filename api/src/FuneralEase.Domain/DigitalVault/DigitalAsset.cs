using FuneralEase.Domain.Common;

namespace FuneralEase.Domain.DigitalVault;

public enum DigitalAssetCategory
{
    Password,
    BankingAccount,
    SocialMedia,
    EmailAccount,
    Subscription,
    Investment,
    CryptoWallet,
    Other
}

public enum OnDeathInstruction
{
    DeleteAccount,
    MemorializeAccount,
    TransferToFamily,
    DoNothing
}

public class DigitalAsset : AggregateRoot<DigitalAssetId>
{
    public HouseholdId HouseholdId { get; private set; }
    public DigitalAssetCategory Category { get; private set; }
    public string ServiceName { get; private set; } = string.Empty;
    public string? Username { get; private set; }
    public string? EncryptedNotes { get; private set; }
    public string? Url { get; private set; }
    public OnDeathInstruction OnDeathInstruction { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }

    private DigitalAsset() { }

    public static DigitalAsset Create(
        HouseholdId householdId,
        DigitalAssetCategory category,
        string serviceName,
        string? username,
        string? encryptedNotes,
        string? url,
        OnDeathInstruction onDeathInstruction)
    {
        Guard.NotNullOrEmpty(serviceName, nameof(serviceName));

        return new DigitalAsset
        {
            Id = DigitalAssetId.New(),
            HouseholdId = householdId,
            Category = category,
            ServiceName = serviceName,
            Username = username,
            EncryptedNotes = encryptedNotes,
            Url = url,
            OnDeathInstruction = onDeathInstruction,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };
    }

    public void Update(
        DigitalAssetCategory category,
        string serviceName,
        string? username,
        string? encryptedNotes,
        string? url,
        OnDeathInstruction onDeathInstruction)
    {
        Category = category;
        ServiceName = Guard.NotNullOrEmpty(serviceName, nameof(serviceName));
        Username = username;
        EncryptedNotes = encryptedNotes;
        Url = url;
        OnDeathInstruction = onDeathInstruction;
        UpdatedAt = DateTimeOffset.UtcNow;
    }
}

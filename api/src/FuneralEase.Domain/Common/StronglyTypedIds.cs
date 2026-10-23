using System.Text.Json.Serialization;

namespace FuneralEase.Domain.Common;

[JsonConverter(typeof(JsonStringEnumConverter))]
public readonly record struct HouseholdId(Guid Value)
{
    public static HouseholdId New() => new(Guid.NewGuid());
    public static HouseholdId Empty => new(Guid.Empty);
    public override string ToString() => Value.ToString();
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public readonly record struct PolicyId(Guid Value)
{
    public static PolicyId New() => new(Guid.NewGuid());
    public static PolicyId Empty => new(Guid.Empty);
    public override string ToString() => Value.ToString();
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public readonly record struct ClaimId(Guid Value)
{
    public static ClaimId New() => new(Guid.NewGuid());
    public static ClaimId Empty => new(Guid.Empty);
    public override string ToString() => Value.ToString();
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public readonly record struct ChecklistItemId(Guid Value)
{
    public static ChecklistItemId New() => new(Guid.NewGuid());
    public static ChecklistItemId Empty => new(Guid.Empty);
    public override string ToString() => Value.ToString();
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public readonly record struct EmergencyAccessSessionId(Guid Value)
{
    public static EmergencyAccessSessionId New() => new(Guid.NewGuid());
    public static EmergencyAccessSessionId Empty => new(Guid.Empty);
    public override string ToString() => Value.ToString();
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public readonly record struct EmergencyContactId(Guid Value)
{
    public static EmergencyContactId New() => new(Guid.NewGuid());
    public static EmergencyContactId Empty => new(Guid.Empty);
    public override string ToString() => Value.ToString();
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public readonly record struct AccessGrantId(Guid Value)
{
    public static AccessGrantId New() => new(Guid.NewGuid());
    public static AccessGrantId Empty => new(Guid.Empty);
    public override string ToString() => Value.ToString();
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public readonly record struct SubscriptionId(Guid Value)
{
    public static SubscriptionId New() => new(Guid.NewGuid());
    public static SubscriptionId Empty => new(Guid.Empty);
    public override string ToString() => Value.ToString();
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public readonly record struct UserId(Guid Value)
{
    public static UserId New() => new(Guid.NewGuid());
    public static UserId Empty => new(Guid.Empty);
    public override string ToString() => Value.ToString();
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public readonly record struct ParlourId(Guid Value)
{
    public static ParlourId New() => new(Guid.NewGuid());
    public static ParlourId Empty => new(Guid.Empty);
    public override string ToString() => Value.ToString();
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public readonly record struct PolicyBeneficiaryId(Guid Value)
{
    public static PolicyBeneficiaryId New() => new(Guid.NewGuid());
    public static PolicyBeneficiaryId Empty => new(Guid.Empty);
    public override string ToString() => Value.ToString();
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public readonly record struct BurialSocietyId(Guid Value)
{
    public static BurialSocietyId New() => new(Guid.NewGuid());
    public static BurialSocietyId Empty => new(Guid.Empty);
    public override string ToString() => Value.ToString();
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public readonly record struct BurialSocietyMemberId(Guid Value)
{
    public static BurialSocietyMemberId New() => new(Guid.NewGuid());
    public static BurialSocietyMemberId Empty => new(Guid.Empty);
    public override string ToString() => Value.ToString();
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public readonly record struct ContributionRecordId(Guid Value)
{
    public static ContributionRecordId New() => new(Guid.NewGuid());
    public static ContributionRecordId Empty => new(Guid.Empty);
    public override string ToString() => Value.ToString();
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public readonly record struct SystemAuditLogId(Guid Value)
{
    public static SystemAuditLogId New() => new(Guid.NewGuid());
    public static SystemAuditLogId Empty => new(Guid.Empty);
    public override string ToString() => Value.ToString();
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public readonly record struct PremiumPaymentRecordId(Guid Value)
{
    public static PremiumPaymentRecordId New() => new(Guid.NewGuid());
    public static PremiumPaymentRecordId Empty => new(Guid.Empty);
    public override string ToString() => Value.ToString();
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public readonly record struct FuneralWishesId(Guid Value)
{
    public static FuneralWishesId New() => new(Guid.NewGuid());
    public static FuneralWishesId Empty => new(Guid.Empty);
    public override string ToString() => Value.ToString();
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public readonly record struct DigitalAssetId(Guid Value)
{
    public static DigitalAssetId New() => new(Guid.NewGuid());
    public static DigitalAssetId Empty => new(Guid.Empty);
    public override string ToString() => Value.ToString();
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public readonly record struct FundraiserId(Guid Value)
{
    public static FundraiserId New() => new(Guid.NewGuid());
    public static FundraiserId Empty => new(Guid.Empty);
    public override string ToString() => Value.ToString();
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public readonly record struct FundraiserContributionId(Guid Value)
{
    public static FundraiserContributionId New() => new(Guid.NewGuid());
    public static FundraiserContributionId Empty => new(Guid.Empty);
    public override string ToString() => Value.ToString();
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public readonly record struct EstateChecklistId(Guid Value)
{
    public static EstateChecklistId New() => new(Guid.NewGuid());
    public static EstateChecklistId Empty => new(Guid.Empty);
    public override string ToString() => Value.ToString();
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public readonly record struct EstateTaskId(Guid Value)
{
    public static EstateTaskId New() => new(Guid.NewGuid());
    public static EstateTaskId Empty => new(Guid.Empty);
    public override string ToString() => Value.ToString();
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public readonly record struct LegalProfessionalId(Guid Value)
{
    public static LegalProfessionalId New() => new(Guid.NewGuid());
    public static LegalProfessionalId Empty => new(Guid.Empty);
    public override string ToString() => Value.ToString();
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public readonly record struct AppointmentId(Guid Value)
{
    public static AppointmentId New() => new(Guid.NewGuid());
    public static AppointmentId Empty => new(Guid.Empty);
    public override string ToString() => Value.ToString();
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public readonly record struct GriefJournalEntryId(Guid Value)
{
    public static GriefJournalEntryId New() => new(Guid.NewGuid());
    public static GriefJournalEntryId Empty => new(Guid.Empty);
    public override string ToString() => Value.ToString();
}

[JsonConverter(typeof(JsonStringEnumConverter))]
public readonly record struct ObituaryId(Guid Value)
{
    public static ObituaryId New() => new(Guid.NewGuid());
    public static ObituaryId Empty => new(Guid.Empty);
    public override string ToString() => Value.ToString();
}

using FuneralEase.Domain.Common;
using FuneralEase.Domain.Parlours;

namespace FuneralEase.Domain.LegalDirectory;

public enum LegalPracticeType
{
    EstateAttorney,
    Notary,
    TaxPractitioner,
    ConveyancingAttorney,
    Accountant
}

public class LegalProfessional : AggregateRoot<LegalProfessionalId>
{
    public LegalPracticeType PracticeType { get; private set; }
    public string FirmName { get; private set; } = string.Empty;
    public string ContactName { get; private set; } = string.Empty;
    public string PhoneNumber { get; private set; } = string.Empty;
    public string EmailAddress { get; private set; } = string.Empty;
    public string Area { get; private set; } = string.Empty;
    public string Province { get; private set; } = string.Empty;
    public string? Website { get; private set; }
    public string Description { get; private set; } = string.Empty;
    public ParlourStatus Status { get; private set; }
    public string? ModerationNote { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }

    private LegalProfessional() { }

    public static LegalProfessional Submit(
        LegalPracticeType practiceType,
        string firmName,
        string contactName,
        string phoneNumber,
        string emailAddress,
        string area,
        string province,
        string description,
        string? website = null)
    {
        Guard.NotNullOrEmpty(firmName, nameof(firmName));
        Guard.NotNullOrEmpty(contactName, nameof(contactName));
        Guard.NotNullOrEmpty(phoneNumber, nameof(phoneNumber));
        Guard.NotNullOrEmpty(emailAddress, nameof(emailAddress));
        Guard.NotNullOrEmpty(area, nameof(area));
        Guard.NotNullOrEmpty(province, nameof(province));
        Guard.NotNullOrEmpty(description, nameof(description));

        return new LegalProfessional
        {
            Id = LegalProfessionalId.New(),
            PracticeType = practiceType,
            FirmName = firmName,
            ContactName = contactName,
            PhoneNumber = phoneNumber,
            EmailAddress = emailAddress,
            Area = area,
            Province = province,
            Description = description,
            Website = website,
            Status = ParlourStatus.PendingReview,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };
    }

    public void Approve()
    {
        Status = ParlourStatus.Active;
        ModerationNote = null;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void Reject(string note)
    {
        Status = ParlourStatus.Rejected;
        ModerationNote = note;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void Update(
        LegalPracticeType practiceType,
        string firmName,
        string contactName,
        string phoneNumber,
        string emailAddress,
        string area,
        string province,
        string description,
        string? website)
    {
        PracticeType = practiceType;
        FirmName = Guard.NotNullOrEmpty(firmName, nameof(firmName));
        ContactName = Guard.NotNullOrEmpty(contactName, nameof(contactName));
        PhoneNumber = Guard.NotNullOrEmpty(phoneNumber, nameof(phoneNumber));
        EmailAddress = Guard.NotNullOrEmpty(emailAddress, nameof(emailAddress));
        Area = Guard.NotNullOrEmpty(area, nameof(area));
        Province = Guard.NotNullOrEmpty(province, nameof(province));
        Description = Guard.NotNullOrEmpty(description, nameof(description));
        Website = website;
        if (Status == ParlourStatus.Active) Status = ParlourStatus.PendingReview;
        UpdatedAt = DateTimeOffset.UtcNow;
    }
}

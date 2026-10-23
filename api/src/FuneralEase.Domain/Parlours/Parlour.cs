using FuneralEase.Domain.Common;

namespace FuneralEase.Domain.Parlours;

public enum ParlourStatus { PendingReview, Active, Rejected }

public class Parlour : AggregateRoot<ParlourId>
{
    public string Name { get; private set; } = string.Empty;
    public string ContactName { get; private set; } = string.Empty;
    public string PhoneNumber { get; private set; } = string.Empty;
    public string EmailAddress { get; private set; } = string.Empty;
    public string Area { get; private set; } = string.Empty;
    public string Province { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public ParlourStatus Status { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }
    public string? ModerationNote { get; private set; }

    private Parlour() { }

    public static Parlour Submit(
        string name,
        string contactName,
        string phoneNumber,
        string emailAddress,
        string area,
        string province,
        string? description = null)
    {
        Guard.NotNullOrEmpty(name, nameof(name));
        Guard.NotNullOrEmpty(contactName, nameof(contactName));
        Guard.NotNullOrEmpty(phoneNumber, nameof(phoneNumber));
        Guard.NotNullOrEmpty(emailAddress, nameof(emailAddress));
        Guard.NotNullOrEmpty(area, nameof(area));
        Guard.NotNullOrEmpty(province, nameof(province));

        return new Parlour
        {
            Id = ParlourId.New(),
            Name = name,
            ContactName = contactName,
            PhoneNumber = phoneNumber,
            EmailAddress = emailAddress,
            Area = area,
            Province = province,
            Description = description,
            Status = ParlourStatus.PendingReview,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };
    }

    public void Approve()
    {
        Status = ParlourStatus.Active;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void Reject(string reason)
    {
        Status = ParlourStatus.Rejected;
        ModerationNote = reason;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void Update(string name, string contactName, string phoneNumber, string area, string province, string? description)
    {
        Name = Guard.NotNullOrEmpty(name, nameof(name));
        ContactName = Guard.NotNullOrEmpty(contactName, nameof(contactName));
        PhoneNumber = Guard.NotNullOrEmpty(phoneNumber, nameof(phoneNumber));
        Area = Guard.NotNullOrEmpty(area, nameof(area));
        Province = Guard.NotNullOrEmpty(province, nameof(province));
        Description = description;
        // Editing puts the listing back into review
        if (Status == ParlourStatus.Active) Status = ParlourStatus.PendingReview;
        UpdatedAt = DateTimeOffset.UtcNow;
    }
}

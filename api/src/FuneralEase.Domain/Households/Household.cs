using FuneralEase.Domain.Common;
using FuneralEase.Domain.Households.Events;

namespace FuneralEase.Domain.Households;

public class Household : AggregateRoot<HouseholdId>
{
    private readonly List<HouseholdMember> _members = [];

    public string Name { get; private set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; private set; }
    /// <summary>Short code used in referral links (e.g. funeralease.co.za/join?ref=ABC123).</summary>
    public string ReferralCode { get; private set; } = string.Empty;
    public bool IsDeleted { get; private set; }
    public DateTimeOffset? DeletedAt { get; private set; }
    public IReadOnlyList<HouseholdMember> Members => _members.AsReadOnly();

    /// <summary>POPIA §17 — right to erasure. Soft-deletes the household and all personal data references.</summary>
    public void Delete()
    {
        if (IsDeleted) throw new InvalidOperationException("Household is already deleted.");
        IsDeleted = true;
        DeletedAt = DateTimeOffset.UtcNow;
    }

    private Household() { }

    public static Household Create(UserId ownerId, string ownerFullName, string ownerMobile, string householdName)
    {
        Guard.NotNullOrEmpty(ownerFullName, nameof(ownerFullName));
        Guard.NotNullOrEmpty(ownerMobile, nameof(ownerMobile));
        Guard.NotNullOrEmpty(householdName, nameof(householdName));

        var householdId = HouseholdId.New();
        var household = new Household
        {
            Id = householdId,
            Name = householdName,
            CreatedAt = DateTimeOffset.UtcNow,
            ReferralCode = GenerateReferralCode()
        };

        var admin = new HouseholdMember(householdId, ownerId, ownerFullName, ownerMobile, MemberRole.Administrator);
        household._members.Add(admin);
        household.RaiseDomainEvent(new HouseholdMemberAddedEvent(householdId, ownerId, MemberRole.Administrator));

        return household;
    }

    public void AddMember(UserId userId, string fullName, string mobileNumber, MemberRole role)
    {
        if (role == MemberRole.Administrator && _members.Any(m => m.Role == MemberRole.Administrator))
            throw new InvalidOperationException("A household can only have one Administrator.");

        if (_members.Any(m => m.Id == userId))
            throw new InvalidOperationException("This user is already a member of the household.");

        var member = new HouseholdMember(Id, userId, fullName, mobileNumber, role);
        _members.Add(member);
        RaiseDomainEvent(new HouseholdMemberAddedEvent(Id, userId, role));
    }

    public bool IsMember(UserId userId) => _members.Any(m => m.Id == userId);

    public bool IsAdministrator(UserId userId) =>
        _members.Any(m => m.Id == userId && m.Role == MemberRole.Administrator);

    private static string GenerateReferralCode()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // omit confusable chars
        var random = new Random();
        return new string(Enumerable.Range(0, 6).Select(_ => chars[random.Next(chars.Length)]).ToArray());
    }
}

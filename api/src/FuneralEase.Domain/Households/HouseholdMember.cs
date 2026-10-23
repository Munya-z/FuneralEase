using FuneralEase.Domain.Common;

namespace FuneralEase.Domain.Households;

public class HouseholdMember : Entity<UserId>
{
    public HouseholdId HouseholdId { get; private set; }
    public string FullName { get; private set; } = string.Empty;
    public string MobileNumber { get; private set; } = string.Empty;
    public MemberRole Role { get; private set; }
    public DateTimeOffset JoinedAt { get; private set; }

    private HouseholdMember() { }

    public HouseholdMember(HouseholdId householdId, UserId userId, string fullName, string mobileNumber, MemberRole role)
        : base(userId)
    {
        HouseholdId = householdId;
        FullName = Guard.NotNullOrEmpty(fullName, nameof(fullName));
        MobileNumber = Guard.NotNullOrEmpty(mobileNumber, nameof(mobileNumber));
        Role = role;
        JoinedAt = DateTimeOffset.UtcNow;
    }
}

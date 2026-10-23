using FuneralEase.Domain.Common;

namespace FuneralEase.Domain.BurialSocieties;

public class BurialSocietyMember : Entity<BurialSocietyMemberId>
{
    public BurialSocietyId SocietyId { get; private set; }
    public HouseholdId HouseholdId { get; private set; }
    public string FullName { get; private set; } = string.Empty;
    public string MobileNumber { get; private set; } = string.Empty;
    public DateTimeOffset JoinedAt { get; private set; }

    private BurialSocietyMember() { }

    public BurialSocietyMember(BurialSocietyId societyId, HouseholdId householdId, string fullName, string mobileNumber)
        : base(BurialSocietyMemberId.New())
    {
        SocietyId = societyId;
        HouseholdId = householdId;
        FullName = Guard.NotNullOrEmpty(fullName, nameof(fullName));
        MobileNumber = Guard.NotNullOrEmpty(mobileNumber, nameof(mobileNumber));
        JoinedAt = DateTimeOffset.UtcNow;
    }
}

using FuneralEase.Domain.BurialSocieties;

namespace FuneralEase.Application.BurialSocieties.DTOs;

public static class BurialSocietyMappings
{
    public static BurialSocietyDto ToDto(this BurialSociety s) => new(
        s.Id.Value,
        s.Name,
        s.RegistrationNumber,
        s.AdminHouseholdId.Value,
        s.MonthlyContributionAmount,
        s.Members.Select(m => m.ToDto()).ToList(),
        s.Contributions.OrderByDescending(c => c.RecordedAt).Take(50).Select(c => c.ToDto()).ToList());

    public static BurialSocietyMemberDto ToDto(this BurialSocietyMember m) => new(
        m.Id.Value,
        m.HouseholdId.Value,
        m.FullName,
        m.MobileNumber,
        m.JoinedAt);

    public static ContributionRecordDto ToDto(this ContributionRecord c) => new(
        c.Id.Value,
        c.MemberId.Value,
        c.AmountPaid,
        c.Period,
        c.RecordedAt,
        c.Note);
}

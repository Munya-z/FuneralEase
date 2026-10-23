namespace FuneralEase.Application.BurialSocieties.DTOs;

public record BurialSocietyDto(
    Guid Id,
    string Name,
    string? RegistrationNumber,
    Guid AdminHouseholdId,
    decimal MonthlyContributionAmount,
    List<BurialSocietyMemberDto> Members,
    List<ContributionRecordDto> RecentContributions);

public record BurialSocietyMemberDto(
    Guid Id,
    Guid HouseholdId,
    string FullName,
    string MobileNumber,
    DateTimeOffset JoinedAt);

public record ContributionRecordDto(
    Guid Id,
    Guid MemberId,
    decimal AmountPaid,
    string Period,
    DateTimeOffset RecordedAt,
    string? Note);

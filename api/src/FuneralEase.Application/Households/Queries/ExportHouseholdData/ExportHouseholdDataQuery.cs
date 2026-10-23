using FuneralEase.Domain.Common;
using MediatR;

namespace FuneralEase.Application.Households.Queries.ExportHouseholdData;

/// <summary>POPIA §23 — subject access / data portability request.</summary>
public record ExportHouseholdDataQuery(HouseholdId HouseholdId) : IRequest<HouseholdDataExport>;

public record HouseholdDataExport(
    HouseholdExportDto Household,
    IReadOnlyList<PolicyExportDto> Policies,
    IReadOnlyList<MemberExportDto> Members,
    UserExportDto Owner);

public record HouseholdExportDto(Guid Id, string Name, DateTimeOffset CreatedAt);

public record PolicyExportDto(
    Guid Id,
    string InsurerName,
    string PolicyNumber,
    decimal PremiumAmount,
    DateOnly NextDueDate,
    string LapseStatus,
    DateTimeOffset CreatedAt);

public record MemberExportDto(string FullName, string MobileNumber, string Role, DateTimeOffset JoinedAt);

public record UserExportDto(string FullName, string MobileNumber, DateTimeOffset? PopiaConsentGivenAt, DateTimeOffset CreatedAt);

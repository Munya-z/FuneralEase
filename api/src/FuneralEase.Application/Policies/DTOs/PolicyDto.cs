using FuneralEase.Domain.Common;
using FuneralEase.Domain.Policies;

namespace FuneralEase.Application.Policies.DTOs;

public record PolicyDto(
    Guid Id,
    Guid HouseholdId,
    string InsurerName,
    string PolicyNumber,
    decimal PremiumAmount,
    decimal? CoverAmount,
    DateOnly NextDueDate,
    string LapseStatus,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    List<BeneficiaryDto> Beneficiaries,
    List<PolicyDocumentDto> Documents);

public record BeneficiaryDto(Guid Id, string FullName, string Relationship, decimal BenefitPercentage);

public record PolicyDocumentDto(string StorageKey, string OriginalFileName, string ContentType, DateTimeOffset UploadedAt);

public static class PolicyMappings
{
    public static PolicyDto ToDto(this Policy p) => new(
        p.Id.Value,
        p.HouseholdId.Value,
        p.InsurerName,
        p.PolicyNumber,
        p.PremiumAmount,
        p.CoverAmount,
        p.NextDueDate,
        p.LapseStatus.ToString(),
        p.CreatedAt,
        p.UpdatedAt,
        p.Beneficiaries.Select(b => new BeneficiaryDto(b.Id.Value, b.FullName, b.Relationship, b.BenefitPercentage)).ToList(),
        p.Documents.Select(d => new PolicyDocumentDto(d.StorageKey, d.OriginalFileName, d.ContentType, d.UploadedAt)).ToList());
}

using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.LegalDirectory;
using MediatR;

namespace FuneralEase.Application.LegalDirectory.Commands;

public record LegalProfessionalDto(
    Guid Id,
    string PracticeType,
    string FirmName,
    string ContactName,
    string PhoneNumber,
    string EmailAddress,
    string Area,
    string Province,
    string? Website,
    string Description,
    string Status);

public static class LegalProfessionalMappings
{
    public static LegalProfessionalDto ToDto(this LegalProfessional lp) => new(
        lp.Id.Value,
        lp.PracticeType.ToString(),
        lp.FirmName,
        lp.ContactName,
        lp.PhoneNumber,
        lp.EmailAddress,
        lp.Area,
        lp.Province,
        lp.Website,
        lp.Description,
        lp.Status.ToString());
}

public record SubmitLegalProfessionalCommand(
    LegalPracticeType PracticeType,
    string FirmName,
    string ContactName,
    string PhoneNumber,
    string EmailAddress,
    string Area,
    string Province,
    string Description,
    string? Website = null) : IRequest<LegalProfessionalDto>;

public class SubmitLegalProfessionalCommandHandler(IApplicationDbContext db) : IRequestHandler<SubmitLegalProfessionalCommand, LegalProfessionalDto>
{
    public async Task<LegalProfessionalDto> Handle(SubmitLegalProfessionalCommand request, CancellationToken cancellationToken)
    {
        var professional = LegalProfessional.Submit(
            request.PracticeType,
            request.FirmName,
            request.ContactName,
            request.PhoneNumber,
            request.EmailAddress,
            request.Area,
            request.Province,
            request.Description,
            request.Website);

        db.LegalProfessionals.Add(professional);
        await db.SaveChangesAsync(cancellationToken);
        return professional.ToDto();
    }
}

using MediatR;

namespace FuneralEase.Application.Content.Queries.GetClaimsChecklistTemplates;

public class GetClaimsChecklistTemplatesQueryHandler : IRequestHandler<GetClaimsChecklistTemplatesQuery, List<ChecklistTemplateItemDto>>
{
    public Task<List<ChecklistTemplateItemDto>> Handle(GetClaimsChecklistTemplatesQuery request, CancellationToken cancellationToken)
    {
        var template = new List<ChecklistTemplateItemDto>
        {
            new("Certified copy of deceased's ID document", "Required"),
            new("Original death certificate", "Required"),
            new("Completed claim form from insurer", "Required"),
            new("Claimant's ID document (certified copy)", "Required"),
            new("Proof of relationship to deceased", "Required"),
            new("Bank account details for payout", "Required"),
            new("Burial/cremation order", "Optional"),
            new("Police report (if death was unnatural)", "Optional"),
        };
        return Task.FromResult(template);
    }
}

using MediatR;

namespace FuneralEase.Application.Content.Queries.GetClaimsChecklistTemplates;

public record ChecklistTemplateItemDto(string Description, string ItemType);
public record GetClaimsChecklistTemplatesQuery : IRequest<List<ChecklistTemplateItemDto>>;

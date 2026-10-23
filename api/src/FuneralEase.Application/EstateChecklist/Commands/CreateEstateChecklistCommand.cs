using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Common;
using MediatR;

namespace FuneralEase.Application.EstateChecklist.Commands;

public record EstateTaskDto(
    Guid Id,
    string Title,
    string Description,
    string Category,
    bool IsRequired,
    bool IsCompleted,
    DateTimeOffset? CompletedAt,
    int SortOrder);

public record EstateChecklistDto(
    Guid Id,
    Guid HouseholdId,
    string DeceasedFullName,
    DateOnly DateOfDeath,
    DateTimeOffset CreatedAt,
    List<EstateTaskDto> Tasks,
    int CompletedCount,
    int TotalCount);

public static class EstateChecklistMappings
{
    public static EstateTaskDto ToDto(this Domain.EstateChecklist.EstateTask t) => new(
        t.Id.Value,
        t.Title,
        t.Description,
        t.Category.ToString(),
        t.IsRequired,
        t.IsCompleted,
        t.CompletedAt,
        t.SortOrder);

    public static EstateChecklistDto ToDto(this Domain.EstateChecklist.EstateChecklist c) => new(
        c.Id.Value,
        c.HouseholdId.Value,
        c.DeceasedFullName,
        c.DateOfDeath,
        c.CreatedAt,
        c.Tasks.OrderBy(t => t.SortOrder).Select(t => t.ToDto()).ToList(),
        c.Tasks.Count(t => t.IsCompleted),
        c.Tasks.Count);
}

public record CreateEstateChecklistCommand(
    HouseholdId HouseholdId,
    string DeceasedFullName,
    DateOnly DateOfDeath) : IRequest<EstateChecklistDto>;

public class CreateEstateChecklistCommandHandler(IApplicationDbContext db) : IRequestHandler<CreateEstateChecklistCommand, EstateChecklistDto>
{
    public async Task<EstateChecklistDto> Handle(CreateEstateChecklistCommand request, CancellationToken cancellationToken)
    {
        var checklist = Domain.EstateChecklist.EstateChecklist.Create(
            request.HouseholdId,
            request.DeceasedFullName,
            request.DateOfDeath);

        db.EstateChecklists.Add(checklist);
        await db.SaveChangesAsync(cancellationToken);
        return checklist.ToDto();
    }
}

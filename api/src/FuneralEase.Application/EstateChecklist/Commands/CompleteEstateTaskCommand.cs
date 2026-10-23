using FuneralEase.Application.Common.Exceptions;
using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Application.EstateChecklist.Commands;
using FuneralEase.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.EstateChecklist.Commands;

public record CompleteEstateTaskCommand(
    EstateChecklistId ChecklistId,
    EstateTaskId TaskId,
    HouseholdId HouseholdId,
    bool IsCompleted) : IRequest<EstateChecklistDto>;

public class CompleteEstateTaskCommandHandler(IApplicationDbContext db) : IRequestHandler<CompleteEstateTaskCommand, EstateChecklistDto>
{
    public async Task<EstateChecklistDto> Handle(CompleteEstateTaskCommand request, CancellationToken cancellationToken)
    {
        var checklist = await db.EstateChecklists
            .Include(c => c.Tasks)
            .FirstOrDefaultAsync(c => c.Id == request.ChecklistId && c.HouseholdId == request.HouseholdId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.EstateChecklist.EstateChecklist), request.ChecklistId);

        if (request.IsCompleted)
            checklist.CompleteTask(request.TaskId);
        else
            checklist.ReopenTask(request.TaskId);

        await db.SaveChangesAsync(cancellationToken);
        return checklist.ToDto();
    }
}

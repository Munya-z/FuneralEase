using FuneralEase.Application.Common.Exceptions;
using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Application.EstateChecklist.Commands;
using FuneralEase.Domain.Common;
using FuneralEase.Domain.EstateChecklist;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.EstateChecklist.Commands;

public record AddCustomTaskCommand(
    EstateChecklistId ChecklistId,
    HouseholdId HouseholdId,
    string Title,
    string Description,
    EstateTaskCategory Category) : IRequest<EstateChecklistDto>;

public class AddCustomTaskCommandHandler(IApplicationDbContext db) : IRequestHandler<AddCustomTaskCommand, EstateChecklistDto>
{
    public async Task<EstateChecklistDto> Handle(AddCustomTaskCommand request, CancellationToken cancellationToken)
    {
        var checklist = await db.EstateChecklists
            .Include(c => c.Tasks)
            .FirstOrDefaultAsync(c => c.Id == request.ChecklistId && c.HouseholdId == request.HouseholdId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.EstateChecklist.EstateChecklist), request.ChecklistId);

        checklist.AddTask(request.Title, request.Description, request.Category);
        await db.SaveChangesAsync(cancellationToken);
        return checklist.ToDto();
    }
}

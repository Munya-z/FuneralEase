using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Application.Obituaries.Commands;
using FuneralEase.Domain.Common;
using FuneralEase.Domain.Obituaries;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Obituaries.Commands;

public record SaveObituaryCommand(
    HouseholdId HouseholdId,
    string DeceasedFullName,
    string Content) : IRequest<ObituaryDto>;

public class SaveObituaryCommandHandler(IApplicationDbContext db) : IRequestHandler<SaveObituaryCommand, ObituaryDto>
{
    public async Task<ObituaryDto> Handle(SaveObituaryCommand request, CancellationToken cancellationToken)
    {
        var existing = await db.Obituaries
            .FirstOrDefaultAsync(o => o.HouseholdId == request.HouseholdId, cancellationToken);

        Obituary obituary;
        if (existing is null)
        {
            obituary = Obituary.Create(request.HouseholdId, request.DeceasedFullName, request.Content, isAiGenerated: false);
            db.Obituaries.Add(obituary);
        }
        else
        {
            existing.UpdateContent(request.Content);
            obituary = existing;
        }

        await db.SaveChangesAsync(cancellationToken);
        return obituary.ToDto();
    }
}

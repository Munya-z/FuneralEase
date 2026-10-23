using FuneralEase.Application.Common.Exceptions;
using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Common;
using FuneralEase.Domain.GriefJournal;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.GriefJournal.Commands;

public record DeleteJournalEntryCommand(
    GriefJournalEntryId EntryId,
    UserId UserId,
    HouseholdId HouseholdId) : IRequest;

public class DeleteJournalEntryCommandHandler(IApplicationDbContext db) : IRequestHandler<DeleteJournalEntryCommand>
{
    public async Task Handle(DeleteJournalEntryCommand request, CancellationToken cancellationToken)
    {
        var entry = await db.GriefJournalEntries
            .FirstOrDefaultAsync(e => e.Id == request.EntryId && e.UserId == request.UserId && e.HouseholdId == request.HouseholdId, cancellationToken)
            ?? throw new NotFoundException(nameof(GriefJournalEntry), request.EntryId);

        db.GriefJournalEntries.Remove(entry);
        await db.SaveChangesAsync(cancellationToken);
    }
}

using FuneralEase.Application.Common.Exceptions;
using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Application.GriefJournal.Commands;
using FuneralEase.Domain.Common;
using FuneralEase.Domain.GriefJournal;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.GriefJournal.Commands;

public record UpdateJournalEntryCommand(
    GriefJournalEntryId EntryId,
    UserId UserId,
    HouseholdId HouseholdId,
    string Content,
    JournalMood Mood) : IRequest<JournalEntryDto>;

public class UpdateJournalEntryCommandHandler(IApplicationDbContext db) : IRequestHandler<UpdateJournalEntryCommand, JournalEntryDto>
{
    public async Task<JournalEntryDto> Handle(UpdateJournalEntryCommand request, CancellationToken cancellationToken)
    {
        var entry = await db.GriefJournalEntries
            .FirstOrDefaultAsync(e => e.Id == request.EntryId && e.UserId == request.UserId && e.HouseholdId == request.HouseholdId, cancellationToken)
            ?? throw new NotFoundException(nameof(GriefJournalEntry), request.EntryId);

        entry.Update(request.Content, request.Mood);
        await db.SaveChangesAsync(cancellationToken);
        return entry.ToDto();
    }
}

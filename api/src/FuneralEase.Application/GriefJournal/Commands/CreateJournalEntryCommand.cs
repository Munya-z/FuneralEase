using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Common;
using FuneralEase.Domain.GriefJournal;
using MediatR;

namespace FuneralEase.Application.GriefJournal.Commands;

public record JournalEntryDto(
    Guid Id,
    string Content,
    string Mood,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

public static class GriefJournalMappings
{
    public static JournalEntryDto ToDto(this GriefJournalEntry e) => new(
        e.Id.Value,
        e.EncryptedContent,
        e.Mood.ToString(),
        e.CreatedAt,
        e.UpdatedAt);
}

public record CreateJournalEntryCommand(
    UserId UserId,
    HouseholdId HouseholdId,
    string Content,
    JournalMood Mood) : IRequest<JournalEntryDto>;

public class CreateJournalEntryCommandHandler(IApplicationDbContext db) : IRequestHandler<CreateJournalEntryCommand, JournalEntryDto>
{
    public async Task<JournalEntryDto> Handle(CreateJournalEntryCommand request, CancellationToken cancellationToken)
    {
        var entry = GriefJournalEntry.Create(
            request.UserId,
            request.HouseholdId,
            request.Content,
            request.Mood);

        db.GriefJournalEntries.Add(entry);
        await db.SaveChangesAsync(cancellationToken);
        return entry.ToDto();
    }
}

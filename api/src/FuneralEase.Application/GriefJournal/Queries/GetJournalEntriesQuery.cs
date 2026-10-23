using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Application.GriefJournal.Commands;
using FuneralEase.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.GriefJournal.Queries;

public record GetJournalEntriesQuery(UserId UserId, HouseholdId HouseholdId) : IRequest<List<JournalEntryDto>>;

public class GetJournalEntriesQueryHandler(IApplicationDbContext db) : IRequestHandler<GetJournalEntriesQuery, List<JournalEntryDto>>
{
    public async Task<List<JournalEntryDto>> Handle(GetJournalEntriesQuery request, CancellationToken cancellationToken)
    {
        return await db.GriefJournalEntries
            .Where(e => e.UserId == request.UserId && e.HouseholdId == request.HouseholdId)
            .OrderByDescending(e => e.CreatedAt)
            .Select(e => e.ToDto())
            .ToListAsync(cancellationToken);
    }
}

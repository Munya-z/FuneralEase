using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Common;
using FuneralEase.Domain.FuneralWishes;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.FuneralWishes;

public record FuneralWishesDto(
    Guid Id,
    Guid HouseholdId,
    string BurialType,
    string CeremonyType,
    string? MusicPreferences,
    string? ReadingPreferences,
    string? LegacyMessage,
    string? SpecialRequests,
    string? PreferredParlourName,
    string? DonationsInLieuOf,
    DateTimeOffset UpdatedAt);

public static class FuneralWishesMappings
{
    public static FuneralWishesDto ToDto(this Domain.FuneralWishes.FuneralWishes w) => new(
        w.Id.Value,
        w.HouseholdId.Value,
        w.BurialType.ToString(),
        w.CeremonyType.ToString(),
        w.MusicPreferences,
        w.ReadingPreferences,
        w.LegacyMessage,
        w.SpecialRequests,
        w.PreferredParlourName,
        w.DonationsInLieuOf,
        w.UpdatedAt);
}

public record UpsertWishesCommand(
    HouseholdId HouseholdId,
    BurialType BurialType,
    CeremonyType CeremonyType,
    string? MusicPreferences,
    string? ReadingPreferences,
    string? LegacyMessage,
    string? SpecialRequests,
    string? PreferredParlourName,
    string? DonationsInLieuOf) : IRequest<FuneralWishesDto>;

public class UpsertWishesCommandHandler(IApplicationDbContext db) : IRequestHandler<UpsertWishesCommand, FuneralWishesDto>
{
    public async Task<FuneralWishesDto> Handle(UpsertWishesCommand request, CancellationToken cancellationToken)
    {
        var wishes = await db.FuneralWishes
            .FirstOrDefaultAsync(w => w.HouseholdId == request.HouseholdId, cancellationToken);

        if (wishes is null)
        {
            wishes = Domain.FuneralWishes.FuneralWishes.Create(request.HouseholdId);
            db.FuneralWishes.Add(wishes);
        }

        wishes.Update(
            request.BurialType,
            request.CeremonyType,
            request.MusicPreferences,
            request.ReadingPreferences,
            request.LegacyMessage,
            request.SpecialRequests,
            request.PreferredParlourName,
            request.DonationsInLieuOf);

        await db.SaveChangesAsync(cancellationToken);
        return wishes.ToDto();
    }
}

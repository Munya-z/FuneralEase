using FuneralEase.Api.Extensions;
using FuneralEase.Application.FuneralWishes;
using FuneralEase.Domain.FuneralWishes;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FuneralEase.Api.Controllers;

[ApiController]
[Route("wishes")]
[Authorize(Policy = "HouseholdMember")]
public class FuneralWishesController(ISender sender) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetWishes(CancellationToken ct)
    {
        var result = await sender.Send(new GetWishesQuery(User.GetHouseholdId()), ct);
        return Ok(result);
    }

    [HttpPut]
    public async Task<IActionResult> UpsertWishes([FromBody] UpsertWishesRequest request, CancellationToken ct)
    {
        var command = new UpsertWishesCommand(
            User.GetHouseholdId(),
            request.BurialType,
            request.CeremonyType,
            request.MusicPreferences,
            request.ReadingPreferences,
            request.LegacyMessage,
            request.SpecialRequests,
            request.PreferredParlourName,
            request.DonationsInLieuOf);
        var result = await sender.Send(command, ct);
        return Ok(result);
    }
}

public record UpsertWishesRequest(
    BurialType BurialType,
    CeremonyType CeremonyType,
    string? MusicPreferences,
    string? ReadingPreferences,
    string? LegacyMessage,
    string? SpecialRequests,
    string? PreferredParlourName,
    string? DonationsInLieuOf);

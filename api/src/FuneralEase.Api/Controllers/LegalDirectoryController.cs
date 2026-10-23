using FuneralEase.Application.LegalDirectory.Commands;
using FuneralEase.Application.LegalDirectory.Queries;
using FuneralEase.Domain.LegalDirectory;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FuneralEase.Api.Controllers;

[ApiController]
[Route("legal-directory")]
public class LegalDirectoryController(ISender sender) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> Search(
        [FromQuery] string? area,
        [FromQuery] string? province,
        [FromQuery] string? practiceType,
        CancellationToken ct)
    {
        LegalPracticeType? practiceTypeEnum = practiceType is not null && Enum.TryParse<LegalPracticeType>(practiceType, ignoreCase: true, out var parsed)
            ? parsed : null;
        var result = await sender.Send(new SearchLegalProfessionalsQuery(area, province, practiceTypeEnum), ct);
        return Ok(result);
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> Submit([FromBody] SubmitLegalProfessionalCommand command, CancellationToken ct)
    {
        var result = await sender.Send(command, ct);
        return CreatedAtAction(nameof(Search), new { }, result);
    }
}

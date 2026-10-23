using FuneralEase.Application.Admin.Commands.ModerateParlour;
using FuneralEase.Application.Admin.Commands.OverrideSubscription;
using FuneralEase.Application.Admin.Commands.UpdateClaimStatus;
using FuneralEase.Application.Admin.Queries.GetAdminClaimDetail;
using FuneralEase.Application.Admin.Queries.GetAdminClaims;
using FuneralEase.Application.Admin.Queries.GetAuditLog;
using FuneralEase.Application.Admin.Queries.GetBillingEvents;
using FuneralEase.Application.Admin.Queries.GetAdminBurialSocietyDetail;
using FuneralEase.Application.Admin.Queries.GetBurialSocieties;
using FuneralEase.Application.Admin.Queries.GetDashboard;
using FuneralEase.Application.Admin.Queries.GetHouseholdDetail;
using FuneralEase.Application.Admin.Queries.GetPendingParlours;
using FuneralEase.Application.Admin.Queries.SearchHouseholds;
using FuneralEase.Application.LegalDirectory.Commands.Admin;
using FuneralEase.Domain.Audit;
using FuneralEase.Domain.BurialSocieties;
using FuneralEase.Domain.Claims;
using FuneralEase.Domain.Common;
using FuneralEase.Domain.Subscriptions;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FuneralEase.Api.Controllers;

[ApiController]
[Route("admin")]
[Authorize(Policy = "AdminScope")]
public class AdminController(ISender sender) : ControllerBase
{
    /// <summary>Overview metrics for the admin dashboard.</summary>
    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard(CancellationToken ct)
    {
        var result = await sender.Send(new GetDashboardQuery(), ct);
        return Ok(result);
    }

    /// <summary>Paginated list of all households with policy and subscription summary.</summary>
    [HttpGet("households")]
    public async Task<IActionResult> Households(
        [FromQuery] string? search,
        [FromQuery] string? tier,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var result = await sender.Send(new SearchHouseholdsQuery(search, tier, page, pageSize), ct);
        return Ok(result);
    }

    /// <summary>Full detail for a single household — members, subscription, policies, recent audit events.</summary>
    [HttpGet("households/{householdId:guid}")]
    public async Task<IActionResult> HouseholdDetail(Guid householdId, CancellationToken ct)
    {
        var result = await sender.Send(new GetHouseholdDetailQuery(new HouseholdId(householdId)), ct);
        if (result is null) return NotFound();
        return Ok(result);
    }

    /// <summary>Paginated list of all claims across all households, optionally filtered by status.</summary>
    [HttpGet("claims")]
    public async Task<IActionResult> Claims(
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        ClaimStatus? statusEnum = status is not null && Enum.TryParse<ClaimStatus>(status, ignoreCase: true, out var parsed)
            ? parsed : null;
        var result = await sender.Send(new GetAdminClaimsQuery(statusEnum, page, pageSize), ct);
        return Ok(result);
    }

    /// <summary>Full detail for a single claim — checklist items, policy, household.</summary>
    [HttpGet("claims/{claimId:guid}")]
    public async Task<IActionResult> ClaimDetail(Guid claimId, CancellationToken ct)
    {
        var result = await sender.Send(new GetAdminClaimDetailQuery(new ClaimId(claimId)), ct);
        if (result is null) return NotFound();
        return Ok(result);
    }

    /// <summary>Advance a claim through the review workflow (Submitted → UnderReview → Approved | Rejected).</summary>
    [HttpPost("claims/{claimId:guid}/status")]
    public async Task<IActionResult> UpdateClaimStatus(Guid claimId, [FromBody] UpdateClaimStatusRequest body, CancellationToken ct)
    {
        if (!Enum.TryParse<ClaimStatus>(body.Status, ignoreCase: true, out var status))
            return BadRequest(new { title = $"Unknown claim status: {body.Status}" });

        await sender.Send(new UpdateClaimStatusCommand(new ClaimId(claimId), status), ct);
        return NoContent();
    }

    /// <summary>Admin override — force-sets a household's subscription tier. Bypasses billing provider.</summary>
    [HttpPost("households/{householdId:guid}/subscription/override")]
    public async Task<IActionResult> OverrideSubscription(Guid householdId, [FromBody] OverrideSubscriptionRequest body, CancellationToken ct)
    {
        if (!Enum.TryParse<SubscriptionTier>(body.Tier, ignoreCase: true, out var tier))
            return BadRequest(new { title = $"Unknown subscription tier: {body.Tier}" });

        var result = await sender.Send(new OverrideSubscriptionCommand(new HouseholdId(householdId), tier, body.ExpiresAt), ct);
        return Ok(result);
    }

    /// <summary>Queue of parlours awaiting moderation.</summary>
    [HttpGet("parlours/pending")]
    public async Task<IActionResult> PendingParlours(CancellationToken ct)
    {
        var result = await sender.Send(new GetPendingParloursQuery(), ct);
        return Ok(result);
    }

    /// <summary>Approve or reject a parlour listing.</summary>
    [HttpPost("parlours/{parlourId:guid}/moderate")]
    public async Task<IActionResult> ModerateParlour(
        Guid parlourId,
        [FromBody] ModerateRequest body,
        CancellationToken ct)
    {
        var result = await sender.Send(
            new ModerateParlourCommand(new ParlourId(parlourId), body.Approve, body.RejectionReason), ct);
        return Ok(result);
    }

    /// <summary>Paginated billing event log for reconciliation.</summary>
    [HttpGet("billing/events")]
    public async Task<IActionResult> BillingEvents(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken ct = default)
    {
        var result = await sender.Send(new GetBillingEventsQuery(page, pageSize), ct);
        return Ok(result);
    }

    /// <summary>Full detail for a single burial society — members, contribution history.</summary>
    [HttpGet("burial-societies/{societyId:guid}")]
    public async Task<IActionResult> BurialSocietyDetail(Guid societyId, CancellationToken ct)
    {
        var result = await sender.Send(new GetAdminBurialSocietyDetailQuery(new BurialSocietyId(societyId)), ct);
        if (result is null) return NotFound();
        return Ok(result);
    }

    /// <summary>Paginated list of all burial societies with member counts.</summary>
    [HttpGet("burial-societies")]
    public async Task<IActionResult> BurialSocieties(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var result = await sender.Send(new GetBurialSocietiesQuery(page, pageSize), ct);
        return Ok(result);
    }

    /// <summary>Approve or reject a legal professional listing.</summary>
    [HttpPost("legal-directory/{id:guid}/moderate")]
    public async Task<IActionResult> ModerateLegalProfessional(
        Guid id,
        [FromBody] ModerateLegalProfessionalRequest body,
        CancellationToken ct)
    {
        if (!Enum.TryParse<ModerationAction>(body.Action, ignoreCase: true, out var action))
            return BadRequest(new { title = $"Unknown moderation action: {body.Action}" });

        var result = await sender.Send(
            new ModerateLegalProfessionalCommand(new LegalProfessionalId(id), action, body.Note), ct);
        return Ok(result);
    }

    /// <summary>Paginated, filterable system audit log.</summary>
    [HttpGet("audit-log")]
    public async Task<IActionResult> AuditLog(
        [FromQuery] string? category,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken ct = default)
    {
        AuditCategory? cat = category is not null && Enum.TryParse<AuditCategory>(category, ignoreCase: true, out var parsed)
            ? parsed : null;
        var result = await sender.Send(new GetAuditLogQuery(page, pageSize, cat), ct);
        return Ok(result);
    }
}

public record ModerateRequest(bool Approve, string? RejectionReason);
public record UpdateClaimStatusRequest(string Status);
public record OverrideSubscriptionRequest(string Tier, DateTimeOffset? ExpiresAt);
public record ModerateLegalProfessionalRequest(string Action, string? Note);

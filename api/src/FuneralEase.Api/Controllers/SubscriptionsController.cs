using FuneralEase.Api.Extensions;
using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Application.Subscriptions.Commands.InitializePayment;
using FuneralEase.Application.Subscriptions.Commands.VerifyPayment;
using FuneralEase.Application.Subscriptions.Queries.GetSubscription;
using FuneralEase.Application.Subscriptions.Webhooks;
using FuneralEase.Domain.Common;
using FuneralEase.Domain.Subscriptions;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FuneralEase.Api.Controllers;

[ApiController]
public class SubscriptionsController(ISender sender, IBillingProvider billing) : ControllerBase
{
    [HttpGet("subscriptions/{householdId:guid}")]
    [Authorize(Policy = "HouseholdMember")]
    public async Task<IActionResult> GetSubscription(Guid householdId, CancellationToken ct)
    {
        var result = await sender.Send(new GetSubscriptionQuery(new HouseholdId(householdId)), ct);
        return Ok(result);
    }

    /// <summary>
    /// Initialises a Paystack payment session for upgrading the household subscription.
    /// Returns a checkout URL that the client redirects the user to.
    /// The tier is applied once Paystack sends the charge.success webhook.
    /// </summary>
    [HttpPost("subscriptions/{householdId:guid}/upgrade")]
    [Authorize(Policy = "HouseholdMember")]
    public async Task<IActionResult> Upgrade(Guid householdId, [FromBody] UpgradeRequest body, CancellationToken ct)
    {
        var callerHouseholdId = User.GetHouseholdId();
        if (callerHouseholdId != new HouseholdId(householdId))
            return Forbid();

        if (!Enum.TryParse<SubscriptionTier>(body.Tier, ignoreCase: true, out var tier))
            return BadRequest("Invalid tier.");

        if (string.IsNullOrEmpty(body.Email))
            return BadRequest("Email is required to initialise a Paystack payment.");

        var callbackUrl = body.CallbackUrl ?? $"{Request.Scheme}://{Request.Host}/payment-complete";

        var result = await sender.Send(
            new InitializePaymentCommand(new HouseholdId(householdId), body.Email, tier, callbackUrl), ct);

        return Ok(result);
    }

    /// <summary>
    /// Verifies a Paystack payment by reference after the user returns from checkout.
    /// Applies the upgrade immediately so local/dev does not depend on webhooks alone.
    /// </summary>
    [HttpPost("subscriptions/{householdId:guid}/verify")]
    [Authorize(Policy = "HouseholdMember")]
    public async Task<IActionResult> VerifyPayment(Guid householdId, [FromBody] VerifyPaymentRequest body, CancellationToken ct)
    {
        var callerHouseholdId = User.GetHouseholdId();
        if (callerHouseholdId != new HouseholdId(householdId))
            return Forbid();

        if (string.IsNullOrWhiteSpace(body.Reference))
            return BadRequest("Payment reference is required.");

        var result = await sender.Send(
            new VerifyPaymentCommand(new HouseholdId(householdId), body.Reference.Trim()), ct);

        return Ok(result);
    }

    /// <summary>
    /// Paystack webhook — verifies the HMAC-SHA512 signature, parses the event,
    /// and dispatches a HandleWebhookCommand to apply the subscription change.
    /// </summary>
    [HttpPost("webhooks/paystack")]
    [AllowAnonymous]
    public async Task<IActionResult> PaystackWebhook(CancellationToken ct)
    {
        // Read raw body for signature verification
        Request.EnableBuffering();
        using var reader = new StreamReader(Request.Body, leaveOpen: true);
        var rawPayload = await reader.ReadToEndAsync(ct);
        Request.Body.Position = 0;

        var signature = Request.Headers["x-paystack-signature"].FirstOrDefault() ?? "";

        if (!billing.VerifyWebhookSignature(rawPayload, signature))
        {
            return BadRequest(new { title = "Invalid webhook signature." });
        }

        var billingEvent = billing.ParseWebhookEvent(rawPayload);
        if (billingEvent is null)
            return Ok(); // non-actionable event — still return 200 so Paystack doesn't retry

        await sender.Send(new HandleWebhookCommand(
            BillingChannel.Paystack,
            rawPayload,
            billingEvent.EventType,
            billingEvent.HouseholdId,
            billingEvent.NewTier,
            billingEvent.EntitlementExpiresAt,
            billingEvent.ProviderEventId), ct);

        return Ok();
    }

    // Legacy AppStore / PlayStore webhooks remain for completeness
    [HttpPost("webhooks/appstore")]
    [AllowAnonymous]
    public async Task<IActionResult> AppStoreWebhook([FromBody] WebhookPayload payload, CancellationToken ct)
    {
        await sender.Send(new HandleWebhookCommand(BillingChannel.AppStore, payload.RawPayload, payload.EventType, payload.HouseholdRef, payload.NewTier, payload.EntitlementExpiresAt, payload.ProviderEventId), ct);
        return Ok();
    }

    [HttpPost("webhooks/playstore")]
    [AllowAnonymous]
    public async Task<IActionResult> PlayStoreWebhook([FromBody] WebhookPayload payload, CancellationToken ct)
    {
        await sender.Send(new HandleWebhookCommand(BillingChannel.PlayStore, payload.RawPayload, payload.EventType, payload.HouseholdRef, payload.NewTier, payload.EntitlementExpiresAt, payload.ProviderEventId), ct);
        return Ok();
    }
}

public record UpgradeRequest(string Tier, string Email, string? CallbackUrl = null);

public record VerifyPaymentRequest(string Reference);

public record WebhookPayload(
    string EventType,
    string HouseholdRef,
    SubscriptionTier NewTier,
    DateTimeOffset EntitlementExpiresAt,
    string RawPayload,
    string? ProviderEventId = null);

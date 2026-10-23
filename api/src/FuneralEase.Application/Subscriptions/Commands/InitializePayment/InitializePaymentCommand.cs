using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Common;
using FuneralEase.Domain.Subscriptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Subscriptions.Commands.InitializePayment;

public record InitializePaymentCommand(
    HouseholdId HouseholdId,
    string Email,
    SubscriptionTier Tier,
    string CallbackUrl) : IRequest<InitializePaymentResult>;

public record InitializePaymentResult(
    string AuthorizationUrl,
    string Reference);

public class InitializePaymentCommandHandler(IApplicationDbContext db, IBillingProvider billing)
    : IRequestHandler<InitializePaymentCommand, InitializePaymentResult>
{
    // Paystack ZAR amounts are in cents (R1.00 = 100)
    private static readonly Dictionary<SubscriptionTier, long> PriceMap = new()
    {
        { SubscriptionTier.Individual, 900L },   // R9/mo
        { SubscriptionTier.Family, 2900L },      // R29/mo
        { SubscriptionTier.BurialSociety, 9900L }, // R99/mo
    };

    public async Task<InitializePaymentResult> Handle(InitializePaymentCommand request, CancellationToken cancellationToken)
    {
        if (!PriceMap.TryGetValue(request.Tier, out var amountKobo))
            throw new InvalidOperationException($"Tier {request.Tier} cannot be purchased via payment.");

        // Ensure the household actually exists before creating a Paystack session
        var exists = await db.Subscriptions
            .AnyAsync(s => s.HouseholdId == request.HouseholdId, cancellationToken);
        if (!exists)
            throw new InvalidOperationException("Subscription not found for this household.");

        var reference = $"FE-{request.HouseholdId.Value:N}-{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}";

        var result = await billing.InitializeTransactionAsync(new InitializeTransactionRequest(
            HouseholdId: request.HouseholdId.Value.ToString(),
            Email: request.Email,
            AmountInKobo: amountKobo,
            Reference: reference,
            Tier: request.Tier,
            CallbackUrl: request.CallbackUrl), cancellationToken);

        return new InitializePaymentResult(result.AuthorizationUrl, result.Reference);
    }
}

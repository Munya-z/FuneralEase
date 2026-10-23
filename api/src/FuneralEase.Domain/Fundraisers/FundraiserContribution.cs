using FuneralEase.Domain.Common;

namespace FuneralEase.Domain.Fundraisers;

public class FundraiserContribution : Entity<FundraiserContributionId>
{
    public FundraiserId FundraiserId { get; private set; }
    public string DonorName { get; private set; } = string.Empty;
    public int AmountCents { get; private set; }
    public string? Message { get; private set; }
    public DateTimeOffset DonatedAt { get; private set; }

    private FundraiserContribution() { }

    internal static FundraiserContribution Create(
        FundraiserId fundraiserId,
        string donorName,
        int amountCents,
        string? message)
    {
        Guard.NotNullOrEmpty(donorName, nameof(donorName));

        return new FundraiserContribution
        {
            Id = FundraiserContributionId.New(),
            FundraiserId = fundraiserId,
            DonorName = donorName,
            AmountCents = amountCents,
            Message = message,
            DonatedAt = DateTimeOffset.UtcNow
        };
    }
}

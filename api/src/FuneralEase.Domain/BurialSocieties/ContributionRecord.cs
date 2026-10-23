using FuneralEase.Domain.Common;

namespace FuneralEase.Domain.BurialSocieties;

/// <summary>
/// Records a single monthly contribution payment from a member.
/// Period format: "YYYY-MM" (e.g. "2026-07").
/// </summary>
public class ContributionRecord : Entity<ContributionRecordId>
{
    public BurialSocietyId SocietyId { get; private set; }
    public BurialSocietyMemberId MemberId { get; private set; }
    public decimal AmountPaid { get; private set; }
    /// <summary>"YYYY-MM" e.g. "2026-07"</summary>
    public string Period { get; private set; } = string.Empty;
    public DateTimeOffset RecordedAt { get; private set; }
    /// <summary>Free-text note (e.g. payment reference, cash receipt number).</summary>
    public string? Note { get; private set; }

    private ContributionRecord() { }

    public ContributionRecord(
        BurialSocietyId societyId,
        BurialSocietyMemberId memberId,
        decimal amountPaid,
        string period,
        string? note = null)
        : base(ContributionRecordId.New())
    {
        if (amountPaid <= 0) throw new ArgumentOutOfRangeException(nameof(amountPaid), "Amount must be positive.");
        if (string.IsNullOrWhiteSpace(period) || period.Length != 7 || period[4] != '-')
            throw new ArgumentException("Period must be in YYYY-MM format.", nameof(period));

        SocietyId = societyId;
        MemberId = memberId;
        AmountPaid = amountPaid;
        Period = period;
        Note = note;
        RecordedAt = DateTimeOffset.UtcNow;
    }
}

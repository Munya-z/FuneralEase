using FuneralEase.Domain.Common;
using FuneralEase.Domain.Policies;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FuneralEase.Infrastructure.Persistence.Configurations;

public class PremiumPaymentRecordConfiguration : IEntityTypeConfiguration<PremiumPaymentRecord>
{
    public void Configure(EntityTypeBuilder<PremiumPaymentRecord> builder)
    {
        builder.ToTable("PremiumPaymentRecords");

        builder.HasKey(r => r.Id);
        builder.Property(r => r.Id)
            .HasConversion(id => id.Value, value => new PremiumPaymentRecordId(value));

        builder.Property(r => r.PolicyId)
            .HasConversion(id => id.Value, value => new PolicyId(value))
            .IsRequired();

        builder.Property(r => r.HouseholdId)
            .HasConversion(id => id.Value, value => new HouseholdId(value))
            .IsRequired();

        builder.HasIndex(r => r.PolicyId);
        builder.HasIndex(r => r.HouseholdId);

        builder.Property(r => r.AmountPaid).HasPrecision(18, 2).IsRequired();
        builder.Property(r => r.PaidForDate).IsRequired();
        builder.Property(r => r.RecordedAt).IsRequired();
    }
}

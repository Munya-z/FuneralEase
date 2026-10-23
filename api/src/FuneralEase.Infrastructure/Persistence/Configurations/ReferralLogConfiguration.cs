using FuneralEase.Domain.Common;
using FuneralEase.Domain.Households;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FuneralEase.Infrastructure.Persistence.Configurations;

public class ReferralLogConfiguration : IEntityTypeConfiguration<ReferralLog>
{
    public void Configure(EntityTypeBuilder<ReferralLog> builder)
    {
        builder.ToTable("ReferralLogs");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.ReferrerHouseholdId)
            .HasConversion(id => id.Value, value => new HouseholdId(value))
            .IsRequired();

        builder.Property(r => r.NewHouseholdId)
            .HasConversion(id => id.Value, value => new HouseholdId(value))
            .IsRequired();

        builder.Property(r => r.ReferralCode).IsRequired().HasMaxLength(10);
        builder.Property(r => r.ConvertedAt).IsRequired();

        builder.HasIndex(r => r.NewHouseholdId).IsUnique(); // one referral per new household
        builder.HasIndex(r => r.ReferrerHouseholdId);
    }
}

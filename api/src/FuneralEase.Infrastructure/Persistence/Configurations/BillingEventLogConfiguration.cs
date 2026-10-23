using FuneralEase.Domain.Common;
using FuneralEase.Domain.Subscriptions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FuneralEase.Infrastructure.Persistence.Configurations;

public class BillingEventLogConfiguration : IEntityTypeConfiguration<BillingEventLog>
{
    public void Configure(EntityTypeBuilder<BillingEventLog> builder)
    {
        builder.ToTable("BillingEventLogs");

        builder.HasKey(b => b.Id);

        builder.Property(b => b.Channel).IsRequired().HasMaxLength(30);
        builder.Property(b => b.ProviderEventId).IsRequired().HasMaxLength(200);
        builder.Property(b => b.EventType).IsRequired().HasMaxLength(100);
        builder.Property(b => b.HouseholdId)
            .HasConversion(id => id.Value, value => new HouseholdId(value));
        builder.Property(b => b.ProcessedAt).IsRequired();

        // Unique constraint: one row per (Channel, ProviderEventId)
        builder.HasIndex(b => new { b.Channel, b.ProviderEventId }).IsUnique();
    }
}

using FuneralEase.Domain.Common;
using FuneralEase.Domain.Subscriptions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FuneralEase.Infrastructure.Persistence.Configurations;

public class SubscriptionConfiguration : IEntityTypeConfiguration<Subscription>
{
    public void Configure(EntityTypeBuilder<Subscription> builder)
    {
        builder.ToTable("Subscriptions");

        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id)
            .HasConversion(id => id.Value, value => new SubscriptionId(value));

        builder.Property(s => s.HouseholdId)
            .HasConversion(id => id.Value, value => new HouseholdId(value));

        builder.HasIndex(s => s.HouseholdId).IsUnique();

        builder.Property(s => s.Tier).HasConversion<string>().HasMaxLength(30);
        builder.Property(s => s.Channel).HasConversion<string>().HasMaxLength(30);
        builder.Property(s => s.EntitlementExpiresAt).IsRequired(false);
        builder.Property(s => s.TrialEndsAt).IsRequired(false);
        builder.Property(s => s.CreatedAt).IsRequired();
        builder.Property(s => s.UpdatedAt).IsRequired();
    }
}

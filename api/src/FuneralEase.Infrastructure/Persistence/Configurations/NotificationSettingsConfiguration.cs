using FuneralEase.Domain.Common;
using FuneralEase.Domain.Notifications;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FuneralEase.Infrastructure.Persistence.Configurations;

public class NotificationSettingsConfiguration : IEntityTypeConfiguration<HouseholdNotificationSettings>
{
    public void Configure(EntityTypeBuilder<HouseholdNotificationSettings> builder)
    {
        builder.ToTable("household_notification_settings");

        builder.HasKey(s => s.HouseholdId);

        builder.Property(s => s.HouseholdId)
            .HasConversion(id => id.Value, value => new HouseholdId(value))
            .HasColumnName("household_id");

        builder.Property(s => s.PremiumDue).HasColumnName("premium_due").HasDefaultValue(true);
        builder.Property(s => s.PremiumOverdue).HasColumnName("premium_overdue").HasDefaultValue(true);
        builder.Property(s => s.LapseWarning).HasColumnName("lapse_warning").HasDefaultValue(true);
        builder.Property(s => s.ClaimUpdates).HasColumnName("claim_updates").HasDefaultValue(true);
        builder.Property(s => s.EmergencyAccess).HasColumnName("emergency_access").HasDefaultValue(true);
        builder.Property(s => s.ReferralJoins).HasColumnName("referral_joins").HasDefaultValue(false);

        builder.Property(s => s.UpdatedAt).HasColumnName("updated_at");
    }
}

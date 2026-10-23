using FuneralEase.Domain.Common;
using FuneralEase.Domain.FuneralWishes;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FuneralEase.Infrastructure.Persistence.Configurations;

public class FuneralWishesConfiguration : IEntityTypeConfiguration<FuneralWishes>
{
    public void Configure(EntityTypeBuilder<FuneralWishes> builder)
    {
        builder.ToTable("FuneralWishes");

        builder.HasKey(w => w.Id);
        builder.Property(w => w.Id)
            .HasConversion(id => id.Value, value => new FuneralWishesId(value));

        builder.Property(w => w.HouseholdId)
            .HasConversion(id => id.Value, value => new HouseholdId(value));

        builder.HasIndex(w => w.HouseholdId).IsUnique();

        builder.Property(w => w.BurialType).HasConversion<string>().HasMaxLength(50).IsRequired();
        builder.Property(w => w.CeremonyType).HasConversion<string>().HasMaxLength(50).IsRequired();
        builder.Property(w => w.MusicPreferences).HasMaxLength(1000).IsRequired(false);
        builder.Property(w => w.ReadingPreferences).HasMaxLength(1000).IsRequired(false);
        builder.Property(w => w.LegacyMessage).HasMaxLength(5000).IsRequired(false);
        builder.Property(w => w.SpecialRequests).HasMaxLength(2000).IsRequired(false);
        builder.Property(w => w.PreferredParlourName).HasMaxLength(200).IsRequired(false);
        builder.Property(w => w.DonationsInLieuOf).HasMaxLength(500).IsRequired(false);
        builder.Property(w => w.UpdatedAt).IsRequired();
    }
}

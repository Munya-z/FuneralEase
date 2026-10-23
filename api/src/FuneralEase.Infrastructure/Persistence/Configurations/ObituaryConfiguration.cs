using FuneralEase.Domain.Common;
using FuneralEase.Domain.Obituaries;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FuneralEase.Infrastructure.Persistence.Configurations;

public class ObituaryConfiguration : IEntityTypeConfiguration<Obituary>
{
    public void Configure(EntityTypeBuilder<Obituary> builder)
    {
        builder.ToTable("Obituaries");

        builder.HasKey(o => o.Id);
        builder.Property(o => o.Id)
            .HasConversion(id => id.Value, value => new ObituaryId(value));

        builder.Property(o => o.HouseholdId)
            .HasConversion(id => id.Value, value => new HouseholdId(value));

        builder.HasIndex(o => o.HouseholdId).IsUnique();

        builder.Property(o => o.DeceasedFullName).HasMaxLength(200).IsRequired();
        builder.Property(o => o.Content).HasMaxLength(10000).IsRequired();
        builder.Property(o => o.IsAiGenerated).IsRequired();
        builder.Property(o => o.GeneratedAt).IsRequired();
        builder.Property(o => o.IsPublished).IsRequired();
    }
}

using FuneralEase.Domain.Claims;
using FuneralEase.Domain.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FuneralEase.Infrastructure.Persistence.Configurations;

public class ClaimConfiguration : IEntityTypeConfiguration<Claim>
{
    public void Configure(EntityTypeBuilder<Claim> builder)
    {
        builder.ToTable("Claims");

        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id)
            .HasConversion(id => id.Value, value => new ClaimId(value));

        builder.Property(c => c.PolicyId)
            .HasConversion(id => id.Value, value => new PolicyId(value));

        builder.Property(c => c.HouseholdId)
            .HasConversion(id => id.Value, value => new HouseholdId(value));

        builder.HasIndex(c => c.HouseholdId);

        builder.Property(c => c.DeceasedFullName).IsRequired().HasMaxLength(200);
        builder.Property(c => c.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(c => c.CreatedAt).IsRequired();
        builder.Property(c => c.SubmittedAt).IsRequired(false);

        builder.HasMany(c => c.ChecklistItems)
            .WithOne()
            .HasForeignKey(i => i.ClaimId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.OwnsMany(c => c.Documents, d =>
        {
            d.ToJson();
            d.Property(doc => doc.StorageKey).IsRequired();
            d.Property(doc => doc.OriginalFileName).IsRequired();
            d.Property(doc => doc.ContentType).IsRequired();
            d.Property(doc => doc.UploadedAt).IsRequired();
        });
    }
}

public class ChecklistItemConfiguration : IEntityTypeConfiguration<ChecklistItem>
{
    public void Configure(EntityTypeBuilder<ChecklistItem> builder)
    {
        builder.ToTable("ChecklistItems");

        builder.HasKey(i => i.Id);
        builder.Property(i => i.Id)
            .HasConversion(id => id.Value, value => new ChecklistItemId(value));

        builder.Property(i => i.ClaimId)
            .HasConversion(id => id.Value, value => new ClaimId(value));

        builder.Property(i => i.Description).IsRequired().HasMaxLength(500);
        builder.Property(i => i.ItemType).HasConversion<string>().HasMaxLength(20);
        builder.Property(i => i.IsChecked).IsRequired();
    }
}

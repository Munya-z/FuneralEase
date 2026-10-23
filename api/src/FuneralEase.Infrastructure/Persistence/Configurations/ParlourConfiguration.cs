using FuneralEase.Domain.Common;
using FuneralEase.Domain.Parlours;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FuneralEase.Infrastructure.Persistence.Configurations;

public class ParlourConfiguration : IEntityTypeConfiguration<Parlour>
{
    public void Configure(EntityTypeBuilder<Parlour> builder)
    {
        builder.ToTable("Parlours");

        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id)
            .HasConversion(id => id.Value, value => new ParlourId(value));

        builder.Property(p => p.Name).IsRequired().HasMaxLength(200);
        builder.Property(p => p.ContactName).IsRequired().HasMaxLength(200);
        builder.Property(p => p.PhoneNumber).IsRequired().HasMaxLength(30);
        builder.Property(p => p.EmailAddress).IsRequired().HasMaxLength(200);
        builder.Property(p => p.Area).IsRequired().HasMaxLength(100);
        builder.Property(p => p.Province).IsRequired().HasMaxLength(100);
        builder.Property(p => p.Description).IsRequired(false).HasMaxLength(1000);
        builder.Property(p => p.Status).HasConversion<string>().HasMaxLength(20);
        builder.Property(p => p.ModerationNote).IsRequired(false).HasMaxLength(500);
        builder.Property(p => p.CreatedAt).IsRequired();
        builder.Property(p => p.UpdatedAt).IsRequired();

        builder.HasIndex(p => p.Area);
        builder.HasIndex(p => p.Province);
        builder.HasIndex(p => p.Status);
    }
}

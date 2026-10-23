using FuneralEase.Domain.Common;
using FuneralEase.Domain.LegalDirectory;
using FuneralEase.Domain.Parlours;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FuneralEase.Infrastructure.Persistence.Configurations;

public class LegalProfessionalConfiguration : IEntityTypeConfiguration<LegalProfessional>
{
    public void Configure(EntityTypeBuilder<LegalProfessional> builder)
    {
        builder.ToTable("LegalProfessionals");

        builder.HasKey(lp => lp.Id);
        builder.Property(lp => lp.Id)
            .HasConversion(id => id.Value, value => new LegalProfessionalId(value));

        builder.Property(lp => lp.PracticeType).HasConversion<string>().HasMaxLength(50).IsRequired();
        builder.Property(lp => lp.FirmName).HasMaxLength(200).IsRequired();
        builder.Property(lp => lp.ContactName).HasMaxLength(200).IsRequired();
        builder.Property(lp => lp.PhoneNumber).HasMaxLength(20).IsRequired();
        builder.Property(lp => lp.EmailAddress).HasMaxLength(200).IsRequired();
        builder.Property(lp => lp.Area).HasMaxLength(100).IsRequired();
        builder.Property(lp => lp.Province).HasMaxLength(100).IsRequired();
        builder.Property(lp => lp.Website).HasMaxLength(500).IsRequired(false);
        builder.Property(lp => lp.Description).HasMaxLength(1000).IsRequired();
        builder.Property(lp => lp.Status).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(lp => lp.ModerationNote).IsRequired(false);
        builder.Property(lp => lp.CreatedAt).IsRequired();
        builder.Property(lp => lp.UpdatedAt).IsRequired();

        builder.HasIndex(lp => lp.Status);
        builder.HasIndex(lp => lp.Province);
    }
}

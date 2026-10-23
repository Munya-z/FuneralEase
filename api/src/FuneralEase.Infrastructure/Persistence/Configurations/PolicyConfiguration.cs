using FuneralEase.Domain.Common;
using FuneralEase.Domain.Policies;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FuneralEase.Infrastructure.Persistence.Configurations;

public class PolicyConfiguration : IEntityTypeConfiguration<Policy>
{
    public void Configure(EntityTypeBuilder<Policy> builder)
    {
        builder.ToTable("Policies");

        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id)
            .HasConversion(id => id.Value, value => new PolicyId(value));

        builder.Property(p => p.HouseholdId)
            .HasConversion(id => id.Value, value => new HouseholdId(value));

        builder.HasIndex(p => p.HouseholdId);

        builder.Property(p => p.InsurerName).IsRequired().HasMaxLength(200);
        builder.Property(p => p.PolicyNumber).IsRequired().HasMaxLength(100);
        builder.Property(p => p.PremiumAmount).HasPrecision(18, 2);
        builder.Property(p => p.NextDueDate).IsRequired();
        builder.Property(p => p.LapseStatus).HasConversion<string>().HasMaxLength(20);
        builder.Property(p => p.CreatedAt).IsRequired();
        builder.Property(p => p.UpdatedAt).IsRequired();

        builder.HasMany(p => p.Beneficiaries)
            .WithOne()
            .HasForeignKey(b => b.PolicyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.OwnsMany(p => p.Documents, d =>
        {
            d.ToJson();
            d.Property(doc => doc.StorageKey).IsRequired();
            d.Property(doc => doc.OriginalFileName).IsRequired();
            d.Property(doc => doc.ContentType).IsRequired();
            d.Property(doc => doc.UploadedAt).IsRequired();
        });
    }
}

public class PolicyBeneficiaryConfiguration : IEntityTypeConfiguration<PolicyBeneficiary>
{
    public void Configure(EntityTypeBuilder<PolicyBeneficiary> builder)
    {
        builder.ToTable("PolicyBeneficiaries");

        builder.HasKey(b => b.Id);
        builder.Property(b => b.Id)
            .HasConversion(id => id.Value, value => new PolicyBeneficiaryId(value));

        builder.Property(b => b.PolicyId)
            .HasConversion(id => id.Value, value => new PolicyId(value));

        builder.Property(b => b.FullName).IsRequired().HasMaxLength(200);
        builder.Property(b => b.Relationship).IsRequired().HasMaxLength(100);
        builder.Property(b => b.BenefitPercentage).HasPrecision(5, 2);
    }
}

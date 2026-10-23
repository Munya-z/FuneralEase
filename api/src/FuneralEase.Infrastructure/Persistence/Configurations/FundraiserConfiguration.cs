using FuneralEase.Domain.Common;
using FuneralEase.Domain.Fundraisers;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FuneralEase.Infrastructure.Persistence.Configurations;

public class FundraiserConfiguration : IEntityTypeConfiguration<Fundraiser>
{
    public void Configure(EntityTypeBuilder<Fundraiser> builder)
    {
        builder.ToTable("Fundraisers");

        builder.HasKey(f => f.Id);
        builder.Property(f => f.Id)
            .HasConversion(id => id.Value, value => new FundraiserId(value));

        builder.Property(f => f.HouseholdId)
            .HasConversion(id => id.Value, value => new HouseholdId(value));

        builder.HasIndex(f => f.HouseholdId);

        builder.Property(f => f.Title).HasMaxLength(200).IsRequired();
        builder.Property(f => f.Story).HasMaxLength(5000).IsRequired();
        builder.Property(f => f.GoalAmount).HasColumnType("numeric(18,2)").IsRequired();
        builder.Property(f => f.Status).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(f => f.DeceasedFullName).HasMaxLength(200).IsRequired();
        builder.Property(f => f.CreatedAt).IsRequired();
        builder.Property(f => f.UpdatedAt).IsRequired();

        builder.Ignore(f => f.TotalCollected);

        builder.HasMany(f => f.Contributions)
            .WithOne()
            .HasForeignKey(c => c.FundraiserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class FundraiserContributionConfiguration : IEntityTypeConfiguration<FundraiserContribution>
{
    public void Configure(EntityTypeBuilder<FundraiserContribution> builder)
    {
        builder.ToTable("FundraiserContributions");

        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id)
            .HasConversion(id => id.Value, value => new FundraiserContributionId(value));

        builder.Property(c => c.FundraiserId)
            .HasConversion(id => id.Value, value => new FundraiserId(value));

        builder.Property(c => c.DonorName).HasMaxLength(200).IsRequired();
        builder.Property(c => c.AmountCents).IsRequired();
        builder.Property(c => c.Message).HasMaxLength(500).IsRequired(false);
        builder.Property(c => c.DonatedAt).IsRequired();
    }
}

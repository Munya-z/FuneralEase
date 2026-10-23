using FuneralEase.Domain.BurialSocieties;
using FuneralEase.Domain.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FuneralEase.Infrastructure.Persistence.Configurations;

public class BurialSocietyConfiguration : IEntityTypeConfiguration<BurialSociety>
{
    public void Configure(EntityTypeBuilder<BurialSociety> builder)
    {
        builder.ToTable("BurialSocieties");

        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id)
            .HasConversion(id => id.Value, v => new BurialSocietyId(v));

        builder.Property(s => s.AdminHouseholdId)
            .HasConversion(id => id.Value, v => new HouseholdId(v));

        builder.Property(s => s.Name).IsRequired().HasMaxLength(200);
        builder.Property(s => s.RegistrationNumber).HasMaxLength(50);
        builder.Property(s => s.MonthlyContributionAmount).HasPrecision(18, 2);
        builder.Property(s => s.CreatedAt);
        builder.Property(s => s.UpdatedAt);

        builder.HasMany(s => s.Members)
            .WithOne()
            .HasForeignKey(m => m.SocietyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(s => s.Contributions)
            .WithOne()
            .HasForeignKey(c => c.SocietyId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(s => s.Members).UsePropertyAccessMode(PropertyAccessMode.Field);
        builder.Navigation(s => s.Contributions).UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}

public class BurialSocietyMemberConfiguration : IEntityTypeConfiguration<BurialSocietyMember>
{
    public void Configure(EntityTypeBuilder<BurialSocietyMember> builder)
    {
        builder.ToTable("BurialSocietyMembers");

        builder.HasKey(m => m.Id);
        builder.Property(m => m.Id)
            .HasConversion(id => id.Value, v => new BurialSocietyMemberId(v));

        builder.Property(m => m.SocietyId)
            .HasConversion(id => id.Value, v => new BurialSocietyId(v));

        builder.Property(m => m.HouseholdId)
            .HasConversion(id => id.Value, v => new HouseholdId(v));

        builder.Property(m => m.FullName).IsRequired().HasMaxLength(200);
        builder.Property(m => m.MobileNumber).IsRequired().HasMaxLength(20);

        builder.HasIndex(m => new { m.SocietyId, m.HouseholdId }).IsUnique();
    }
}

public class ContributionRecordConfiguration : IEntityTypeConfiguration<ContributionRecord>
{
    public void Configure(EntityTypeBuilder<ContributionRecord> builder)
    {
        builder.ToTable("ContributionRecords");

        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id)
            .HasConversion(id => id.Value, v => new ContributionRecordId(v));

        builder.Property(c => c.SocietyId)
            .HasConversion(id => id.Value, v => new BurialSocietyId(v));

        builder.Property(c => c.MemberId)
            .HasConversion(id => id.Value, v => new BurialSocietyMemberId(v));

        builder.Property(c => c.AmountPaid).HasPrecision(18, 2);
        builder.Property(c => c.Period).IsRequired().HasMaxLength(7);
        builder.Property(c => c.Note).HasMaxLength(500);

        // Enforce one contribution per member per period
        builder.HasIndex(c => new { c.MemberId, c.Period }).IsUnique();
        builder.HasIndex(c => c.SocietyId);
    }
}

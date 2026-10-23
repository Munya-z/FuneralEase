using FuneralEase.Domain.Common;
using FuneralEase.Domain.Households;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FuneralEase.Infrastructure.Persistence.Configurations;

public class HouseholdConfiguration : IEntityTypeConfiguration<Household>
{
    public void Configure(EntityTypeBuilder<Household> builder)
    {
        builder.ToTable("Households");

        builder.HasKey(h => h.Id);
        builder.Property(h => h.Id)
            .HasConversion(id => id.Value, value => new HouseholdId(value));

        builder.Property(h => h.Name).IsRequired().HasMaxLength(200);
        builder.Property(h => h.CreatedAt).IsRequired();
        builder.Property(h => h.ReferralCode).IsRequired().HasMaxLength(10);
        builder.HasIndex(h => h.ReferralCode).IsUnique();

        builder.Property(h => h.IsDeleted).HasDefaultValue(false);
        builder.Property(h => h.DeletedAt).IsRequired(false);

        builder.HasQueryFilter(h => !h.IsDeleted);

        builder.HasMany(h => h.Members)
            .WithOne()
            .HasForeignKey(m => m.HouseholdId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class HouseholdMemberConfiguration : IEntityTypeConfiguration<HouseholdMember>
{
    public void Configure(EntityTypeBuilder<HouseholdMember> builder)
    {
        builder.ToTable("HouseholdMembers");

        builder.HasKey(m => new { HouseholdId = m.HouseholdId, UserId = m.Id });

        builder.Property(m => m.Id)
            .HasColumnName("UserId")
            .HasConversion(id => id.Value, value => new UserId(value));

        builder.Property(m => m.HouseholdId)
            .HasConversion(id => id.Value, value => new HouseholdId(value));

        builder.Property(m => m.FullName).IsRequired().HasMaxLength(200);
        builder.Property(m => m.MobileNumber).IsRequired().HasMaxLength(20);
        builder.Property(m => m.Role).HasConversion<string>().HasMaxLength(20);
        builder.Property(m => m.JoinedAt).IsRequired();
    }
}

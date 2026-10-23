using FuneralEase.Domain.Common;
using FuneralEase.Domain.Users;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FuneralEase.Infrastructure.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");

        builder.HasKey(u => u.Id);
        builder.Property(u => u.Id)
            .HasConversion(id => id.Value, value => new UserId(value));

        builder.Property(u => u.MobileNumber).IsRequired().HasMaxLength(20);
        builder.HasIndex(u => u.MobileNumber).IsUnique();

        builder.Property(u => u.FullName).IsRequired().HasMaxLength(200);

        builder.Property(u => u.PrimaryHouseholdId)
            .HasConversion(id => id!.Value.Value, value => new HouseholdId(value))
            .IsRequired(false);

        builder.Property(u => u.CreatedAt).IsRequired();
        builder.Property(u => u.LastLoginAt).IsRequired();
        builder.Property(u => u.PopiaConsentGivenAt).IsRequired(false);
        builder.Property(u => u.PinHash).HasColumnType("varchar(100)").IsRequired(false);
    }
}

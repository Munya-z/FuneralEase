using FuneralEase.Domain.Common;
using FuneralEase.Domain.Parlours;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FuneralEase.Infrastructure.Persistence.Configurations;

public class ParlourAppointmentConfiguration : IEntityTypeConfiguration<ParlourAppointment>
{
    public void Configure(EntityTypeBuilder<ParlourAppointment> builder)
    {
        builder.ToTable("ParlourAppointments");

        builder.HasKey(a => a.Id);
        builder.Property(a => a.Id)
            .HasConversion(id => id.Value, value => new AppointmentId(value));

        builder.Property(a => a.ParlourId)
            .HasConversion(id => id.Value, value => new ParlourId(value));

        builder.Property(a => a.HouseholdId)
            .HasConversion(id => id.Value, value => new HouseholdId(value));

        builder.HasIndex(a => a.ParlourId);
        builder.HasIndex(a => a.HouseholdId);

        builder.Property(a => a.ContactName).HasMaxLength(200).IsRequired();
        builder.Property(a => a.PhoneNumber).HasMaxLength(20).IsRequired();
        builder.Property(a => a.RequestedDate).IsRequired(false);
        builder.Property(a => a.Notes).HasMaxLength(1000).IsRequired(false);
        builder.Property(a => a.Status).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(a => a.CreatedAt).IsRequired();
    }
}

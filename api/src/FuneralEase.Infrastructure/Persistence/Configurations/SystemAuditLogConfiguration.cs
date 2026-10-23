using FuneralEase.Domain.Audit;
using FuneralEase.Domain.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FuneralEase.Infrastructure.Persistence.Configurations;

public class SystemAuditLogConfiguration : IEntityTypeConfiguration<SystemAuditLog>
{
    public void Configure(EntityTypeBuilder<SystemAuditLog> builder)
    {
        builder.ToTable("SystemAuditLogs");

        builder.HasKey(l => l.Id);
        builder.Property(l => l.Id)
            .HasConversion(id => id.Value, v => new SystemAuditLogId(v));

        builder.Property(l => l.Actor).IsRequired().HasMaxLength(200);
        builder.Property(l => l.Action).IsRequired().HasMaxLength(100);
        builder.Property(l => l.Category).HasConversion<string>().HasMaxLength(50);
        builder.Property(l => l.Subject).IsRequired().HasMaxLength(300);
        builder.Property(l => l.Detail).HasMaxLength(1000);
        builder.Property(l => l.OccurredAt);

        builder.HasIndex(l => l.OccurredAt);
        builder.HasIndex(l => l.Category);
    }
}

using FuneralEase.Domain.Common;
using FuneralEase.Domain.EstateChecklist;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FuneralEase.Infrastructure.Persistence.Configurations;

public class EstateChecklistConfiguration : IEntityTypeConfiguration<EstateChecklist>
{
    public void Configure(EntityTypeBuilder<EstateChecklist> builder)
    {
        builder.ToTable("EstateChecklists");

        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id)
            .HasConversion(id => id.Value, value => new EstateChecklistId(value));

        builder.Property(c => c.HouseholdId)
            .HasConversion(id => id.Value, value => new HouseholdId(value));

        builder.HasIndex(c => c.HouseholdId);

        builder.Property(c => c.DeceasedFullName).HasMaxLength(200).IsRequired();
        builder.Property(c => c.DateOfDeath).IsRequired();
        builder.Property(c => c.CreatedAt).IsRequired();

        builder.HasMany(c => c.Tasks)
            .WithOne()
            .HasForeignKey(t => t.ChecklistId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class EstateTaskConfiguration : IEntityTypeConfiguration<EstateTask>
{
    public void Configure(EntityTypeBuilder<EstateTask> builder)
    {
        builder.ToTable("EstateTasks");

        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id)
            .HasConversion(id => id.Value, value => new EstateTaskId(value));

        builder.Property(t => t.ChecklistId)
            .HasConversion(id => id.Value, value => new EstateChecklistId(value));

        builder.Property(t => t.Title).HasMaxLength(300).IsRequired();
        builder.Property(t => t.Description).HasMaxLength(1000).IsRequired();
        builder.Property(t => t.Category).HasConversion<string>().HasMaxLength(50).IsRequired();
        builder.Property(t => t.IsRequired).IsRequired();
        builder.Property(t => t.IsCompleted).IsRequired();
        builder.Property(t => t.CompletedAt).IsRequired(false);
        builder.Property(t => t.SortOrder).IsRequired();
    }
}

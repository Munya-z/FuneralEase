using FuneralEase.Domain.Common;
using FuneralEase.Domain.GriefJournal;
using FuneralEase.Infrastructure.Encryption;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace FuneralEase.Infrastructure.Persistence.Configurations;

public class GriefJournalEntryConfiguration : IEntityTypeConfiguration<GriefJournalEntry>
{
    private readonly string _encryptionKey;

    public GriefJournalEntryConfiguration(string encryptionKey) => _encryptionKey = encryptionKey;
    public GriefJournalEntryConfiguration() : this(string.Empty) { }

    public void Configure(EntityTypeBuilder<GriefJournalEntry> builder)
    {
        builder.ToTable("GriefJournalEntries");

        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id)
            .HasConversion(id => id.Value, value => new GriefJournalEntryId(value));

        builder.Property(e => e.UserId)
            .HasConversion(id => id.Value, value => new UserId(value));

        builder.Property(e => e.HouseholdId)
            .HasConversion(id => id.Value, value => new HouseholdId(value));

        builder.HasIndex(e => new { e.UserId, e.HouseholdId });

        builder.Property(e => e.Mood).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(e => e.CreatedAt).IsRequired();
        builder.Property(e => e.UpdatedAt).IsRequired();

        if (!string.IsNullOrEmpty(_encryptionKey))
        {
            var key = _encryptionKey;
            ValueConverter<string, string> encryptedConverter = new(
                v => AesEncryptionService.Encrypt(v, key),
                v => AesEncryptionService.Decrypt(v, key));

            builder.Property(e => e.EncryptedContent)
                .HasConversion(encryptedConverter)
                .HasMaxLength(20000)
                .IsRequired();
        }
        else
        {
            builder.Property(e => e.EncryptedContent).HasMaxLength(20000).IsRequired();
        }
    }
}

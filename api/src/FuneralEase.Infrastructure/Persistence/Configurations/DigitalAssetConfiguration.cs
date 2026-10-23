using FuneralEase.Domain.Common;
using FuneralEase.Domain.DigitalVault;
using FuneralEase.Infrastructure.Encryption;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace FuneralEase.Infrastructure.Persistence.Configurations;

public class DigitalAssetConfiguration : IEntityTypeConfiguration<DigitalAsset>
{
    private readonly string _encryptionKey;

    public DigitalAssetConfiguration(string encryptionKey) => _encryptionKey = encryptionKey;
    public DigitalAssetConfiguration() : this(string.Empty) { }

    public void Configure(EntityTypeBuilder<DigitalAsset> builder)
    {
        builder.ToTable("DigitalAssets");

        builder.HasKey(a => a.Id);
        builder.Property(a => a.Id)
            .HasConversion(id => id.Value, value => new DigitalAssetId(value));

        builder.Property(a => a.HouseholdId)
            .HasConversion(id => id.Value, value => new HouseholdId(value));

        builder.HasIndex(a => a.HouseholdId);

        builder.Property(a => a.Category).HasConversion<string>().HasMaxLength(50).IsRequired();
        builder.Property(a => a.ServiceName).HasMaxLength(200).IsRequired();
        builder.Property(a => a.Url).HasMaxLength(500).IsRequired(false);
        builder.Property(a => a.OnDeathInstruction).HasConversion<string>().HasMaxLength(50).IsRequired();
        builder.Property(a => a.CreatedAt).IsRequired();
        builder.Property(a => a.UpdatedAt).IsRequired();

        if (!string.IsNullOrEmpty(_encryptionKey))
        {
            var key = _encryptionKey;
            ValueConverter<string?, string?> encryptedConverter = new(
                v => v == null ? null : AesEncryptionService.Encrypt(v, key),
                v => v == null ? null : AesEncryptionService.Decrypt(v, key));

            builder.Property(a => a.Username)
                .HasConversion(encryptedConverter)
                .HasMaxLength(512)
                .IsRequired(false);

            builder.Property(a => a.EncryptedNotes)
                .HasConversion(encryptedConverter)
                .HasMaxLength(4096)
                .IsRequired(false);
        }
        else
        {
            builder.Property(a => a.Username).HasMaxLength(512).IsRequired(false);
            builder.Property(a => a.EncryptedNotes).HasMaxLength(4096).IsRequired(false);
        }
    }
}

using FuneralEase.Domain.Common;
using FuneralEase.Domain.EmergencyAccess;
using FuneralEase.Infrastructure.Encryption;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace FuneralEase.Infrastructure.Persistence.Configurations;

public class EmergencyAccessSessionConfiguration : IEntityTypeConfiguration<EmergencyAccessSession>
{
    private readonly string _encryptionKey;

    public EmergencyAccessSessionConfiguration(string encryptionKey)
    {
        _encryptionKey = encryptionKey;
    }

    // Parameterless constructor needed for ApplyConfigurationsFromAssembly
    public EmergencyAccessSessionConfiguration() : this(string.Empty) { }

    public void Configure(EntityTypeBuilder<EmergencyAccessSession> builder)
    {
        builder.ToTable("EmergencyAccessSessions");

        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id)
            .HasConversion(id => id.Value, value => new EmergencyAccessSessionId(value));

        builder.Property(s => s.HouseholdId)
            .HasConversion(id => id.Value, value => new HouseholdId(value));

        builder.HasIndex(s => s.HouseholdId).IsUnique();
        builder.Property(s => s.CreatedAt).IsRequired();
        builder.Property(s => s.UpdatedAt).IsRequired();

        // SA ID numbers encrypted at rest (POPIA)
        var encryptionKey = _encryptionKey;
        ValueConverter<string?, string?> encryptedConverter = new(
            v => v == null ? null : AesEncryptionService.Encrypt(v, encryptionKey),
            v => v == null ? null : AesEncryptionService.Decrypt(v, encryptionKey));

        builder.HasMany(s => s.Contacts)
            .WithOne()
            .HasForeignKey(c => c.SessionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(s => s.Grants)
            .WithOne()
            .HasForeignKey(g => g.SessionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.OwnsMany(s => s.AuditEntries, a =>
        {
            a.ToJson();
            a.Property(e => e.Action).IsRequired();
            a.Property(e => e.ActorId).IsRequired();
            a.Property(e => e.OccurredAt).IsRequired();
        });
    }
}

public class EmergencyContactConfiguration : IEntityTypeConfiguration<EmergencyContact>
{
    private readonly string _encryptionKey;

    public EmergencyContactConfiguration(string encryptionKey) => _encryptionKey = encryptionKey;
    public EmergencyContactConfiguration() : this(string.Empty) { }

    public void Configure(EntityTypeBuilder<EmergencyContact> builder)
    {
        builder.ToTable("EmergencyContacts");

        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id)
            .HasConversion(id => id.Value, value => new EmergencyContactId(value));

        builder.Property(c => c.SessionId)
            .HasConversion(id => id.Value, value => new EmergencyAccessSessionId(value));

        builder.Property(c => c.FullName).IsRequired().HasMaxLength(200);
        builder.Property(c => c.MobileNumber).IsRequired().HasMaxLength(20);
        builder.Property(c => c.Relationship).IsRequired().HasMaxLength(100);
        builder.Property(c => c.AccessMode).HasConversion<string>().HasMaxLength(20).IsRequired();

        if (!string.IsNullOrEmpty(_encryptionKey))
        {
            var key = _encryptionKey;
            builder.Property(c => c.SaIdNumber)
                .HasConversion(
                    v => v == null ? null : AesEncryptionService.Encrypt(v, key),
                    v => v == null ? null : AesEncryptionService.Decrypt(v, key))
                .HasMaxLength(512)
                .IsRequired(false);
        }
        else
        {
            builder.Property(c => c.SaIdNumber).HasMaxLength(512).IsRequired(false);
        }
    }
}

public class AccessGrantConfiguration : IEntityTypeConfiguration<AccessGrant>
{
    public void Configure(EntityTypeBuilder<AccessGrant> builder)
    {
        builder.ToTable("AccessGrants");

        builder.HasKey(g => g.Id);
        builder.Property(g => g.Id)
            .HasConversion(id => id.Value, value => new AccessGrantId(value));

        builder.Property(g => g.SessionId)
            .HasConversion(id => id.Value, value => new EmergencyAccessSessionId(value));

        builder.Property(g => g.ContactId)
            .HasConversion(id => id.Value, value => new EmergencyContactId(value));

        builder.Property(g => g.RequestedByUserId)
            .HasConversion(id => id.Value, value => new UserId(value));

        builder.Property(g => g.RevokedByUserId)
            .HasConversion(id => id == null ? (Guid?)null : id.Value.Value, value => value == null ? (UserId?)null : new UserId(value.Value))
            .IsRequired(false);

        builder.Property(g => g.ActivatesAt).IsRequired();
        builder.Property(g => g.ExpiresAt).IsRequired();
        builder.Property(g => g.IsRevoked).IsRequired();
        builder.Property(g => g.RevokedAt).IsRequired(false);
    }
}

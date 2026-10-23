using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Audit;
using FuneralEase.Domain.BurialSocieties;
using FuneralEase.Domain.Claims;
using FuneralEase.Domain.Common;
using FuneralEase.Domain.DigitalVault;
using FuneralEase.Domain.EmergencyAccess;
using FuneralEase.Domain.EstateChecklist;
using FuneralEase.Domain.Fundraisers;
using FuneralEase.Domain.GriefJournal;
using FuneralEase.Domain.Households;
using FuneralEase.Domain.LegalDirectory;
using FuneralEase.Domain.Notifications;
using FuneralEase.Domain.Obituaries;
using FuneralEase.Domain.Parlours;
using FuneralEase.Domain.Policies;
using FuneralEase.Domain.Subscriptions;
using FuneralEase.Domain.Users;
using FuneralEase.Infrastructure.Encryption;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace FuneralEase.Infrastructure.Persistence;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, IOptions<EncryptionOptions> encryptionOptions)
    : DbContext(options), IApplicationDbContext
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Household> Households => Set<Household>();
    public DbSet<HouseholdMember> HouseholdMembers => Set<HouseholdMember>();
    public DbSet<Policy> Policies => Set<Policy>();
    public DbSet<Claim> Claims => Set<Claim>();
    public DbSet<EmergencyAccessSession> EmergencyAccessSessions => Set<EmergencyAccessSession>();
    public DbSet<Subscription> Subscriptions => Set<Subscription>();
    public DbSet<BillingEventLog> BillingEventLogs => Set<BillingEventLog>();
    public DbSet<ReferralLog> ReferralLogs => Set<ReferralLog>();
    public DbSet<Parlour> Parlours => Set<Parlour>();
    public DbSet<BurialSociety> BurialSocieties => Set<BurialSociety>();
    public DbSet<SystemAuditLog> SystemAuditLogs => Set<SystemAuditLog>();
    public DbSet<HouseholdNotificationSettings> NotificationSettings => Set<HouseholdNotificationSettings>();
    public DbSet<PremiumPaymentRecord> PremiumPaymentRecords => Set<PremiumPaymentRecord>();
    public DbSet<Domain.FuneralWishes.FuneralWishes> FuneralWishes => Set<Domain.FuneralWishes.FuneralWishes>();
    public DbSet<DigitalAsset> DigitalAssets => Set<DigitalAsset>();
    public DbSet<Fundraiser> Fundraisers => Set<Fundraiser>();
    public DbSet<FundraiserContribution> FundraiserContributions => Set<FundraiserContribution>();
    public DbSet<Domain.EstateChecklist.EstateChecklist> EstateChecklists => Set<Domain.EstateChecklist.EstateChecklist>();
    public DbSet<EstateTask> EstateTasks => Set<EstateTask>();
    public DbSet<LegalProfessional> LegalProfessionals => Set<LegalProfessional>();
    public DbSet<ParlourAppointment> ParlourAppointments => Set<ParlourAppointment>();
    public DbSet<GriefJournalEntry> GriefJournalEntries => Set<GriefJournalEntry>();
    public DbSet<Obituary> Obituaries => Set<Obituary>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var encryptionKey = encryptionOptions.Value.Key;
        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(ApplicationDbContext).Assembly,
            t => t.Namespace?.Contains("Configurations") == true);

        // Pass encryption key to the context for converters used in configurations
        modelBuilder.UseEncryptionKey(encryptionKey);

        base.OnModelCreating(modelBuilder);
    }
}

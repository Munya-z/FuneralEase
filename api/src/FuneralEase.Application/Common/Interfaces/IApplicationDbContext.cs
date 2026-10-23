using FuneralEase.Domain.Audit;
using FuneralEase.Domain.BurialSocieties;
using FuneralEase.Domain.Claims;
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
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<Household> Households { get; }
    DbSet<HouseholdMember> HouseholdMembers { get; }
    DbSet<Policy> Policies { get; }
    DbSet<Claim> Claims { get; }
    DbSet<EmergencyAccessSession> EmergencyAccessSessions { get; }
    DbSet<Subscription> Subscriptions { get; }
    DbSet<BillingEventLog> BillingEventLogs { get; }
    DbSet<ReferralLog> ReferralLogs { get; }
    DbSet<Parlour> Parlours { get; }
    DbSet<BurialSociety> BurialSocieties { get; }
    DbSet<SystemAuditLog> SystemAuditLogs { get; }
    DbSet<HouseholdNotificationSettings> NotificationSettings { get; }
    DbSet<PremiumPaymentRecord> PremiumPaymentRecords { get; }
    DbSet<Domain.FuneralWishes.FuneralWishes> FuneralWishes { get; }
    DbSet<DigitalAsset> DigitalAssets { get; }
    DbSet<Fundraiser> Fundraisers { get; }
    DbSet<FundraiserContribution> FundraiserContributions { get; }
    DbSet<Domain.EstateChecklist.EstateChecklist> EstateChecklists { get; }
    DbSet<EstateTask> EstateTasks { get; }
    DbSet<LegalProfessional> LegalProfessionals { get; }
    DbSet<ParlourAppointment> ParlourAppointments { get; }
    DbSet<GriefJournalEntry> GriefJournalEntries { get; }
    DbSet<Obituary> Obituaries { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}

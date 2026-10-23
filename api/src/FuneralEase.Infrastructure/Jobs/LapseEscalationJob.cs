using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Policies;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace FuneralEase.Infrastructure.Jobs;

public class LapseEscalationJob(IServiceScopeFactory scopeFactory, ILogger<LapseEscalationJob> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            // Run once a day at midnight UTC
            var now = DateTimeOffset.UtcNow;
            var nextRun = now.Date.AddDays(1);
            var delay = nextRun - now.DateTime;

            logger.LogInformation("LapseEscalationJob scheduled to run in {Delay}", delay);
            await Task.Delay(delay, stoppingToken);

            await RunEscalationAsync(stoppingToken);
        }
    }

    private async Task RunEscalationAsync(CancellationToken cancellationToken)
    {
        try
        {
            logger.LogInformation("Running lapse escalation job");
            using var scope = scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
            var notifier = scope.ServiceProvider.GetRequiredService<INotificationService>();

            // Load policies with their household admin contact info in one query
            var policies = await db.Policies.ToListAsync(cancellationToken);

            // Build a lookup: householdId → admin member mobile + name
            var householdIds = policies.Select(p => p.HouseholdId).Distinct().ToList();
            var households = await db.Households
                .Include(h => h.Members)
                .Where(h => householdIds.Contains(h.Id))
                .ToListAsync(cancellationToken);

            var adminByHousehold = households.ToDictionary(
                h => h.Id,
                h => h.Members.FirstOrDefault(m => m.Role == Domain.Households.MemberRole.Administrator));

            var changed = 0;
            var reminders = new List<(PremiumReminderNotification Notification, LapseStatus NewStatus)>();

            foreach (var policy in policies)
            {
                var previousStatus = policy.LapseStatus;
                policy.Escalate();

                if (policy.LapseStatus == previousStatus) continue;

                changed++;

                // Build a reminder for the household administrator
                if (!adminByHousehold.TryGetValue(policy.HouseholdId, out var admin) || admin is null)
                    continue;

                var reminderType = policy.LapseStatus switch
                {
                    LapseStatus.DueSoon => PremiumReminderType.DueSoon,
                    LapseStatus.Overdue => PremiumReminderType.Overdue,
                    LapseStatus.Lapsed => PremiumReminderType.Lapsed,
                    _ => (PremiumReminderType?)null
                };

                if (reminderType is null) continue;

                reminders.Add((new PremiumReminderNotification(
                    MobileNumber: admin.MobileNumber,
                    PolicyHolderName: admin.FullName,
                    InsurerName: policy.InsurerName,
                    PolicyNumber: policy.PolicyNumber,
                    PremiumAmount: policy.PremiumAmount,
                    NextDueDate: policy.NextDueDate,
                    ReminderType: reminderType.Value), policy.LapseStatus));
            }

            if (changed > 0)
            {
                await db.SaveChangesAsync(cancellationToken);
                logger.LogInformation("Escalated {Count} policies", changed);
            }

            // Dispatch reminders after persisting (fire-and-forget per reminder; log individual failures)
            foreach (var (notification, _) in reminders)
            {
                try
                {
                    await notifier.SendPremiumReminderAsync(notification, cancellationToken);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Failed to send premium reminder to {Mobile} for policy {PolicyNumber}",
                        notification.MobileNumber, notification.PolicyNumber);
                }
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Lapse escalation job failed");
        }
    }
}

using FuneralEase.Application.Common.Exceptions;
using FuneralEase.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Households.Queries.ExportHouseholdData;

public class ExportHouseholdDataQueryHandler(IApplicationDbContext db)
    : IRequestHandler<ExportHouseholdDataQuery, HouseholdDataExport>
{
    public async Task<HouseholdDataExport> Handle(ExportHouseholdDataQuery request, CancellationToken cancellationToken)
    {
        var household = await db.Households
            .Include(h => h.Members)
            .FirstOrDefaultAsync(h => h.Id == request.HouseholdId, cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Households.Household), request.HouseholdId);

        var policies = await db.Policies
            .Where(p => p.HouseholdId == request.HouseholdId)
            .ToListAsync(cancellationToken);

        // Fetch the admin user for consent timestamp
        var adminMember = household.Members.FirstOrDefault(m => m.Role == Domain.Households.MemberRole.Administrator);
        var ownerUser = adminMember is not null
            ? await db.Users.FirstOrDefaultAsync(u => u.Id == adminMember.Id, cancellationToken)
            : null;

        return new HouseholdDataExport(
            Household: new HouseholdExportDto(household.Id.Value, household.Name, household.CreatedAt),
            Policies: policies.Select(p => new PolicyExportDto(
                p.Id.Value,
                p.InsurerName,
                p.PolicyNumber,
                p.PremiumAmount,
                p.NextDueDate,
                p.LapseStatus.ToString(),
                p.CreatedAt)).ToList(),
            Members: household.Members.Select(m => new MemberExportDto(
                m.FullName,
                m.MobileNumber,
                m.Role.ToString(),
                m.JoinedAt)).ToList(),
            Owner: ownerUser is not null
                ? new UserExportDto(ownerUser.FullName, ownerUser.MobileNumber, ownerUser.PopiaConsentGivenAt, ownerUser.CreatedAt)
                : new UserExportDto(string.Empty, string.Empty, null, DateTimeOffset.MinValue));
    }
}

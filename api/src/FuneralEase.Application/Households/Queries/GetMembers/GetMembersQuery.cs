using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Households.Queries.GetMembers;

public record GetMembersQuery(HouseholdId HouseholdId) : IRequest<List<MemberDto>>;

public record MemberDto(
    string UserId,
    string FullName,
    string MobileNumber,
    string Role,
    DateTimeOffset JoinedAt);

public class GetMembersQueryHandler(IApplicationDbContext db)
    : IRequestHandler<GetMembersQuery, List<MemberDto>>
{
    public async Task<List<MemberDto>> Handle(GetMembersQuery request, CancellationToken cancellationToken)
    {
        var household = await db.Households
            .AsNoTracking()
            .FirstOrDefaultAsync(h => h.Id == request.HouseholdId, cancellationToken)
            ?? throw new InvalidOperationException("Household not found.");

        return household.Members
            .OrderBy(m => m.JoinedAt)
            .Select(m => new MemberDto(
                m.Id.Value.ToString(),
                m.FullName,
                m.MobileNumber,
                m.Role.ToString(),
                m.JoinedAt))
            .ToList();
    }
}

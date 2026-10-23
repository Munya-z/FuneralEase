using FuneralEase.Application.BurialSocieties.DTOs;
using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.BurialSocieties.Commands.AddSocietyMember;

public record AddSocietyMemberCommand(
    BurialSocietyId SocietyId,
    HouseholdId AdminHouseholdId,
    HouseholdId MemberHouseholdId,
    string FullName,
    string MobileNumber) : IRequest<BurialSocietyDto>;

public class AddSocietyMemberCommandHandler(IApplicationDbContext db)
    : IRequestHandler<AddSocietyMemberCommand, BurialSocietyDto>
{
    public async Task<BurialSocietyDto> Handle(AddSocietyMemberCommand request, CancellationToken cancellationToken)
    {
        var society = await db.BurialSocieties
            .Include("_members")
            .Include("_contributions")
            .FirstOrDefaultAsync(
                s => s.Id == request.SocietyId && s.AdminHouseholdId == request.AdminHouseholdId,
                cancellationToken)
            ?? throw new InvalidOperationException("Burial society not found or access denied.");

        society.AddMember(request.MemberHouseholdId, request.FullName, request.MobileNumber);
        await db.SaveChangesAsync(cancellationToken);
        return society.ToDto();
    }
}

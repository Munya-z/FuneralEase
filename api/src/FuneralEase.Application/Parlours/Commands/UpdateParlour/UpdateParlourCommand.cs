using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Application.Parlours.DTOs;
using FuneralEase.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Parlours.Commands.UpdateParlour;

public record UpdateParlourCommand(
    ParlourId ParlourId,
    string ContactEmail,
    string Name,
    string ContactName,
    string PhoneNumber,
    string Area,
    string Province,
    string? Description) : IRequest<ParlourDto>;

public class UpdateParlourCommandHandler(IApplicationDbContext db)
    : IRequestHandler<UpdateParlourCommand, ParlourDto>
{
    public async Task<ParlourDto> Handle(UpdateParlourCommand request, CancellationToken cancellationToken)
    {
        var parlour = await db.Parlours
            .FirstOrDefaultAsync(p => p.Id == request.ParlourId, cancellationToken)
            ?? throw new InvalidOperationException("Parlour not found.");

        // Ownership check: only the contact email can update
        if (!string.Equals(parlour.EmailAddress, request.ContactEmail, StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("Only the listing contact can update this parlour.");

        parlour.Update(request.Name, request.ContactName, request.PhoneNumber, request.Area, request.Province, request.Description);
        await db.SaveChangesAsync(cancellationToken);
        return parlour.ToDto();
    }
}

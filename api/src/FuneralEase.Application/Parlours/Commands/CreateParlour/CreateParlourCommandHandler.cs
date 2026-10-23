using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Application.Parlours.DTOs;
using FuneralEase.Domain.Parlours;
using MediatR;

namespace FuneralEase.Application.Parlours.Commands.CreateParlour;

public class CreateParlourCommandHandler(IApplicationDbContext db) : IRequestHandler<CreateParlourCommand, ParlourDto>
{
    public async Task<ParlourDto> Handle(CreateParlourCommand request, CancellationToken cancellationToken)
    {
        var parlour = Parlour.Submit(request.Name, request.ContactName, request.PhoneNumber, request.EmailAddress, request.Area, request.Province, request.Description);
        db.Parlours.Add(parlour);
        await db.SaveChangesAsync(cancellationToken);
        return parlour.ToDto();
    }
}

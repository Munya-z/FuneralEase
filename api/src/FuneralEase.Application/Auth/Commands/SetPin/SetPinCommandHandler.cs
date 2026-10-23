using FuneralEase.Application.Common.Exceptions;
using FuneralEase.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FuneralEase.Application.Auth.Commands.SetPin;

public class SetPinCommandHandler(
    IApplicationDbContext db,
    ICurrentUserService currentUser) : IRequestHandler<SetPinCommand>
{
    public async Task Handle(SetPinCommand request, CancellationToken cancellationToken)
    {
        var user = await db.Users
            .FirstOrDefaultAsync(u => u.Id == currentUser.UserId, cancellationToken)
            ?? throw new NotFoundException("User", currentUser.UserId);

        user.SetPin(request.Pin);
        await db.SaveChangesAsync(cancellationToken);
    }
}

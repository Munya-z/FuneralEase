using FuneralEase.Application.Parlours.DTOs;
using MediatR;

namespace FuneralEase.Application.Parlours.Commands.CreateParlour;

public record CreateParlourCommand(
    string Name,
    string ContactName,
    string PhoneNumber,
    string EmailAddress,
    string Area,
    string Province,
    string? Description) : IRequest<ParlourDto>;

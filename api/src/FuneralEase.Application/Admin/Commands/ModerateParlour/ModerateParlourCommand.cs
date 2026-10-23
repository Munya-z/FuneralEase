using FuneralEase.Application.Parlours.DTOs;
using FuneralEase.Domain.Common;
using MediatR;

namespace FuneralEase.Application.Admin.Commands.ModerateParlour;

public record ModerateParlourCommand(ParlourId ParlourId, bool Approve, string? RejectionReason) : IRequest<ParlourDto>;

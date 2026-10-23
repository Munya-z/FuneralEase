using FuneralEase.Application.Parlours.DTOs;
using MediatR;

namespace FuneralEase.Application.Parlours.Queries.SearchParlours;

public record SearchParloursQuery(string? Area, string? Province) : IRequest<List<ParlourDto>>;

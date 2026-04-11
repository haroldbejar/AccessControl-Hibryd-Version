using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.CommonAreas.Dtos;
using MediatR;

namespace AccessControl.Application.Features.CommonAreas.Commands.CreateCommonArea;

public sealed record CreateCommonAreaCommand(
    string Name,
    string? Description,
    int? Capacity,
    string? Location,
    TimeOnly OpeningTime,
    TimeOnly ClosingTime,
    int UserCreated
) : IRequest<Result<CommonAreaResponse>>;

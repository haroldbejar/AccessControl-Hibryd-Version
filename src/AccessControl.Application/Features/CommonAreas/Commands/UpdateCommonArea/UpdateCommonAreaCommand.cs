using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.CommonAreas.Dtos;
using MediatR;

namespace AccessControl.Application.Features.CommonAreas.Commands.UpdateCommonArea;

public sealed record UpdateCommonAreaCommand(
    int Id,
    string Name,
    string? Description,
    int? Capacity,
    string? Location,
    TimeOnly OpeningTime,
    TimeOnly ClosingTime,
    bool Visible,
    int UserModified
) : IRequest<Result<CommonAreaResponse>>;

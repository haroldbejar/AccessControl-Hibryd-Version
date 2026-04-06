using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Roles.Dtos;
using MediatR;

namespace AccessControl.Application.Features.Roles.Commands.CreateRole;

public sealed record CreateRoleCommand(
    string Name
) : IRequest<Result<RoleResponse>>;

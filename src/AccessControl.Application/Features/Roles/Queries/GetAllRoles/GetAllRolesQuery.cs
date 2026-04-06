using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Roles.Dtos;
using MediatR;

namespace AccessControl.Application.Features.Roles.Queries.GetAllRoles;

public sealed record GetAllRolesQuery : IRequest<Result<IEnumerable<RoleResponse>>>;

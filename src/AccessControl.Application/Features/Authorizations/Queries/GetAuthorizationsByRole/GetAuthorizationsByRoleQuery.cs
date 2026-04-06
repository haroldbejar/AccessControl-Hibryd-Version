using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Authorizations.Dtos;
using MediatR;

namespace AccessControl.Application.Features.Authorizations.Queries.GetAuthorizationsByRole;

public sealed record GetAuthorizationsByRoleQuery(
    int RoleId
) : IRequest<Result<IEnumerable<AuthorizationResponse>>>;

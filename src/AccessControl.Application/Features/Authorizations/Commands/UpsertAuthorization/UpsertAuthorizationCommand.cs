using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Authorizations.Dtos;
using MediatR;

namespace AccessControl.Application.Features.Authorizations.Commands.UpsertAuthorization;

public sealed record UpsertAuthorizationCommand(
    int RoleId,
    int MenuId,
    bool Create,
    bool Read,
    bool Update,
    bool Delete
) : IRequest<Result<AuthorizationResponse>>;

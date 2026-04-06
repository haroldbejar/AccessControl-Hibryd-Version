using AccessControl.Application.Common.Models;
using MediatR;

namespace AccessControl.Application.Features.Users.Commands.UpdateUser;

public sealed record UpdateUserCommand(
    int Id,
    string Name,
    int RoleId,
    bool Visible,
    int UserModified
) : IRequest<Result>;

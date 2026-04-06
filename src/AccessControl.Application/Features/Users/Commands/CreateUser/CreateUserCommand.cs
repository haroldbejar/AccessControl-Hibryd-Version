using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Users.Dtos;
using MediatR;

namespace AccessControl.Application.Features.Users.Commands.CreateUser;

public sealed record CreateUserCommand(
    string UserAccount,
    string Password,
    string Name,
    int RoleId,
    int UserCreated
) : IRequest<Result<UserResponse>>;

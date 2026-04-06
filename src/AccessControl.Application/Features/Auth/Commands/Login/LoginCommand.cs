using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Auth.Dtos;
using MediatR;

namespace AccessControl.Application.Features.Auth.Commands.Login;

public sealed record LoginCommand(
    string UserAccount,
    string Password
) : IRequest<Result<LoginResponse>>;

using AccessControl.Application.Common.Models;
using MediatR;

namespace AccessControl.Application.Features.Users.Commands.ChangePassword;

public sealed record ChangePasswordCommand(
    int Id,
    string CurrentPassword,
    string NewPassword
) : IRequest<Result>;

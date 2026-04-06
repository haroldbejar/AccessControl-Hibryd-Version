using AccessControl.Application.Common.Models;
using MediatR;

namespace AccessControl.Application.Features.Users.Commands.DeleteUser;

public sealed record DeleteUserCommand(int Id, int UserEliminated) : IRequest<Result>;

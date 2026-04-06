using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Users.Dtos;
using MediatR;

namespace AccessControl.Application.Features.Users.Queries.GetAllUsers;

public sealed record GetAllUsersQuery() : IRequest<Result<IEnumerable<UserResponse>>>;

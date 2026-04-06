using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Users.Dtos;
using MediatR;

namespace AccessControl.Application.Features.Users.Queries.GetUserById;

public sealed record GetUserByIdQuery(int Id) : IRequest<Result<UserResponse>>;

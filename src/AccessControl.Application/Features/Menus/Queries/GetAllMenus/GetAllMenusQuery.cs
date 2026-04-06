using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Menus.Dtos;
using MediatR;

namespace AccessControl.Application.Features.Menus.Queries.GetAllMenus;

public sealed record GetAllMenusQuery : IRequest<Result<IEnumerable<MenuResponse>>>;

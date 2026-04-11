using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.CommonAreas.Dtos;
using MediatR;

namespace AccessControl.Application.Features.CommonAreas.Queries.GetAllCommonAreas;

public sealed record GetAllCommonAreasQuery : IRequest<Result<IEnumerable<CommonAreaResponse>>>;

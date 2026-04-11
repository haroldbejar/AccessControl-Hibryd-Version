using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.CommonAreas.Dtos;
using MediatR;

namespace AccessControl.Application.Features.CommonAreas.Queries.GetCommonAreaById;

public sealed record GetCommonAreaByIdQuery(int Id) : IRequest<Result<CommonAreaResponse>>;

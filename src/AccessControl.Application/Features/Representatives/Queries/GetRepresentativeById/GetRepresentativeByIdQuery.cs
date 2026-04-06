using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Representatives.Dtos;
using MediatR;

namespace AccessControl.Application.Features.Representatives.Queries.GetRepresentativeById;

public sealed record GetRepresentativeByIdQuery(
    int Id
) : IRequest<Result<RepresentativeResponse>>;

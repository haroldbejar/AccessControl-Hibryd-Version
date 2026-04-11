using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Reservations.Dtos;
using MediatR;

namespace AccessControl.Application.Features.Reservations.Queries.GetAvailability;

public sealed record GetAvailabilityQuery(int CommonAreaId, DateOnly Date) : IRequest<Result<AvailabilityResponse>>;

using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Visits.Dtos;
using AccessControl.Domain.Enums;
using MediatR;

namespace AccessControl.Application.Features.Visits.Commands.CreateVisit;

public sealed record CreateVisitCommand(
    string DocumentNumber,
    string FirstName,
    string? SecondName,
    string LastName,
    string? SecondLastName,
    int RepresentativeId,
    bool HasVehicle,
    VehicleTypeEnum VehicleTypeId,
    string? Brand,
    string? Model,
    string? Color,
    string? Plate,
    byte[]? Photo,
    byte[]? Photo2,
    int UserCreated
) : IRequest<Result<VisitResponse>>;

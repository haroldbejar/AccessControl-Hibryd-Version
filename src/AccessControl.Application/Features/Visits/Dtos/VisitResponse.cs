using AccessControl.Domain.Enums;

namespace AccessControl.Application.Features.Visits.Dtos;

public sealed record VisitResponse(
    int Id,
    string DocumentNumber,
    string FirstName,
    string? SecondName,
    string LastName,
    string? SecondLastName,
    string FullName,
    int RepresentativeId,
    string RepresentativeName,
    int DestinationId,
    string DestinationName,
    bool HasVehicle,
    VehicleTypeEnum VehicleTypeId,
    string VehicleTypeName,
    string? Brand,
    string? Model,
    string? Color,
    string? Plate,
    DateTime CheckIn,
    DateTime? CheckOut,
    bool IsCheckedOut,
    byte[]? Photo,
    byte[]? Photo2,
    DateTime CreatedDate
);

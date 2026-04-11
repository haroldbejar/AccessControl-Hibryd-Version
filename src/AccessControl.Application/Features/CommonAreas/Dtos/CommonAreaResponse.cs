namespace AccessControl.Application.Features.CommonAreas.Dtos;

public sealed record CommonAreaResponse(
    int Id,
    string Name,
    string? Description,
    int? Capacity,
    string? Location,
    string OpeningTime,
    string ClosingTime,
    bool Visible
);

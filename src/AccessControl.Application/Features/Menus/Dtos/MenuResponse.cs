namespace AccessControl.Application.Features.Menus.Dtos;

public sealed record MenuResponse(
    int Id,
    string Name,
    string? Page,
    string? Icon
);

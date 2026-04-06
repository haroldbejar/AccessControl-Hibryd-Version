namespace AccessControl.Application.Features.Roles.Dtos;

public sealed record RoleResponse(
    int Id,
    string Name,
    bool Visible
);

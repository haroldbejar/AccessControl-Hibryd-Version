namespace AccessControl.Application.Features.Users.Dtos;

public sealed record UserResponse(
    int Id,
    string UserAccount,
    string Name,
    int RoleId,
    string RoleName,
    bool Visible
);

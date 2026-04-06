namespace AccessControl.Application.Features.Auth.Dtos;

public sealed record LoginResponse(
    int UserId,
    string UserAccount,
    string Name,
    int RoleId,
    string RoleName,
    string Token,
    DateTime Expiration
);

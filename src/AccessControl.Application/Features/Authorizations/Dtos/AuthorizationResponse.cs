namespace AccessControl.Application.Features.Authorizations.Dtos;

public sealed record AuthorizationResponse(
    int Id,
    int RoleId,
    string RoleName,
    int MenuId,
    string MenuName,
    bool Create,
    bool Read,
    bool Update,
    bool Delete
);

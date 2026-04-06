namespace AccessControl.Application.Features.Auth.Dtos;

/// <summary>
/// Respuesta del Login. El token JWT se añadirá en Subfase 1.6.
/// </summary>
public sealed record LoginResponse(
    int UserId,
    string UserAccount,
    string Name,
    int RoleId,
    string RoleName,
    string Token   // Placeholder — generado en Subfase 1.6 (JwtService)
);

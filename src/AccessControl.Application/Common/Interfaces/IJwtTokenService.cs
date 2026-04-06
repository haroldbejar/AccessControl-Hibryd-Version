namespace AccessControl.Application.Common.Interfaces;

public interface IJwtTokenService
{
    (string Token, DateTime Expiration) GenerateToken(int userId, string userAccount, string roleName);
}

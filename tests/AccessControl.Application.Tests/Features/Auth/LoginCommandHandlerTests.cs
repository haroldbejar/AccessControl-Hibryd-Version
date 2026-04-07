using AccessControl.Application.Common.Interfaces;
using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Auth.Commands.Login;
using AccessControl.Application.Features.Auth.Dtos;
using AccessControl.Domain.Entities;
using AccessControl.Domain.Interfaces;
using FluentAssertions;
using NSubstitute;

namespace AccessControl.Application.Tests.Features.Auth;

public class LoginCommandHandlerTests
{
    private readonly IUnitOfWork _uow;
    private readonly IUserRepository _userRepo;
    private readonly IJwtTokenService _jwtService;
    private readonly LoginCommandHandler _handler;

    private const string _validPassword = "SecurePass123!";
    private readonly string _hashedPassword = BCrypt.Net.BCrypt.HashPassword(_validPassword);

    public LoginCommandHandlerTests()
    {
        _uow = Substitute.For<IUnitOfWork>();
        _userRepo = Substitute.For<IUserRepository>();
        _jwtService = Substitute.For<IJwtTokenService>();

        _uow.Users.Returns(_userRepo);

        _handler = new LoginCommandHandler(_uow, _jwtService);
    }

    private User BuildUser(bool visible = true) => new()
    {
        Id = 1,
        UserAccount = "admin",
        Name = "Administrador",
        Password = _hashedPassword,
        Visible = visible,
        RoleId = 1,
        Role = new Role { Id = 1, Name = "Admin" }
    };

    // ─── Happy path ────────────────────────────────────────────────────────────

    [Fact]
    public async Task Handle_WhenValidCredentials_ShouldReturnSuccessWithToken()
    {
        var user = BuildUser();
        var expiration = DateTime.UtcNow.AddHours(8);
        _userRepo.GetByUserAccountAsync("admin", Arg.Any<CancellationToken>()).Returns(user);
        _jwtService.GenerateToken(user.Id, user.UserAccount, "Admin").Returns(("jwt-token", expiration));

        var command = new LoginCommand("admin", _validPassword);
        var result = await _handler.Handle(command, CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value!.Token.Should().Be("jwt-token");
        result.Value.Expiration.Should().Be(expiration);
        result.Value.UserId.Should().Be(1);
        result.Value.RoleName.Should().Be("Admin");
    }

    [Fact]
    public async Task Handle_WhenValidCredentials_ShouldCallGenerateToken()
    {
        var user = BuildUser();
        _userRepo.GetByUserAccountAsync("admin", Arg.Any<CancellationToken>()).Returns(user);
        _jwtService.GenerateToken(Arg.Any<int>(), Arg.Any<string>(), Arg.Any<string>())
            .Returns(("token", DateTime.UtcNow.AddHours(8)));

        await _handler.Handle(new LoginCommand("admin", _validPassword), CancellationToken.None);

        _jwtService.Received(1).GenerateToken(user.Id, user.UserAccount, "Admin");
    }

    // ─── User not found ────────────────────────────────────────────────────────

    [Fact]
    public async Task Handle_WhenUserNotFound_ShouldReturnFailure()
    {
        _userRepo.GetByUserAccountAsync("unknown", Arg.Any<CancellationToken>()).Returns((User?)null);

        var result = await _handler.Handle(new LoginCommand("unknown", _validPassword), CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be("Credenciales inválidas.");
    }

    [Fact]
    public async Task Handle_WhenUserNotFound_ShouldNotCallJwtService()
    {
        _userRepo.GetByUserAccountAsync(Arg.Any<string>(), Arg.Any<CancellationToken>()).Returns((User?)null);

        await _handler.Handle(new LoginCommand("unknown", _validPassword), CancellationToken.None);

        _jwtService.DidNotReceive().GenerateToken(Arg.Any<int>(), Arg.Any<string>(), Arg.Any<string>());
    }

    // ─── User not visible ──────────────────────────────────────────────────────

    [Fact]
    public async Task Handle_WhenUserNotVisible_ShouldReturnFailure()
    {
        var user = BuildUser(visible: false);
        _userRepo.GetByUserAccountAsync("admin", Arg.Any<CancellationToken>()).Returns(user);

        var result = await _handler.Handle(new LoginCommand("admin", _validPassword), CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be("Credenciales inválidas.");
    }

    // ─── Wrong password ────────────────────────────────────────────────────────

    [Fact]
    public async Task Handle_WhenWrongPassword_ShouldReturnFailure()
    {
        var user = BuildUser();
        _userRepo.GetByUserAccountAsync("admin", Arg.Any<CancellationToken>()).Returns(user);

        var result = await _handler.Handle(new LoginCommand("admin", "WrongPassword!"), CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be("Credenciales inválidas.");
    }

    [Fact]
    public async Task Handle_WhenWrongPassword_ShouldNotCallJwtService()
    {
        var user = BuildUser();
        _userRepo.GetByUserAccountAsync("admin", Arg.Any<CancellationToken>()).Returns(user);

        await _handler.Handle(new LoginCommand("admin", "WrongPassword!"), CancellationToken.None);

        _jwtService.DidNotReceive().GenerateToken(Arg.Any<int>(), Arg.Any<string>(), Arg.Any<string>());
    }
}

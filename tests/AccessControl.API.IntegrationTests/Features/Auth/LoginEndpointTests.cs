using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using AccessControl.API.IntegrationTests.Infrastructure;
using FluentAssertions;

namespace AccessControl.API.IntegrationTests.Features.Auth;

public class LoginEndpointTests : IClassFixture<AccessControlWebApplicationFactory>
{
    private readonly HttpClient _client;

    public LoginEndpointTests(AccessControlWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    // ─── Happy path ────────────────────────────────────────────────────────────

    [Fact]
    public async Task Login_WithValidCredentials_ShouldReturn200()
    {
        var payload = new { UserAccount = "admin_test", Password = "Admin123!" };

        var response = await _client.PostAsJsonAsync("/api/auth/login", payload);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task Login_WithValidCredentials_ShouldReturnToken()
    {
        var payload = new { UserAccount = "admin_test", Password = "Admin123!" };

        var response = await _client.PostAsJsonAsync("/api/auth/login", payload);
        var body = await response.Content.ReadAsStringAsync();

        body.Should().Contain("token");
    }

    [Fact]
    public async Task Login_WithValidCredentials_ShouldReturnExpiration()
    {
        var payload = new { UserAccount = "admin_test", Password = "Admin123!" };

        var response = await _client.PostAsJsonAsync("/api/auth/login", payload);
        var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());

        json.RootElement.TryGetProperty("expiration", out _).Should().BeTrue();
    }

    [Fact]
    public async Task Login_WithValidCredentials_ShouldReturnUserInfo()
    {
        var payload = new { UserAccount = "admin_test", Password = "Admin123!" };

        var response = await _client.PostAsJsonAsync("/api/auth/login", payload);
        var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());

        json.RootElement.GetProperty("userAccount").GetString().Should().Be("admin_test");
        json.RootElement.GetProperty("roleName").GetString().Should().Be("Admin");
    }

    // ─── Credenciales inválidas ────────────────────────────────────────────────

    [Fact]
    public async Task Login_WithWrongPassword_ShouldReturn401()
    {
        var payload = new { UserAccount = "admin_test", Password = "WrongPassword!" };

        var response = await _client.PostAsJsonAsync("/api/auth/login", payload);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Login_WithNonExistentUser_ShouldReturn401()
    {
        var payload = new { UserAccount = "noexiste", Password = "Admin123!" };

        var response = await _client.PostAsJsonAsync("/api/auth/login", payload);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}

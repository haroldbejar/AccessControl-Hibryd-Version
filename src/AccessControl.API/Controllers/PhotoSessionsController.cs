using System.Net.NetworkInformation;
using System.Net.Sockets;
using AccessControl.API.Hubs;
using AccessControl.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace AccessControl.API.Controllers;

[ApiController]
[Route("api/photo-sessions")]
public class PhotoSessionsController : ControllerBase
{
    private readonly PhotoSessionService _sessionService;
    private readonly IHubContext<PhotoHub> _hub;

    public PhotoSessionsController(PhotoSessionService sessionService, IHubContext<PhotoHub> hub)
    {
        _sessionService = sessionService;
        _hub = hub;
    }

    /// <summary>Crea una sesión de captura remota. Requiere autenticación.</summary>
    [Authorize]
    [HttpPost]
    public IActionResult CreateSession()
    {
        var (sessionId, token) = _sessionService.CreateSession();
        var networkIp = NetworkInterface.GetAllNetworkInterfaces()
            .Where(ni => ni.OperationalStatus == OperationalStatus.Up &&
                         ni.NetworkInterfaceType != NetworkInterfaceType.Loopback)
            .SelectMany(ni => ni.GetIPProperties().UnicastAddresses)
            .Where(ua => ua.Address.AddressFamily == AddressFamily.InterNetwork)
            .Select(ua => ua.Address.ToString())
            .FirstOrDefault() ?? "localhost";
        return Ok(new { sessionId, token, networkIp });
    }

    /// <summary>Recibe la foto desde el celular. Ruta pública (sin JWT).</summary>
    [AllowAnonymous]
    [HttpPost("{sessionId}/upload")]
    public async Task<IActionResult> UploadPhoto(string sessionId, [FromBody] UploadPhotoRequest request)
    {
        if (!_sessionService.ValidateAndConsume(sessionId, request.Token))
            return Unauthorized(new { message = "Sesión inválida o expirada." });

        if (string.IsNullOrWhiteSpace(request.Photo))
            return BadRequest(new { message = "La foto es requerida." });

        await _hub.Clients.Group(sessionId).SendAsync("photoReceived", request.Photo);
        return Ok(new { message = "Foto recibida." });
    }
}

public record UploadPhotoRequest(string Token, string Photo);

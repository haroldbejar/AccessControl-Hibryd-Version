using AccessControl.Application.Features.Auth.Commands.Login;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace AccessControl.API.Controllers;

[Route("api/auth")]
public sealed class AuthController : BaseController
{
    public AuthController(IMediator mediator) : base(mediator) { }
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginCommand command, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(command, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : Unauthorized(result.Error);
    }
}

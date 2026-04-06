using AccessControl.Application.Features.Authorizations.Commands.UpsertAuthorization;
using AccessControl.Application.Features.Authorizations.Queries.GetAuthorizationsByRole;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace AccessControl.API.Controllers;

public sealed class AuthorizationsController : BaseController
{
    public AuthorizationsController(IMediator mediator) : base(mediator) { }
    [HttpGet]
    public async Task<IActionResult> GetByRole([FromQuery] int roleId, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetAuthorizationsByRoleQuery(roleId), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpPut]
    public async Task<IActionResult> Upsert([FromBody] UpsertAuthorizationCommand command, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(command, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }
}

using AccessControl.Application.Features.Representatives.Commands.CreateRepresentative;
using AccessControl.Application.Features.Representatives.Commands.DeleteRepresentative;
using AccessControl.Application.Features.Representatives.Commands.UpdateRepresentative;
using AccessControl.Application.Features.Representatives.Queries.GetRepresentativeById;
using AccessControl.Application.Features.Representatives.Queries.GetRepresentativesByDestination;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace AccessControl.API.Controllers;

public sealed class RepresentativesController : BaseController
{
    public RepresentativesController(IMediator mediator) : base(mediator) { }
    [HttpGet]
    public async Task<IActionResult> GetByDestination([FromQuery] int destinationId, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetRepresentativesByDestinationQuery(destinationId), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetRepresentativeByIdQuery(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : NotFound(result.Error);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateRepresentativeCommand command, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(command, cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value)
            : BadRequest(result.Error);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateRepresentativeCommand command, CancellationToken cancellationToken)
    {
        if (id != command.Id) return BadRequest("Route id does not match body id.");
        var result = await _mediator.Send(command, cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new DeleteRepresentativeCommand(id), cancellationToken);
        return result.IsSuccess ? NoContent() : BadRequest(result.Error);
    }
}

using AccessControl.Application.Features.Destinations.Commands.CreateDestination;
using AccessControl.Application.Features.Destinations.Commands.DeleteDestination;
using AccessControl.Application.Features.Destinations.Queries.GetAllDestinations;
using AccessControl.Application.Features.Destinations.Queries.GetDestinationById;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace AccessControl.API.Controllers;

public sealed class DestinationsController : BaseController
{
    public DestinationsController(IMediator mediator) : base(mediator) { }
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetAllDestinationsQuery(), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetDestinationByIdQuery(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : NotFound(result.Error);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateDestinationCommand command, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(command, cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value)
            : BadRequest(result.Error);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new DeleteDestinationCommand(id), cancellationToken);
        return result.IsSuccess ? NoContent() : BadRequest(result.Error);
    }
}

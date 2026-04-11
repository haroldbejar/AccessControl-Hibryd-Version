using AccessControl.Application.Features.Reservations.Commands.CancelReservation;
using AccessControl.Application.Features.Reservations.Commands.CompleteReservation;
using AccessControl.Application.Features.Reservations.Commands.ConfirmReservation;
using AccessControl.Application.Features.Reservations.Commands.CreateReservation;
using AccessControl.Application.Features.Reservations.Queries.GetAllReservations;
using AccessControl.Application.Features.Reservations.Queries.GetAvailability;
using AccessControl.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace AccessControl.API.Controllers;

public sealed class ReservationsController : BaseController
{
    public ReservationsController(IMediator mediator) : base(mediator) { }

    /// <summary>Obtiene reservas con filtros opcionales de fecha, zona y estado</summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] DateOnly? date,
        [FromQuery] int? commonAreaId,
        [FromQuery] ReservationStatusEnum? status,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(
            new GetAllReservationsQuery(date, commonAreaId, status), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    /// <summary>Obtiene la disponibilidad por hora de una zona para una fecha dada</summary>
    [HttpGet("availability")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAvailability(
        [FromQuery] int commonAreaId,
        [FromQuery] DateOnly date,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(
            new GetAvailabilityQuery(commonAreaId, date), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    /// <summary>Crea una nueva reserva</summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateReservationCommand command, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(command, cancellationToken);
        return result.IsSuccess
            ? CreatedAtAction(nameof(GetAll), null, result.Value)
            : BadRequest(result.Error);
    }

    /// <summary>Cancela una reserva pendiente o confirmada</summary>
    [HttpPatch("{id:int}/cancel")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Cancel(
        int id,
        [FromBody] CancelReservationRequest body,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(
            new CancelReservationCommand(id, body.CancellationReason), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    /// <summary>Confirma una reserva pendiente (solo admin)</summary>
    [HttpPatch("{id:int}/confirm")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Confirm(int id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new ConfirmReservationCommand(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }

    /// <summary>Completa una reserva confirmada (solo admin)</summary>
    [HttpPatch("{id:int}/complete")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Complete(int id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new CompleteReservationCommand(id), cancellationToken);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }
}

/// <summary>Body para cancelar una reserva</summary>
public sealed record CancelReservationRequest(string CancellationReason);

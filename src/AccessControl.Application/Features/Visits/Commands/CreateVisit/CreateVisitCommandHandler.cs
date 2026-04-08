using AccessControl.Application.Common.Mappings;
using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Visits.Dtos;
using AccessControl.Domain.Entities;
using AccessControl.Domain.Interfaces;
using MediatR;

namespace AccessControl.Application.Features.Visits.Commands.CreateVisit;

public sealed class CreateVisitCommandHandler : IRequestHandler<CreateVisitCommand, Result<VisitResponse>>
{
    private readonly IUnitOfWork _uow;

    public CreateVisitCommandHandler(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<Result<VisitResponse>> Handle(
        CreateVisitCommand request,
        CancellationToken cancellationToken)
    {
        // Verificar que el representante existe
        var representative = await _uow.Representatives.GetByIdAsync(request.RepresentativeId, cancellationToken);
        if (representative is null)
            return Result<VisitResponse>.Failure("El representante especificado no existe.");

        var fullName = string.Join(" ",
            new[] { request.FirstName, request.SecondName, request.LastName, request.SecondLastName }
                .Where(s => !string.IsNullOrWhiteSpace(s)));

        var visit = new Visit
        {
            DocumentNumber = request.DocumentNumber,
            FirstName = request.FirstName,
            SecondName = request.SecondName,
            LastName = request.LastName,
            SecondLastName = request.SecondLastName,
            FullName = fullName,
            RepresentativeId = request.RepresentativeId,
            HasVehicle = request.HasVehicle,
            VehicleTypeId = request.VehicleTypeId,
            Brand = request.Brand,
            Model = request.Model,
            Color = request.Color,
            Plate = request.Plate,
            Photo = request.Photo,
            Photo2 = request.Photo2,
            CheckIn = DateTime.UtcNow,
            UserCreated = request.UserCreated
        };

        await _uow.Visits.AddAsync(visit, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        // Recargar con includes para el mapper
        var created = await _uow.Visits.GetByIdAsync(visit.Id, cancellationToken);
        return Result<VisitResponse>.Success(created!.ToResponse());
    }
}

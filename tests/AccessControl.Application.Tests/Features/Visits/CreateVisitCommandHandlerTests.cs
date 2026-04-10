using AccessControl.Application.Common.Models;
using AccessControl.Application.Features.Visits.Commands.CreateVisit;
using AccessControl.Application.Features.Visits.Dtos;
using AccessControl.Domain.Entities;
using AccessControl.Domain.Enums;
using AccessControl.Domain.Interfaces;
using FluentAssertions;
using NSubstitute;

namespace AccessControl.Application.Tests.Features.Visits;

public class CreateVisitCommandHandlerTests
{
    private readonly IUnitOfWork _uow;
    private readonly IVisitRepository _visitRepo;
    private readonly IRepresentativeRepository _representativeRepo;
    private readonly CreateVisitCommandHandler _handler;

    public CreateVisitCommandHandlerTests()
    {
        _uow = Substitute.For<IUnitOfWork>();
        _visitRepo = Substitute.For<IVisitRepository>();
        _representativeRepo = Substitute.For<IRepresentativeRepository>();

        _uow.Visits.Returns(_visitRepo);
        _uow.Representatives.Returns(_representativeRepo);

        _handler = new CreateVisitCommandHandler(_uow);
    }

    private static CreateVisitCommand BuildCommand(int representativeId = 1) => new(
        DocumentNumber: "12345678",
        FirstName: "Juan",
        SecondName: null,
        LastName: "Pérez",
        SecondLastName: null,
        RepresentativeId: representativeId,
        HasVehicle: false,
        VehicleTypeId: VehicleTypeEnum.NA,
        Brand: null,
        Model: null,
        Color: null,
        Plate: null,
        Photo: null,
        Photo2: null,
        UserCreated: 1
    );

    private static Representative BuildRepresentative() => new()
    {
        Id = 1,
        Name = "Carlos López",
        DestinationId = 10,
        Destination = new Destination { Id = 10, Name = "Apto 101" }
    };

    private static Visit BuildVisitWithIncludes() => new()
    {
        Id = 1,
        DocumentNumber = "12345678",
        FirstName = "Juan",
        LastName = "Pérez",
        FullName = "Juan Pérez",
        RepresentativeId = 1,
        Representative = new Representative
        {
            Id = 1,
            Name = "Carlos López",
            DestinationId = 10,
            Destination = new Destination { Id = 10, Name = "Apto 101" }
        }
    };

    // ─── Representative not found ──────────────────────────────────────────────

    [Fact]
    public async Task Handle_WhenRepresentativeNotFound_ShouldReturnFailure()
    {
        _representativeRepo.GetByIdAsync(Arg.Any<int>(), Arg.Any<CancellationToken>())
            .Returns((Representative?)null);

        var result = await _handler.Handle(BuildCommand(), CancellationToken.None);

        result.IsFailure.Should().BeTrue();
        result.Error.Should().Be("El representante especificado no existe.");
    }

    [Fact]
    public async Task Handle_WhenRepresentativeNotFound_ShouldNotSaveChanges()
    {
        _representativeRepo.GetByIdAsync(Arg.Any<int>(), Arg.Any<CancellationToken>())
            .Returns((Representative?)null);

        await _handler.Handle(BuildCommand(), CancellationToken.None);

        await _uow.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    // ─── Happy path ────────────────────────────────────────────────────────────

    [Fact]
    public async Task Handle_WhenValidCommand_ShouldReturnSuccess()
    {
        var representative = BuildRepresentative();
        var visitWithIncludes = BuildVisitWithIncludes();

        _representativeRepo.GetByIdAsync(1, Arg.Any<CancellationToken>()).Returns(representative);
        _visitRepo.AddAsync(Arg.Any<Visit>(), Arg.Any<CancellationToken>())
            .Returns(callInfo => callInfo.Arg<Visit>());
        _visitRepo.GetByIdAsync(Arg.Any<int>(), Arg.Any<CancellationToken>())
            .Returns(visitWithIncludes);

        var result = await _handler.Handle(BuildCommand(), CancellationToken.None);

        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
    }

    [Fact]
    public async Task Handle_WhenValidCommand_ShouldSaveChanges()
    {
        var representative = BuildRepresentative();
        var visitWithIncludes = BuildVisitWithIncludes();

        _representativeRepo.GetByIdAsync(1, Arg.Any<CancellationToken>()).Returns(representative);
        _visitRepo.AddAsync(Arg.Any<Visit>(), Arg.Any<CancellationToken>())
            .Returns(callInfo => callInfo.Arg<Visit>());
        _visitRepo.GetByIdAsync(Arg.Any<int>(), Arg.Any<CancellationToken>())
            .Returns(visitWithIncludes);

        await _handler.Handle(BuildCommand(), CancellationToken.None);

        await _uow.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_WhenValidCommand_ShouldBuildCorrectFullName()
    {
        var representative = BuildRepresentative();
        Visit? capturedVisit = null;

        _representativeRepo.GetByIdAsync(1, Arg.Any<CancellationToken>()).Returns(representative);
        _visitRepo.AddAsync(Arg.Any<Visit>(), Arg.Any<CancellationToken>())
            .Returns(callInfo =>
            {
                capturedVisit = callInfo.Arg<Visit>();
                return capturedVisit;
            });
        _visitRepo.GetByIdAsync(Arg.Any<int>(), Arg.Any<CancellationToken>())
            .Returns(BuildVisitWithIncludes());

        var command = new CreateVisitCommand(
            DocumentNumber: "12345678",
            FirstName: "Juan",
            SecondName: "Carlos",
            LastName: "Pérez",
            SecondLastName: "García",
            RepresentativeId: 1,
            HasVehicle: false,
            VehicleTypeId: VehicleTypeEnum.NA,
            Brand: null, Model: null, Color: null, Plate: null, Photo: null, Photo2: null,
            UserCreated: 1);

        await _handler.Handle(command, CancellationToken.None);

        capturedVisit!.FullName.Should().Be("Juan Carlos Pérez García");
    }
}

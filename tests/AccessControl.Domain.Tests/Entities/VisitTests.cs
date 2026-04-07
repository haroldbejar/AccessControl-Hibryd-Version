using AccessControl.Domain.Entities;
using AccessControl.Domain.Enums;
using FluentAssertions;

namespace AccessControl.Domain.Test.Entities;

public class VisitTests
{
    // ─── Constructor ───────────────────────────────────────────────────────────

    [Fact]
    public void Constructor_ShouldSetCheckInToCurrentTime()
    {
        var before = DateTime.Now.AddSeconds(-1);

        var visit = new Visit();

        visit.CheckIn.Should().BeAfter(before).And.BeOnOrBefore(DateTime.Now);
    }

    [Fact]
    public void Constructor_ShouldSetCreatedDate()
    {
        var before = DateTime.Now.AddSeconds(-1);

        var visit = new Visit();

        visit.CreatedDate.Should().BeAfter(before).And.BeOnOrBefore(DateTime.Now);
    }

    [Fact]
    public void Constructor_ShouldInitializeWithNullCheckOut()
    {
        var visit = new Visit();

        visit.CheckOut.Should().BeNull();
    }

    // ─── IsCheckedOut ──────────────────────────────────────────────────────────

    [Fact]
    public void IsCheckedOut_WhenCheckOutIsNull_ShouldReturnFalse()
    {
        var visit = new Visit { CheckOut = null };

        visit.IsCheckedOut.Should().BeFalse();
    }

    [Fact]
    public void IsCheckedOut_WhenCheckOutHasValue_ShouldReturnTrue()
    {
        var visit = new Visit { CheckOut = DateTime.Now };

        visit.IsCheckedOut.Should().BeTrue();
    }

    // ─── VehicleTypeName ───────────────────────────────────────────────────────

    [Theory]
    [InlineData(VehicleTypeEnum.NA, "No Aplica")]
    [InlineData(VehicleTypeEnum.Car, "Carro")]
    [InlineData(VehicleTypeEnum.Motorcycle, "Moto")]
    [InlineData(VehicleTypeEnum.Bicycle, "Bicicleta")]
    public void VehicleTypeName_ShouldReturnCorrectDescription(VehicleTypeEnum type, string expected)
    {
        var visit = new Visit { VehicleTypeId = type };

        visit.VehicleTypeName.Should().Be(expected);
    }

    [Fact]
    public void VehicleTypeName_WhenUnknownValue_ShouldReturnNoAplica()
    {
        var visit = new Visit { VehicleTypeId = (VehicleTypeEnum)99 };

        visit.VehicleTypeName.Should().Be("No Aplica");
    }

    // ─── BaseEntity defaults ───────────────────────────────────────────────────

    [Fact]
    public void NewVisit_ShouldHaveEliminatedFalse()
    {
        var visit = new Visit();

        visit.Eliminated.Should().BeFalse();
    }

    [Fact]
    public void NewVisit_ShouldHaveDefaultVehicleTypeNA()
    {
        var visit = new Visit();

        visit.VehicleTypeId.Should().Be(VehicleTypeEnum.NA);
    }
}

using AccessControl.Domain.Entities;
using AccessControl.Domain.Enums;
using FluentAssertions;

namespace AccessControl.Domain.Test.Entities;

public class PackageTests
{
    // ─── Constructor ───────────────────────────────────────────────────────────

    [Fact]
    public void Constructor_ShouldSetStatusToReceived()
    {
        var package = new Package();

        package.Status.Should().Be(PackagesStatusEnum.Received);
    }

    [Fact]
    public void Constructor_ShouldSetReceivedDateToCurrentTime()
    {
        var before = DateTime.Now.AddSeconds(-1);

        var package = new Package();

        package.ReceivedDate.Should().BeAfter(before).And.BeOnOrBefore(DateTime.Now);
    }

    [Fact]
    public void Constructor_ShouldInitializeWithNullDeliveryDate()
    {
        var package = new Package();

        package.DeliveryDate.Should().BeNull();
    }

    // ─── IsPending ─────────────────────────────────────────────────────────────

    [Fact]
    public void IsPending_WhenStatusReceivedAndNotEliminated_ShouldReturnTrue()
    {
        var package = new Package
        {
            Status = PackagesStatusEnum.Received,
            Eliminated = false
        };

        package.IsPending.Should().BeTrue();
    }

    [Fact]
    public void IsPending_WhenStatusDelivered_ShouldReturnFalse()
    {
        var package = new Package { Status = PackagesStatusEnum.Delivered };

        package.IsPending.Should().BeFalse();
    }

    [Fact]
    public void IsPending_WhenEliminated_ShouldReturnFalse()
    {
        var package = new Package
        {
            Status = PackagesStatusEnum.Received,
            Eliminated = true
        };

        package.IsPending.Should().BeFalse();
    }

    // ─── StatusDescription ─────────────────────────────────────────────────────

    [Theory]
    [InlineData(PackagesStatusEnum.Received, "Recibido")]
    [InlineData(PackagesStatusEnum.Delivered, "Entregado")]
    public void StatusDescription_ShouldReturnCorrectText(PackagesStatusEnum status, string expected)
    {
        var package = new Package { Status = status };

        package.StatusDescription.Should().Be(expected);
    }

    [Fact]
    public void StatusDescription_WhenUnknownValue_ShouldReturnDesconocido()
    {
        var package = new Package { Status = (PackagesStatusEnum)99 };

        package.StatusDescription.Should().Be("Desconocido");
    }

    // ─── BaseEntity defaults ───────────────────────────────────────────────────

    [Fact]
    public void NewPackage_ShouldHaveEliminatedFalse()
    {
        var package = new Package();

        package.Eliminated.Should().BeFalse();
    }
}

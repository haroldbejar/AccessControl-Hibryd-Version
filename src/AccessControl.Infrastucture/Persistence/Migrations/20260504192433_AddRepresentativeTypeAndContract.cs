using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AccessControl.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddRepresentativeTypeAndContract : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateOnly>(
                name: "ContractEndDate",
                table: "Representatives",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RepresentativeType",
                table: "Representatives",
                type: "int",
                nullable: false,
                defaultValue: 1);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ContractEndDate",
                table: "Representatives");

            migrationBuilder.DropColumn(
                name: "RepresentativeType",
                table: "Representatives");
        }
    }
}

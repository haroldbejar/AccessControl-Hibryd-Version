using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AccessControl.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RemoveAuthorizationsAndMenus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Authorizations");

            migrationBuilder.DropTable(
                name: "Menus");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Menus",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    CreatedDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    Eliminated = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    EliminatedDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Icon = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ModifiedDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Name = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Page = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UserCreated = table.Column<int>(type: "int", nullable: false),
                    UserEliminated = table.Column<int>(type: "int", nullable: true),
                    UserModified = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Menus", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Authorizations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    MenuId = table.Column<int>(type: "int", nullable: false),
                    RoleId = table.Column<int>(type: "int", nullable: false),
                    Create = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    Delete = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    Eliminated = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    EliminatedDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    ModifiedDate = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    Read = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    Update = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    UserCreated = table.Column<int>(type: "int", nullable: false),
                    UserEliminated = table.Column<int>(type: "int", nullable: true),
                    UserModified = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Authorizations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Authorizations_Menus_MenuId",
                        column: x => x.MenuId,
                        principalTable: "Menus",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Authorizations_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Authorizations_MenuId",
                table: "Authorizations",
                column: "MenuId");

            migrationBuilder.CreateIndex(
                name: "IX_Authorizations_RoleId_MenuId",
                table: "Authorizations",
                columns: new[] { "RoleId", "MenuId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Menus_Name",
                table: "Menus",
                column: "Name",
                unique: true);
        }
    }
}

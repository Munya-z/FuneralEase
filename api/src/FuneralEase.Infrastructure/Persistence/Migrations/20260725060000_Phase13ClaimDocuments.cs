using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FuneralEase.Infrastructure.Persistence.Migrations;

/// <inheritdoc />
public partial class Phase13ClaimDocuments : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "Documents",
            table: "Claims",
            type: "jsonb",
            nullable: true);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "Documents",
            table: "Claims");
    }
}

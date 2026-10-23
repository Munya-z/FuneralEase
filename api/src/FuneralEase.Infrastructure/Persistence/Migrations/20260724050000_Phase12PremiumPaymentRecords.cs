using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FuneralEase.Infrastructure.Persistence.Migrations;

/// <inheritdoc />
public partial class Phase12PremiumPaymentRecords : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "PremiumPaymentRecords",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                PolicyId = table.Column<Guid>(type: "uuid", nullable: false),
                HouseholdId = table.Column<Guid>(type: "uuid", nullable: false),
                AmountPaid = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                PaidForDate = table.Column<DateOnly>(type: "date", nullable: false),
                RecordedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_PremiumPaymentRecords", x => x.Id);
            });

        migrationBuilder.CreateIndex(
            name: "IX_PremiumPaymentRecords_PolicyId",
            table: "PremiumPaymentRecords",
            column: "PolicyId");

        migrationBuilder.CreateIndex(
            name: "IX_PremiumPaymentRecords_HouseholdId",
            table: "PremiumPaymentRecords",
            column: "HouseholdId");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "PremiumPaymentRecords");
    }
}

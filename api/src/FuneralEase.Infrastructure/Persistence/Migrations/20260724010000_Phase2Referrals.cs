using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FuneralEase.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Phase2Referrals : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. ReferralCode column on Households
            migrationBuilder.AddColumn<string>(
                name: "ReferralCode",
                table: "Households",
                type: "character varying(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Households_ReferralCode",
                table: "Households",
                column: "ReferralCode",
                unique: true);

            // 2. ReferralLogs table
            migrationBuilder.CreateTable(
                name: "ReferralLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ReferrerHouseholdId = table.Column<Guid>(type: "uuid", nullable: false),
                    NewHouseholdId = table.Column<Guid>(type: "uuid", nullable: false),
                    ReferralCode = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    ConvertedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReferralLogs", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ReferralLogs_NewHouseholdId",
                table: "ReferralLogs",
                column: "NewHouseholdId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ReferralLogs_ReferrerHouseholdId",
                table: "ReferralLogs",
                column: "ReferrerHouseholdId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "ReferralLogs");

            migrationBuilder.DropIndex(
                name: "IX_Households_ReferralCode",
                table: "Households");

            migrationBuilder.DropColumn(
                name: "ReferralCode",
                table: "Households");
        }
    }
}

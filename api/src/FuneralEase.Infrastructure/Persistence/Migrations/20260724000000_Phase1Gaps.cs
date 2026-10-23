using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FuneralEase.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Phase1Gaps : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. POPIA consent timestamp on Users
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "PopiaConsentGivenAt",
                table: "Users",
                type: "timestamp with time zone",
                nullable: true);

            // 2. Trial period on Subscriptions
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "TrialEndsAt",
                table: "Subscriptions",
                type: "timestamp with time zone",
                nullable: true);

            // 3. AccessMode on EmergencyContacts
            migrationBuilder.AddColumn<string>(
                name: "AccessMode",
                table: "EmergencyContacts",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Delayed");

            // 4. BillingEventLogs table for idempotent webhook deduplication
            migrationBuilder.CreateTable(
                name: "BillingEventLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Channel = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    ProviderEventId = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    EventType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    HouseholdId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProcessedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BillingEventLogs", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BillingEventLogs_Channel_ProviderEventId",
                table: "BillingEventLogs",
                columns: new[] { "Channel", "ProviderEventId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "BillingEventLogs");

            migrationBuilder.DropColumn(name: "AccessMode", table: "EmergencyContacts");
            migrationBuilder.DropColumn(name: "TrialEndsAt", table: "Subscriptions");
            migrationBuilder.DropColumn(name: "PopiaConsentGivenAt", table: "Users");
        }
    }
}

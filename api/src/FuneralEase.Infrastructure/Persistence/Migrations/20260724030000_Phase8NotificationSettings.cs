using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FuneralEase.Infrastructure.Persistence.Migrations;

/// <inheritdoc />
public partial class Phase8NotificationSettings : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "household_notification_settings",
            columns: table => new
            {
                household_id = table.Column<Guid>(type: "uuid", nullable: false),
                premium_due = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                premium_overdue = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                lapse_warning = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                claim_updates = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                emergency_access = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                referral_joins = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                updated_at = table.Column<DateTimeOffset>(type: "timestamptz", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_household_notification_settings", x => x.household_id);
            });
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "household_notification_settings");
    }
}

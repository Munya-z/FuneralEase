using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FuneralEase.Infrastructure.Persistence.Migrations;

public partial class Phase7BurialSocietyAndAudit : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // ── BurialSocieties ───────────────────────────────────────────────────
        migrationBuilder.CreateTable(
            name: "BurialSocieties",
            columns: table => new
            {
                Id = table.Column<Guid>(nullable: false),
                Name = table.Column<string>(maxLength: 200, nullable: false),
                RegistrationNumber = table.Column<string>(maxLength: 50, nullable: true),
                AdminHouseholdId = table.Column<Guid>(nullable: false),
                MonthlyContributionAmount = table.Column<decimal>(precision: 18, scale: 2, nullable: false),
                CreatedAt = table.Column<DateTimeOffset>(nullable: false),
                UpdatedAt = table.Column<DateTimeOffset>(nullable: false)
            },
            constraints: table => table.PrimaryKey("PK_BurialSocieties", x => x.Id));

        // ── BurialSocietyMembers ──────────────────────────────────────────────
        migrationBuilder.CreateTable(
            name: "BurialSocietyMembers",
            columns: table => new
            {
                Id = table.Column<Guid>(nullable: false),
                SocietyId = table.Column<Guid>(nullable: false),
                HouseholdId = table.Column<Guid>(nullable: false),
                FullName = table.Column<string>(maxLength: 200, nullable: false),
                MobileNumber = table.Column<string>(maxLength: 20, nullable: false),
                JoinedAt = table.Column<DateTimeOffset>(nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_BurialSocietyMembers", x => x.Id);
                table.ForeignKey(
                    name: "FK_BurialSocietyMembers_BurialSocieties_SocietyId",
                    column: x => x.SocietyId,
                    principalTable: "BurialSocieties",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_BurialSocietyMembers_SocietyId_HouseholdId",
            table: "BurialSocietyMembers",
            columns: ["SocietyId", "HouseholdId"],
            unique: true);

        // ── ContributionRecords ───────────────────────────────────────────────
        migrationBuilder.CreateTable(
            name: "ContributionRecords",
            columns: table => new
            {
                Id = table.Column<Guid>(nullable: false),
                SocietyId = table.Column<Guid>(nullable: false),
                MemberId = table.Column<Guid>(nullable: false),
                AmountPaid = table.Column<decimal>(precision: 18, scale: 2, nullable: false),
                Period = table.Column<string>(maxLength: 7, nullable: false),
                RecordedAt = table.Column<DateTimeOffset>(nullable: false),
                Note = table.Column<string>(maxLength: 500, nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_ContributionRecords", x => x.Id);
                table.ForeignKey(
                    name: "FK_ContributionRecords_BurialSocieties_SocietyId",
                    column: x => x.SocietyId,
                    principalTable: "BurialSocieties",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(
            name: "IX_ContributionRecords_MemberId_Period",
            table: "ContributionRecords",
            columns: ["MemberId", "Period"],
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_ContributionRecords_SocietyId",
            table: "ContributionRecords",
            column: "SocietyId");

        // ── SystemAuditLogs ───────────────────────────────────────────────────
        migrationBuilder.CreateTable(
            name: "SystemAuditLogs",
            columns: table => new
            {
                Id = table.Column<Guid>(nullable: false),
                Actor = table.Column<string>(maxLength: 200, nullable: false),
                Action = table.Column<string>(maxLength: 100, nullable: false),
                Category = table.Column<string>(maxLength: 50, nullable: false),
                Subject = table.Column<string>(maxLength: 300, nullable: false),
                Detail = table.Column<string>(maxLength: 1000, nullable: true),
                OccurredAt = table.Column<DateTimeOffset>(nullable: false)
            },
            constraints: table => table.PrimaryKey("PK_SystemAuditLogs", x => x.Id));

        migrationBuilder.CreateIndex(
            name: "IX_SystemAuditLogs_OccurredAt",
            table: "SystemAuditLogs",
            column: "OccurredAt");

        migrationBuilder.CreateIndex(
            name: "IX_SystemAuditLogs_Category",
            table: "SystemAuditLogs",
            column: "Category");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable("ContributionRecords");
        migrationBuilder.DropTable("BurialSocietyMembers");
        migrationBuilder.DropTable("BurialSocieties");
        migrationBuilder.DropTable("SystemAuditLogs");
    }
}

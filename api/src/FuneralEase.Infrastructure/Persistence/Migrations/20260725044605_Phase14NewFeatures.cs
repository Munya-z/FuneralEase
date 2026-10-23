using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FuneralEase.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Phase14NewFeatures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "CoverAmount",
                table: "Policies",
                type: "numeric",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "DigitalAssets",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    HouseholdId = table.Column<Guid>(type: "uuid", nullable: false),
                    Category = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ServiceName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Username = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
                    EncryptedNotes = table.Column<string>(type: "character varying(4096)", maxLength: 4096, nullable: true),
                    Url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    OnDeathInstruction = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DigitalAssets", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EstateChecklists",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    HouseholdId = table.Column<Guid>(type: "uuid", nullable: false),
                    DeceasedFullName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    DateOfDeath = table.Column<DateOnly>(type: "date", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EstateChecklists", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Fundraisers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    HouseholdId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Story = table.Column<string>(type: "character varying(5000)", maxLength: 5000, nullable: false),
                    GoalAmount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    DeceasedFullName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Fundraisers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FuneralWishes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    HouseholdId = table.Column<Guid>(type: "uuid", nullable: false),
                    BurialType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CeremonyType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    MusicPreferences = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    ReadingPreferences = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    LegacyMessage = table.Column<string>(type: "character varying(5000)", maxLength: 5000, nullable: true),
                    SpecialRequests = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    PreferredParlourName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    DonationsInLieuOf = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FuneralWishes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "GriefJournalEntries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    HouseholdId = table.Column<Guid>(type: "uuid", nullable: false),
                    EncryptedContent = table.Column<string>(type: "character varying(20000)", maxLength: 20000, nullable: false),
                    Mood = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GriefJournalEntries", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LegalProfessionals",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PracticeType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    FirmName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ContactName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    PhoneNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    EmailAddress = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Area = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Province = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Website = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ModerationNote = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LegalProfessionals", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Obituaries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    HouseholdId = table.Column<Guid>(type: "uuid", nullable: false),
                    DeceasedFullName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Content = table.Column<string>(type: "character varying(10000)", maxLength: 10000, nullable: false),
                    IsAiGenerated = table.Column<bool>(type: "boolean", nullable: false),
                    GeneratedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    IsPublished = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Obituaries", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ParlourAppointments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ParlourId = table.Column<Guid>(type: "uuid", nullable: false),
                    HouseholdId = table.Column<Guid>(type: "uuid", nullable: false),
                    ContactName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    PhoneNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    RequestedDate = table.Column<DateOnly>(type: "date", nullable: true),
                    Notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ParlourAppointments", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EstateTasks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ChecklistId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    Category = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    IsRequired = table.Column<bool>(type: "boolean", nullable: false),
                    IsCompleted = table.Column<bool>(type: "boolean", nullable: false),
                    CompletedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    SortOrder = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EstateTasks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EstateTasks_EstateChecklists_ChecklistId",
                        column: x => x.ChecklistId,
                        principalTable: "EstateChecklists",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FundraiserContributions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FundraiserId = table.Column<Guid>(type: "uuid", nullable: false),
                    DonorName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    AmountCents = table.Column<int>(type: "integer", nullable: false),
                    Message = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    DonatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FundraiserContributions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FundraiserContributions_Fundraisers_FundraiserId",
                        column: x => x.FundraiserId,
                        principalTable: "Fundraisers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DigitalAssets_HouseholdId",
                table: "DigitalAssets",
                column: "HouseholdId");

            migrationBuilder.CreateIndex(
                name: "IX_EstateChecklists_HouseholdId",
                table: "EstateChecklists",
                column: "HouseholdId");

            migrationBuilder.CreateIndex(
                name: "IX_EstateTasks_ChecklistId",
                table: "EstateTasks",
                column: "ChecklistId");

            migrationBuilder.CreateIndex(
                name: "IX_FundraiserContributions_FundraiserId",
                table: "FundraiserContributions",
                column: "FundraiserId");

            migrationBuilder.CreateIndex(
                name: "IX_Fundraisers_HouseholdId",
                table: "Fundraisers",
                column: "HouseholdId");

            migrationBuilder.CreateIndex(
                name: "IX_FuneralWishes_HouseholdId",
                table: "FuneralWishes",
                column: "HouseholdId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GriefJournalEntries_UserId_HouseholdId",
                table: "GriefJournalEntries",
                columns: new[] { "UserId", "HouseholdId" });

            migrationBuilder.CreateIndex(
                name: "IX_LegalProfessionals_Province",
                table: "LegalProfessionals",
                column: "Province");

            migrationBuilder.CreateIndex(
                name: "IX_LegalProfessionals_Status",
                table: "LegalProfessionals",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Obituaries_HouseholdId",
                table: "Obituaries",
                column: "HouseholdId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ParlourAppointments_HouseholdId",
                table: "ParlourAppointments",
                column: "HouseholdId");

            migrationBuilder.CreateIndex(
                name: "IX_ParlourAppointments_ParlourId",
                table: "ParlourAppointments",
                column: "ParlourId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DigitalAssets");

            migrationBuilder.DropTable(
                name: "EstateTasks");

            migrationBuilder.DropTable(
                name: "FundraiserContributions");

            migrationBuilder.DropTable(
                name: "FuneralWishes");

            migrationBuilder.DropTable(
                name: "GriefJournalEntries");

            migrationBuilder.DropTable(
                name: "LegalProfessionals");

            migrationBuilder.DropTable(
                name: "Obituaries");

            migrationBuilder.DropTable(
                name: "ParlourAppointments");

            migrationBuilder.DropTable(
                name: "EstateChecklists");

            migrationBuilder.DropTable(
                name: "Fundraisers");

            migrationBuilder.DropColumn(
                name: "CoverAmount",
                table: "Policies");
        }
    }
}

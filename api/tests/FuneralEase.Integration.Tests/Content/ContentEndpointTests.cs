using System.Net;
using FuneralEase.Integration.Tests.Infrastructure;
using Xunit;

namespace FuneralEase.Integration.Tests.Content;

public class ContentEndpointTests(PostgresContainerFixture fixture) : IClassFixture<PostgresContainerFixture>
{
    private TestWebApplicationFactory CreateFactory() =>
        new(fixture.Postgres.GetConnectionString());

    [Fact]
    public async Task GetChecklistTemplates_ShouldReturn200WithItems()
    {
        using var factory = CreateFactory();
        var client = factory.CreateClient();

        var response = await client.GetAsync("/content/claims-checklist-templates");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("Death certificate", body, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task GetRepatriationGuide_ShouldReturn200()
    {
        using var factory = CreateFactory();
        var client = factory.CreateClient();

        var response = await client.GetAsync("/content/repatriation-guide");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("Embassy", body);
    }

    [Fact]
    public async Task GetParlours_WithNoResults_ShouldReturn200WithEmptyArray()
    {
        using var factory = CreateFactory();
        var client = factory.CreateClient();

        var response = await client.GetAsync("/parlours?area=UnknownArea");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadAsStringAsync();
        Assert.Equal("[]", body);
    }
}

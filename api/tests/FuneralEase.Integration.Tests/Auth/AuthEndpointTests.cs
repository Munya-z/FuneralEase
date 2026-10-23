using System.Net;
using System.Net.Http.Json;
using FuneralEase.Integration.Tests.Infrastructure;
using Xunit;

namespace FuneralEase.Integration.Tests.Auth;

public class AuthEndpointTests(PostgresContainerFixture fixture) : IClassFixture<PostgresContainerFixture>
{
    private TestWebApplicationFactory CreateFactory() =>
        new(fixture.Postgres.GetConnectionString());

    [Fact]
    public async Task RequestOtp_WithValidMobileNumber_ShouldReturn200()
    {
        using var factory = CreateFactory();
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/auth/otp/request", new { mobileNumber = "+27821234567" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task RequestOtp_WithInvalidMobileNumber_ShouldReturn422()
    {
        using var factory = CreateFactory();
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/auth/otp/request", new { mobileNumber = "not-a-number" });

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
    }

    [Fact]
    public async Task VerifyOtp_WithWrongCode_ShouldReturn403()
    {
        using var factory = CreateFactory();
        var client = factory.CreateClient();

        // First request an OTP
        await client.PostAsJsonAsync("/auth/otp/request", new { mobileNumber = "+27821234567" });

        // Verify with wrong code (popiaConsentGiven required when fullName is provided)
        var response = await client.PostAsJsonAsync("/auth/otp/verify", new
        {
            mobileNumber = "+27821234567",
            code = "000000",
            fullName = "Test User",
            popiaConsentGiven = true
        });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task ProtectedEndpoint_WithoutToken_ShouldReturn401()
    {
        using var factory = CreateFactory();
        var client = factory.CreateClient();

        var response = await client.GetAsync("/policies");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}

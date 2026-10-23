using Testcontainers.PostgreSql;
using Xunit;

namespace FuneralEase.Integration.Tests.Infrastructure;

public class PostgresContainerFixture : IAsyncLifetime
{
    private PostgreSqlContainer? _postgres;
    public PostgreSqlContainer Postgres => _postgres!;

    public async Task InitializeAsync()
    {
        // Ensure Testcontainers can find the Docker socket on macOS with Docker Desktop.
        // The macOS keychain-backed credsStore in ~/.docker/config.json can prevent
        // auto-detection in non-interactive environments; set DOCKER_HOST explicitly
        // before the first PostgreSqlBuilder is constructed so the static initializer
        // in DotNet.Testcontainers picks it up.
        if (string.IsNullOrEmpty(Environment.GetEnvironmentVariable("DOCKER_HOST")))
        {
            Environment.SetEnvironmentVariable("DOCKER_HOST", "unix:///var/run/docker.sock");
        }

        _postgres = new PostgreSqlBuilder()
            .WithImage("postgres:16-alpine")
            .WithDatabase("funeralease_test")
            .WithUsername("test")
            .WithPassword("test")
            .Build();

        await _postgres.StartAsync();
    }

    public async Task DisposeAsync()
    {
        if (_postgres is not null)
            await _postgres.DisposeAsync();
    }
}

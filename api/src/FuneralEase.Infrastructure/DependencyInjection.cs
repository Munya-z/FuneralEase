using FuneralEase.Application.Common.Interfaces;
using FuneralEase.Infrastructure.Anthropic;
using FuneralEase.Infrastructure.Audit;
using FuneralEase.Infrastructure.Auth;
using FuneralEase.Infrastructure.Encryption;
using FuneralEase.Infrastructure.Jobs;
using FuneralEase.Infrastructure.Notifications;
using FuneralEase.Infrastructure.Persistence;
using FuneralEase.Infrastructure.Persistence.Interceptors;
using FuneralEase.Infrastructure.Billing;
using FuneralEase.Infrastructure.Storage;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace FuneralEase.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Options
        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));
        services.Configure<AdminOptions>(configuration.GetSection(AdminOptions.SectionName));
        services.Configure<EncryptionOptions>(configuration.GetSection(EncryptionOptions.SectionName));
        services.Configure<PaystackOptions>(configuration.GetSection(PaystackOptions.SectionName));
        services.Configure<AnthropicOptions>(configuration.GetSection(AnthropicOptions.SectionName));

        // Persistence
        services.AddScoped<DomainEventDispatchInterceptor>();

        services.AddDbContext<ApplicationDbContext>((sp, options) =>
        {
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection"),
                npgsql => npgsql.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName));
            options.AddInterceptors(sp.GetRequiredService<DomainEventDispatchInterceptor>());
        });

        services.AddScoped<IApplicationDbContext>(sp => sp.GetRequiredService<ApplicationDbContext>());

        // Auth
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IOtpService, OtpService>();
        services.AddScoped<IStaffCredentialValidator, StaffCredentialValidator>();
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUserService, CurrentUserService>();

        // Storage
        var storageProvider = configuration["Storage:Provider"] ?? "Local";
        if (storageProvider == "GoogleCloud")
        {
            services.Configure<GoogleCloudStorageOptions>(configuration.GetSection(GoogleCloudStorageOptions.SectionName));
            services.AddSingleton<IFileStorageService, GoogleCloudStorageService>();
        }
        else
        {
            services.AddScoped<IFileStorageService, LocalFileStorageService>();
        }

        // Billing
        services.AddHttpClient("Paystack", (sp, c) =>
        {
            var opts = sp.GetRequiredService<IOptions<PaystackOptions>>().Value;
            var secret = opts.NormalizedSecretKey;
            if (!string.IsNullOrWhiteSpace(secret))
            {
                c.DefaultRequestHeaders.Authorization =
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", secret);
            }
            c.Timeout = TimeSpan.FromSeconds(15);
        });
        services.AddScoped<IBillingProvider, PaystackBillingProvider>();

        // Notifications
        services.Configure<NotificationOptions>(configuration.GetSection(NotificationOptions.SectionName));
        services.AddHttpClient("WhatsApp").ConfigureHttpClient(c => c.Timeout = TimeSpan.FromSeconds(10));
        services.AddHttpClient("Vonage").ConfigureHttpClient(c => c.Timeout = TimeSpan.FromSeconds(10));

        var notificationProvider = configuration[$"{NotificationOptions.SectionName}:Provider"] ?? "Logging";
        switch (notificationProvider)
        {
            case "WhatsApp":
                services.AddScoped<WhatsAppNotificationService>();
                services.AddScoped<VonageSmsNotificationService>();
                services.AddScoped<INotificationService, CompositeNotificationService>();
                break;
            case "Sms":
                services.AddScoped<INotificationService, VonageSmsNotificationService>();
                break;
            default:
                services.AddScoped<INotificationService, LoggingNotificationService>();
                break;
        }

        // JWT Bearer
        var jwtOpts = configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>()!;
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOpts.Secret)),
                    ValidateIssuer = true,
                    ValidIssuer = jwtOpts.Issuer,
                    ValidateAudience = true,
                    ValidAudience = jwtOpts.Audience,
                    ClockSkew = TimeSpan.Zero
                };
            });

        services.AddAuthorization(options =>
        {
            options.AddPolicy("AdminScope", policy =>
                policy.RequireClaim("scope", "funeralease:admin"));
            options.AddPolicy("HouseholdMember", policy =>
                policy.RequireAuthenticatedUser());
        });

        // Audit
        services.AddScoped<IAuditLogger, DbAuditLogger>();

        // Anthropic
        services.AddHttpClient("Anthropic").ConfigureHttpClient(c => c.Timeout = TimeSpan.FromSeconds(30));
        services.AddScoped<IAnthropicClient, AnthropicClient>();

        // Background jobs
        services.AddHostedService<LapseEscalationJob>();

        return services;
    }
}

using DotNetEnv;
using Kilo.Data;
using Kilo.Helpers;
using Kilo.Interfaces;
using Kilo.Repository;
using Kilo.Services;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.EntityFrameworkCore;
using NLog;
using NLog.Web;
using System;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;

//load .env file
Env.Load();

// Early init of NLog to allow startup and exception logging, before host is built
var logger = NLog.LogManager.Setup().LoadConfigurationFromAppSettings().GetCurrentClassLogger();
logger.Debug("init main");

//try, catch, finally for NLog
try
{
    var builder = WebApplication.CreateBuilder(args);

    // Add environment variables to config
    builder.Configuration.AddEnvironmentVariables();

    // Add services to the container.

    builder.Services.AddControllers();
    // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();

    //database connection string check
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

    if (string.IsNullOrEmpty(connectionString))
    {
        throw new Exception("Database connection string is not configured.");
    }

    //to connect to database
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
    {
        options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
    });

    builder.Services.AddControllers()
        .AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        });

    builder.Services.AddScoped<IEnergyLogRepository, EnergyLogRepository>();
    builder.Services.AddScoped<IEnergyLogService, EnergyLogService>();
    builder.Services.AddScoped<IListingRepository, ListingRepository>();
    builder.Services.AddScoped<IListingService, ListingService>();
    builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();
    builder.Services.AddScoped<ITransactionService, TransactionService>();
    builder.Services.AddScoped<IUserRepository, UserRepository>();
    builder.Services.AddScoped<IUserService, UserService>();
    builder.Services.AddScoped<IMeterRepository, MeterRepository>();
    builder.Services.AddScoped<IMeterService, MeterService>();

    //background job
    builder.Services.AddScoped<EnergyDeliveryService>();
    builder.Services.AddHostedService<SurplusBackgroundService>();

    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowKilo",
            policy =>
            {
                policy.WithOrigins(
                        "https://grid-pay-umber.vercel.app",
                        "https://gridpay.onrender.com"
                      )
                      .AllowAnyMethod()
                      .AllowAnyHeader();
            });
    });

    //This does rate limiting per user ip
    builder.Services.AddRateLimiter(options =>
    {
        options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

        options.OnRejected = async (context, token) =>
        {
            context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;

            // Try to get the retry time default to 0 if not found
            context.Lease.TryGetMetadata(MetadataName.RetryAfter, out TimeSpan retryAfter);

            // Ensure at least 1 second
            var retrySeconds = Math.Max(retryAfter.TotalSeconds, 1);
            context.HttpContext.Response.Headers.RetryAfter = $"{retrySeconds}";

            var problemDetailsFactory = context.HttpContext.RequestServices.GetRequiredService<ProblemDetailsFactory>();

            var problemDetails = problemDetailsFactory.CreateProblemDetails(
                context.HttpContext,
                StatusCodes.Status429TooManyRequests,
                title: "Too Many Requests",
                detail: $"Quota exceeded. Please try again after {retrySeconds} seconds."
            );

            await context.HttpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken: token);
        };

        options.AddPolicy("ip-sliding", httpContext =>
        {
            return RateLimitPartition.GetSlidingWindowLimiter
            (
                partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                factory: partition => new SlidingWindowRateLimiterOptions
                {
                    PermitLimit = 20,
                    Window = TimeSpan.FromSeconds(10),
                    SegmentsPerWindow = 5,
                    QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                    QueueLimit = 5
                }
            );
        });
    });

    var app = builder.Build();

    //This is to get the users IP address instead of the IP address of your hosting provider
    app.UseForwardedHeaders(new ForwardedHeadersOptions
    {
        ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto,
        KnownNetworks = { },
        KnownProxies = { }
    });

    // Configure the HTTP request pipeline.
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    app.UseHttpsRedirection();

    app.UseCors("AllowKilo");

    //rate limiting
    app.UseRateLimiter();

    app.UseAuthorization();

    app.MapControllers();

    app.Run();
}
catch (Exception exception)
{
    // NLog: catch setup errors
    logger.Error(exception, "Stopped program because of exception");
    throw;
}
finally
{
    // Ensure to flush and stop internal timers/threads before application-exit (Avoid segmentation fault on Linux)
    LogManager.Shutdown();
}
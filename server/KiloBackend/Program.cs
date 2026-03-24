using DotNetEnv;
using Kilo.Data;
using Kilo.Interfaces;
using Kilo.Repository;
using Microsoft.EntityFrameworkCore;
using NLog;
using NLog.Web;
using System;
using System.Text.Json.Serialization;

//load .env file
Env.Load();

// Early init of NLog to allow startup and exception logging, before host is built
var logger = NLog.LogManager.Setup().LoadConfigurationFromAppSettings().GetCurrentClassLogger();
logger.Debug("init main");

//try, catch, finally for NLog
try
{
    var builder = WebApplication.CreateBuilder(args);

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
    builder.Services.AddScoped<IListingRepository, ListingRepository>();
    builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();
    builder.Services.AddScoped<IUserRepository, UserRepository>();
    builder.Services.AddScoped<IMeterRepository, MeterRepository>();

    //builder.Services.AddCors(options =>
    //{
    //    options.AddPolicy("AllowKiloFrontend",
    //        policy =>
    //        {
    //            policy.WithOrigins("https://localhost:7295")
    //                  .AllowAnyMethod()
    //                  .AllowAnyHeader();
    //        });
    //});

    builder.Services.AddCors(options =>
    {
        options.AddPolicy("DevCors",
            policy =>
            {
                policy.AllowAnyOrigin()
                      .AllowAnyHeader()
                      .AllowAnyMethod();
            });
    });

    var app = builder.Build();

    // Configure the HTTP request pipeline.
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    app.UseHttpsRedirection();

    //app.UseCors("AllowKiloFrontend");
    app.UseCors("DevCors");

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
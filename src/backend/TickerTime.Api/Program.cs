using TickerTime.Api.Features.StockSubscriptions;
using TickerTime.Api.Features.LivePriceStream;
using TickerTime.Api.Features.HistoricalPlayback;
using TickerTime.Api.Features.PerformanceInvestigation;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSignalR();
builder.Services.AddSingleton<ConnectionSubscriptionStore>();

// Performance Investigation services
builder.Services.AddSingleton<InvestigationScenarioStore>();

// Live Price Stream services
builder.Services.AddSingleton<DeterministicPriceEngine>();
builder.Services.AddSingleton<InMemoryTimelineStore>();
builder.Services.AddSingleton<LiveQuoteBroadcaster>();
builder.Services.AddHostedService<LivePriceBackgroundService>();

// Historical Playback services
builder.Services.AddSingleton<HistoryQueryService>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

app.UseCors();
app.MapHub<StocksHub>("/hubs/stocks");
app.MapHistoryEndpoints();
app.MapInvestigationEndpoints();

app.Run();

using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using TickerTime.Api.Features.LivePriceStream;

namespace TickerTime.Api.Features.PerformanceInvestigation
{
    public static class InvestigationEndpoints
    {
        public static void MapInvestigationEndpoints(this IEndpointRouteBuilder endpoints)
        {
            endpoints.MapPost("/api/investigation/scenario", (InvestigationScenarioSettings settings, InvestigationScenarioStore store) =>
            {
                store.Update(settings);
                return Results.Ok();
            });

            endpoints.MapPost("/api/investigation/reset", (InvestigationScenarioStore store) =>
            {
                store.Reset();
                return Results.Ok();
            });
        }
    }
}

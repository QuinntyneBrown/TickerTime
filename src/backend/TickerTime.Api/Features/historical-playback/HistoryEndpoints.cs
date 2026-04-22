using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using TickerTime.Api.Features.PerformanceInvestigation;
using TickerTime.Api.Features.StockSubscriptions;

namespace TickerTime.Api.Features.HistoricalPlayback
{
    public static class HistoryEndpoints
    {
        public static void MapHistoryEndpoints(this IEndpointRouteBuilder endpoints)
        {
            endpoints.MapGet("/api/history", (HistoryQueryService queryService, InvestigationScenarioStore scenarioStore) =>
            {
                var scenario = scenarioStore.Current;
                return Results.Ok(queryService.GetHistory(
                    StockSymbolCatalog.GetSymbols(scenario.SymbolCount),
                    scenario.HistoryPoints));
            });

            endpoints.MapGet("/api/symbols", (InvestigationScenarioStore scenarioStore) =>
            {
                var symbols = StockSymbolCatalog.GetSymbols(scenarioStore.Current.SymbolCount)
                    .Select(symbol => new
                    {
                        symbol,
                        name = StockSymbolCatalog.GetDisplayName(symbol)
                    });

                return Results.Ok(symbols);
            });
        }
    }
}

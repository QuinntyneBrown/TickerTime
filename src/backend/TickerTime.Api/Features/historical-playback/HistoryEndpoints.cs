using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using System.Collections.Generic;
using TickerTime.Api.Features.StockSubscriptions;

namespace TickerTime.Api.Features.HistoricalPlayback
{
    public static class HistoryEndpoints
    {
        public static void MapHistoryEndpoints(this IEndpointRouteBuilder endpoints)
        {
            endpoints.MapGet("/api/history", (HistoryQueryService queryService) =>
            {
                var symbols = StockSymbolCatalog.GetAllSymbols();
                return Results.Ok(queryService.GetHistory(symbols, 120));
            });
        }
    }
}

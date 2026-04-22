using System;

namespace TickerTime.Api.Features.HistoricalPlayback
{
    public record HistoricalQuoteDto(string Symbol, decimal Price, DateTime Timestamp);
}

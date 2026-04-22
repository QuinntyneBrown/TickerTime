using System;

namespace TickerTime.Api.Features.LivePriceStream
{
    public record StockTick(string Symbol, decimal Price, DateTime Timestamp);
}

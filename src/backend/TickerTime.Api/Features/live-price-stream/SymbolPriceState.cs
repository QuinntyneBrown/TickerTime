namespace TickerTime.Api.Features.LivePriceStream
{
    public record SymbolPriceState(string Symbol, decimal CurrentPrice, int Sequence, int Seed);
}

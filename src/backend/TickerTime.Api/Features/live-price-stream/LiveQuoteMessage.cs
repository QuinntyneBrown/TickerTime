namespace TickerTime.Api.Features.LivePriceStream
{
    public record LiveQuoteMessage(string Symbol, decimal Price, string Timestamp);
}

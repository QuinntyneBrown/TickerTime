using System.Collections.Generic;

namespace TickerTime.Api.Features.StockSubscriptions
{
    public record SetSubscriptionsRequest(List<string> Symbols);
}

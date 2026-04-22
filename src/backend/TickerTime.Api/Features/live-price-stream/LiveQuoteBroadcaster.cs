using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using TickerTime.Api.Features.StockSubscriptions;

namespace TickerTime.Api.Features.LivePriceStream
{
    public class LiveQuoteBroadcaster
    {
        private readonly IHubContext<StocksHub> _hubContext;

        public LiveQuoteBroadcaster(IHubContext<StocksHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task Broadcast(StockTick tick)
        {
            var message = new LiveQuoteMessage(tick.Symbol, tick.Price, tick.Timestamp.ToString("O"));
            await _hubContext.Clients.Group(tick.Symbol).SendAsync("ReceiveQuote", message);
        }
    }
}

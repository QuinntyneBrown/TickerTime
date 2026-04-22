using Microsoft.AspNetCore.SignalR;
using System.Linq;
using System.Threading.Tasks;

namespace TickerTime.Api.Features.StockSubscriptions
{
    public class StocksHub : Hub
    {
        private readonly ConnectionSubscriptionStore _subscriptionStore;

        public StocksHub(ConnectionSubscriptionStore subscriptionStore)
        {
            _subscriptionStore = subscriptionStore;
        }

        public async Task SetSubscriptions(SetSubscriptionsRequest request)
        {
            var connectionId = Context.ConnectionId;
            var validSymbols = request.Symbols.Intersect(StockSymbolCatalog.GetAllSymbols()).ToList();
            var oldSymbols = _subscriptionStore.Get(connectionId);

            // Remove from old groups
            foreach (var symbol in oldSymbols.Except(validSymbols))
            {
                await Groups.RemoveFromGroupAsync(connectionId, symbol);
            }

            // Add to new groups
            foreach (var symbol in validSymbols.Except(oldSymbols))
            {
                await Groups.AddToGroupAsync(connectionId, symbol);
            }

            _subscriptionStore.Set(connectionId, validSymbols);
        }

        public override Task OnDisconnectedAsync(System.Exception? exception)
        {
            _subscriptionStore.Remove(Context.ConnectionId);
            return base.OnDisconnectedAsync(exception);
        }
    }
}

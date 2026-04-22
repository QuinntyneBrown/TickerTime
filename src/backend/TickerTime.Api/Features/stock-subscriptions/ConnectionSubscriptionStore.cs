using System.Collections.Concurrent;
using System.Collections.Generic;

namespace TickerTime.Api.Features.StockSubscriptions
{
    public class ConnectionSubscriptionStore
    {
        private readonly ConcurrentDictionary<string, HashSet<string>> _subscriptions = new();

        public IReadOnlyCollection<string> Get(string connectionId)
        {
            return _subscriptions.TryGetValue(connectionId, out var symbols) ? symbols : new HashSet<string>();
        }

        public void Set(string connectionId, IEnumerable<string> symbols)
        {
            _subscriptions[connectionId] = new HashSet<string>(symbols);
        }

        public void Remove(string connectionId)
        {
            _subscriptions.TryRemove(connectionId, out _);
        }
    }
}

using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;

namespace TickerTime.Api.Features.LivePriceStream
{
    public class InMemoryTimelineStore
    {
        private readonly ConcurrentDictionary<string, List<StockTick>> _timelines = new();
        private const int MaxHistory = 1000;

        public void Append(StockTick tick)
        {
            _timelines.AddOrUpdate(tick.Symbol, 
                _ => new List<StockTick> { tick }, 
                (_, list) => 
                {
                    lock(list)
                    {
                        list.Add(tick);
                        if (list.Count > MaxHistory) list.RemoveAt(0);
                        return list;
                    }
                });
        }

        public IReadOnlyList<StockTick> GetLatest(string symbol, int count)
        {
            if (_timelines.TryGetValue(symbol, out var list))
            {
                lock(list)
                {
                    return list.TakeLast(count).ToList();
                }
            }
            return new List<StockTick>();
        }
    }
}

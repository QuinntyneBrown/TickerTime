using System.Collections.Generic;
using System.Linq;
using TickerTime.Api.Features.LivePriceStream;

namespace TickerTime.Api.Features.HistoricalPlayback
{
    public class HistoryQueryService
    {
        private readonly InMemoryTimelineStore _timelineStore;

        public HistoryQueryService(InMemoryTimelineStore timelineStore)
        {
            _timelineStore = timelineStore;
        }

        public HistoryResponse GetHistory(IEnumerable<string> symbols, int count)
        {
            var history = symbols.ToDictionary(
                s => s,
                s => _timelineStore.GetLatest(s, count)
                    .Select(t => new HistoricalQuoteDto(t.Symbol, t.Price, t.Timestamp))
                    .ToList());
            return new HistoryResponse(history);
        }
    }
}

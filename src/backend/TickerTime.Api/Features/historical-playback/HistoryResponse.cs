using System.Collections.Generic;

namespace TickerTime.Api.Features.HistoricalPlayback
{
    public record HistoryResponse(Dictionary<string, List<HistoricalQuoteDto>> History);
}

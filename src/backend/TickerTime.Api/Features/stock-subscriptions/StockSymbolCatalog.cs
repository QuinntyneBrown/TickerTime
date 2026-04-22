using System.Collections.Generic;

namespace TickerTime.Api.Features.StockSubscriptions
{
    public static class StockSymbolCatalog
    {
        private static readonly List<string> _symbols = new()
        {
            "SYM001", "SYM002", "SYM003", "SYM004", "SYM005"
        };

        public static IReadOnlyList<string> GetAllSymbols() => _symbols;
    }
}

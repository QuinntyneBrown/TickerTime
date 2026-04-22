using System.Collections.Generic;
using System.Linq;

namespace TickerTime.Api.Features.StockSubscriptions
{
    public static class StockSymbolCatalog
    {
        private const int DefaultCatalogSize = 200;
        private static readonly IReadOnlyList<string> _symbols = Enumerable.Range(1, DefaultCatalogSize)
            .Select(index => $"SYM{index:000}")
            .ToArray();

        public static IReadOnlyList<string> GetAllSymbols() => _symbols;

        public static IReadOnlyList<string> GetSymbols(int count)
        {
            if (count <= 0)
            {
                return [];
            }

            return _symbols.Take(count).ToArray();
        }

        public static string GetDisplayName(string symbol)
        {
            return symbol.StartsWith("SYM") && symbol.Length == 6
                ? $"Symbol {symbol[3..]}"
                : symbol;
        }
    }
}

using System;

namespace TickerTime.Api.Features.LivePriceStream
{
    public class DeterministicPriceEngine
    {
        public SymbolPriceState GetNext(SymbolPriceState state)
        {
            var random = new Random(state.Seed + state.Sequence);
            var changePercent = (decimal)(random.NextDouble() * 0.02 - 0.01); // +/- 1%
            var nextPrice = state.CurrentPrice * (1 + changePercent);
            return state with { CurrentPrice = nextPrice, Sequence = state.Sequence + 1 };
        }
    }
}

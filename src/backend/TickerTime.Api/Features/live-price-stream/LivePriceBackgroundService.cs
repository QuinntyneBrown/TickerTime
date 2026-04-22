using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using TickerTime.Api.Features.PerformanceInvestigation;
using TickerTime.Api.Features.StockSubscriptions;

namespace TickerTime.Api.Features.LivePriceStream
{
    public class LivePriceBackgroundService : BackgroundService
    {
        private readonly DeterministicPriceEngine _engine;
        private readonly InMemoryTimelineStore _store;
        private readonly LiveQuoteBroadcaster _broadcaster;
        private readonly InvestigationScenarioStore _scenarioStore;
        private List<SymbolPriceState> _states = null!;
        private InvestigationScenarioSettings? _appliedScenario;

        public LivePriceBackgroundService(
            DeterministicPriceEngine engine, 
            InMemoryTimelineStore store, 
            LiveQuoteBroadcaster broadcaster,
            InvestigationScenarioStore scenarioStore)
        {
            _engine = engine;
            _store = store;
            _broadcaster = broadcaster;
            _scenarioStore = scenarioStore;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            ApplyScenario(_scenarioStore.Current);

            while (!stoppingToken.IsCancellationRequested)
            {
                var scenario = _scenarioStore.Current;

                if (_appliedScenario != scenario)
                {
                    ApplyScenario(scenario);
                    scenario = _scenarioStore.Current;
                }

                await Task.Delay(scenario.TickIntervalMs, stoppingToken);

                for (int i = 0; i < _states.Count; i++)
                {
                    _states[i] = _engine.GetNext(_states[i]);
                    var tick = new StockTick(_states[i].Symbol, _states[i].CurrentPrice, DateTime.UtcNow);
                    _store.Append(tick);
                    await _broadcaster.Broadcast(tick);
                }
            }
        }

        private void ApplyScenario(InvestigationScenarioSettings scenario)
        {
            var seededTimeline = new List<StockTick>();
            var nextStates = new List<SymbolPriceState>();
            var startTimestamp = DateTime.UtcNow.AddMilliseconds(-scenario.TickIntervalMs * Math.Max(scenario.HistoryPoints - 1, 0));

            foreach (var entry in StockSymbolCatalog.GetSymbols(scenario.SymbolCount).Select((symbol, index) => (symbol, index)))
            {
                var state = new SymbolPriceState(entry.symbol, 100.00m + entry.index * 10, 0, scenario.Seed + entry.index);

                for (int pointIndex = 0; pointIndex < scenario.HistoryPoints; pointIndex++)
                {
                    state = _engine.GetNext(state);
                    seededTimeline.Add(new StockTick(
                        state.Symbol,
                        state.CurrentPrice,
                        startTimestamp.AddMilliseconds(pointIndex * scenario.TickIntervalMs)));
                }

                nextStates.Add(state);
            }

            _store.Reset(seededTimeline);
            _states = nextStates;
            _appliedScenario = scenario;
        }
    }
}

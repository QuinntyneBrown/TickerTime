using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using TickerTime.Api.Features.StockSubscriptions;
using TickerTime.Api.Features.PerformanceInvestigation;

namespace TickerTime.Api.Features.LivePriceStream
{
    public class LivePriceBackgroundService : BackgroundService
    {
        private readonly DeterministicPriceEngine _engine;
        private readonly InMemoryTimelineStore _store;
        private readonly LiveQuoteBroadcaster _broadcaster;
        private readonly InvestigationScenarioStore _scenarioStore;
        private List<SymbolPriceState> _states = null!;

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
            InitializeStates();
        }

        private void InitializeStates()
        {
            var scenario = _scenarioStore.Current;
            _states = StockSymbolCatalog.GetAllSymbols()
                .Take(scenario.SymbolCount)
                .Select((s, i) => new SymbolPriceState(s, 100.00m + i * 10, 0, scenario.Seed + i))
                .ToList();
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                var scenario = _scenarioStore.Current;
                using var timer = new PeriodicTimer(TimeSpan.FromMilliseconds(scenario.TickIntervalMs));
                
                while (await timer.WaitForNextTickAsync(stoppingToken))
                {
                    // Check if scenario changed and re-initialize if needed
                    if (_states.Count != scenario.SymbolCount)
                    {
                        InitializeStates();
                    }

                    for (int i = 0; i < _states.Count; i++)
                    {
                        _states[i] = _engine.GetNext(_states[i]);
                        var tick = new StockTick(_states[i].Symbol, _states[i].CurrentPrice, DateTime.UtcNow);
                        _store.Append(tick);
                        await _broadcaster.Broadcast(tick);
                    }
                }
            }
        }
    }
}

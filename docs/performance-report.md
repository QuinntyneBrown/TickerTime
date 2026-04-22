# TickerTime Performance And Memory Investigation Report

## Executive Summary

This report compares the two investigation routes in the current codebase:

- `/investigation/pipe`: derive status in a render-time Angular pipe
- `/investigation/signal`: derive status in a store-side computed signal

The repository currently runs on **.NET 8** and **Angular 17**. This benchmark pass extends the earlier latency-focused run with a **browser heap allocation and forced garbage collection probe** captured through Chromium's CDP APIs.

The updated result is more nuanced than the previous latency-only report:

- **Light** load is effectively a wash
- **Heavy** load favors the signal-based route on both render and scrub latency
- **Stress** latency is close enough that a single local run should not be treated as final proof either way
- **Stress** memory behavior favors the signal-based route, with lower peak heap, lower post-GC heap, and more memory reclaimed by forced GC

If the primary concern is simple view logic for a small board, either approach is fine. If the board is expected to stay live under sustained load and memory churn matters, the signal-based route remains the stronger default.

## 1. Methodology

### 1.1 Environment

- Backend: ASP.NET Core `net8.0`
- Frontend: Angular `17.3.x`
- Browser runner: Playwright + Chromium
- Benchmark date: `2026-04-22`
- Execution mode: local development environment, one Playwright worker, Angular dev server on `http://localhost:4200`, API on `http://localhost:5000`

### 1.2 Benchmark Flow

Each test run used this sequence:

1. Post scenario settings to `POST /api/investigation/scenario`
2. Load either `/investigation/pipe` or `/investigation/signal`
3. Subscribe to the scenario-sized watchlist returned by `/api/symbols`
4. Capture live route behavior for 10 seconds
5. Switch to history mode
6. Drive five deterministic slider `input` events
7. Trigger a forced browser GC and record post-GC heap usage

The backend pre-seeds the in-memory timeline to the configured history depth, so the history step uses the intended scenario window instead of a partially warmed cache.

### 1.3 Scenarios

| Scenario | Symbols | Tick Rate | History Window |
| --- | ---: | ---: | ---: |
| Light | 5 | 250 ms | 120 points |
| Heavy | 50 | 100 ms | 120 points |
| Stress | 100 | 50 ms | 240 points |

### 1.4 Captured Metrics

Latency metrics:

- `derivationCount`
- `avg render latency`
- `max render latency`
- `avg scrub latency`
- `max scrub latency`

Memory metrics:

- `peak heap`: highest `Runtime.getHeapUsage.usedSize` sample during the scenario
- `workload-end heap`: heap usage after the history scrub phase
- `post-GC heap`: heap usage immediately after `HeapProfiler.collectGarbage`
- `peak growth`: peak heap minus baseline heap
- `reclaimed by forced GC`: workload-end heap minus post-GC heap
- `retained growth after GC`: post-GC heap minus baseline heap

> [!NOTE]
> These numbers come from a single local Chromium run per scenario/mode. They are useful for directional comparison, but not sufficient on their own to claim statistically stable wins under all environments.

## 2. Latency Results

| Scenario | Mode | Derivations | Avg Render Latency | Max Render Latency | Avg Scrub Latency | Max Scrub Latency |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Light | Pipe | 45 | 6.09 ms | 12.50 ms | 5.55 ms | 12.50 ms |
| Light | Signal | 45 | 6.17 ms | 10.60 ms | 3.97 ms | 7.40 ms |
| Heavy | Pipe | 1,575 | 9.10 ms | 16.70 ms | 10.85 ms | 17.30 ms |
| Heavy | Signal | 1,575 | 8.73 ms | 13.90 ms | 9.45 ms | 12.10 ms |
| Stress | Pipe | 5,650 | 9.01 ms | 40.30 ms | 14.45 ms | 40.80 ms |
| Stress | Signal | 5,650 | 9.62 ms | 45.10 ms | 14.75 ms | 45.90 ms |

## 3. Memory And GC Results

All heap values are shown in MiB.

| Scenario | Mode | Peak Heap | Peak Point | Workload-End Heap | Post-GC Heap | Peak Growth | Reclaimed By Forced GC | Retained Growth After GC |
| --- | --- | ---: | --- | ---: | ---: | ---: | ---: | ---: |
| Light | Pipe | 10.10 | `scrub-5` | 10.10 | 5.90 | 1.79 | 4.20 | -2.40 |
| Light | Signal | 10.08 | `scrub-5` | 10.08 | 5.86 | 1.75 | 4.23 | -2.47 |
| Heavy | Pipe | 15.02 | `live-6s` | 8.52 | 7.22 | 6.46 | 1.31 | -1.35 |
| Heavy | Signal | 15.10 | `live-10s` | 10.70 | 7.03 | 6.53 | 3.66 | -1.53 |
| Stress | Pipe | 32.66 | `scrub-1` | 24.94 | 10.53 | 23.95 | 14.41 | 1.81 |
| Stress | Signal | 30.81 | `scrub-1` | 26.00 | 8.90 | 22.06 | 17.10 | 0.14 |

## 4. Analysis

### 4.1 Derivation Count Still Does Not Decide The Outcome

The derivation counts remained identical inside each scenario:

- Light: `45` vs `45`
- Heavy: `1,575` vs `1,575`
- Stress: `5,650` vs `5,650`

That means the comparison is still about where the work lives and how it behaves under pressure, not about one route magically skipping computation.

### 4.2 Light Load Is A Practical Tie

At 5 symbols and 250 ms ticks:

- average render latency was nearly identical (`6.09 ms` pipe vs `6.17 ms` signal)
- signal had better scrub latency (`3.97 ms` avg vs `5.55 ms`)
- signal had lower max render latency (`10.60 ms` vs `12.50 ms`)
- heap and GC behavior were effectively identical

For small boards, the implementation choice should be based on clarity and reuse rather than micro-optimizing performance.

### 4.3 Heavy Load Favors Computed Signals

At 50 symbols and 100 ms ticks, the signal-based route was better across the latency columns:

- `4.0%` lower average render latency
- `16.8%` lower max render latency
- `12.9%` lower average scrub latency
- `30.1%` lower max scrub latency

Memory behavior was mixed during the active run, but signal still ended with a slightly lower post-GC heap (`7.03 MiB` vs `7.22 MiB`) and reclaimed far more memory when GC was forced (`3.66 MiB` vs `1.31 MiB`).

This is the clearest scenario in the current run: once the board reaches medium size, moving derivation out of the template pays off.

### 4.4 Stress Latency Is Close, But Stress Memory Favors Signals

At 100 symbols and 50 ms ticks, this single instrumented run showed a slight latency edge for the pipe route:

- average render latency: `9.01 ms` pipe vs `9.62 ms` signal
- max render latency: `40.30 ms` pipe vs `45.10 ms` signal
- average scrub latency: `14.45 ms` pipe vs `14.75 ms` signal
- max scrub latency: `40.80 ms` pipe vs `45.90 ms` signal

That is not a decisive enough gap to declare a stable winner, especially because this run also added periodic heap sampling and forced GC instrumentation.

The memory side is more directional:

- signal reached a lower peak heap (`30.81 MiB` vs `32.66 MiB`)
- signal retained less heap after forced GC (`8.90 MiB` vs `10.53 MiB`)
- signal reclaimed more memory during forced GC (`17.10 MiB` vs `14.41 MiB`)
- signal ended much closer to baseline retained growth (`0.14 MiB` vs `1.81 MiB`)

So the stress result is best interpreted as:

- latency: near tie, with mild pipe advantage in this run
- memory stability: signal advantage

### 4.5 What The GC Probe Actually Tells Us

The forced-GC numbers do **not** prove memory leaks or leak-freedom by themselves. What they do show is how much heap each route tends to leave resident after the same workload.

In this run:

- both implementations released a large amount of short-lived heap after GC
- the signal route consistently ended at the same or lower post-GC heap
- the stress scenario was the most meaningful differentiator, where signal retained much less heap above baseline

For a real-time board that can sit open for long sessions, that is useful signal even when instantaneous latency is close.

## 5. When To Choose Each Approach

### Choose Render-Time Pipes When

- the derived value is simple, local, and only used in one template
- the board is small and update frequency is low
- template readability is more important than squeezing out runtime behavior
- you care more about minimal abstraction than shared derived state
- you have measured the real board and found no latency or memory pressure problems

### Choose Computed Signals When

- derived row state is reused across views or interactions
- you expect medium-to-large boards or sustained real-time updates
- scrub behavior and predictable peak latency matter
- you want derivation logic to live in testable state code instead of the template
- long-lived sessions and heap churn matter enough to care about post-GC retention

For **TickerTime specifically**, the best default is still the signal-based route when the board is expected to operate as an investigation surface rather than a tiny demo widget. The heavy scenario favors signals on latency, and the stress scenario favors signals on memory retention even though the latency result is mixed in this one run.

## 6. Conclusion

The updated benchmark adds browser memory allocation and forced-GC coverage instead of looking at latency alone.

The practical takeaway is:

- use **pipes** when the UI is small, local, and simple
- use **computed signals** when the board is expected to scale or stay open under load

If I were choosing for the main TickerTime investigation board, I would still choose the **signal-based implementation**, but with one caveat: rerun the stress scenario multiple times in CI or a controlled lab environment before treating the latency difference as settled. The memory results are favorable to signals already; the stress latency question needs more repetitions than a single local pass.

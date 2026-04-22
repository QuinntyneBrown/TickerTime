# TickerTime Detailed Designs

## Purpose

TickerTime is a radically simple stock investigation prototype built to answer one question:

- should derived ticker status live in an Angular pipe at render time
- or in a computed signal inside an Angular store

The comparison only covers these two modes:

- `pipe-based derivation`
- `computed signal in store`

Both modes render the same stock board and consume the same raw displayed rows. The only difference is where `direction`, `percentage change`, and `badge tone` are derived.

## Investigation Target

The derived UI state is:

- `direction`: `up | down | flat`
- `percentChange`: `(displayedPrice - referencePrice) / referencePrice`
- `badgeTone`: `positive | negative | neutral`

`displayedPrice` comes from the currently selected mode:

- live mode: latest tick
- historical mode: the scrubbed history point

`referencePrice` is the immediately previous point in the same timeline.

## Primary Metrics

The prototype should compare the two modes on these metrics only:

| Metric | Meaning | Where captured |
| --- | --- | --- |
| `derivationCount` | How often the status formula runs | App instrumentation |
| `renderLatencyMs` | Time from inbound quote to next painted UI | App instrumentation |
| `scrubLatencyMs` | Time from slider change to next painted UI | App instrumentation |
| `TaskDuration`, `ScriptDuration`, `LayoutDuration` | Browser CPU and layout cost under load | Chrome DevTools Protocol |

## Design Rules

- .NET 8 backend with one SignalR hub and in-memory state only.
- Angular 17 frontend using signals for app state. No RxJS stores.
- The implementation stays deterministic so runs are comparable.
- No database, queue, cache cluster, or authentication.
- No domain complexity beyond live quotes, history, and the derived status badge.
- Each slice is small enough to build and test in isolation.

## Proposed Repository Layout

```text
TickerTime/
├── docs/
│   └── detailed-designs/
├── src/
│   ├── backend/
│   │   ├── TickerTime.Api/
│   │   │   ├── Features/
│   │   │   └── Program.cs
│   │   └── TickerTime.Api.Tests/
│   │       └── Features/
│   └── frontend/
│       ├── ticker-time-ui/
│       │   └── src/app/
│       │       ├── features/
│       │       ├── app.routes.ts
│       │       └── app.config.ts
│       └── ticker-time-ui-e2e/
│           ├── src/page-objects/
│           ├── src/specs/
│           └── src/support/
└── artifacts/
    └── benchmarks/
```

## Feature Slices

1. [01 Stock Subscriptions](./01-stock-subscriptions/README.md)
2. [02 Live Price Stream](./02-live-price-stream/README.md)
3. [03 Historical Playback](./03-historical-playback/README.md)
4. [04 Pipe Status Board](./04-pipe-status-board/README.md)
5. [05 Signal Status Board](./05-signal-status-board/README.md)
6. [06 Performance Investigation](./06-performance-investigation/README.md)

## Delivery Order

1. Stock subscriptions
2. Live price stream
3. Historical playback
4. Pipe status board
5. Signal status board
6. Performance investigation

This order keeps the prototype vertically sliced and leaves the comparison feature until the raw data flow is already working.

## Benchmark Scenarios

Keep the scenario set intentionally small:

| Scenario | Symbols | Tick interval | History points | Notes |
| --- | --- | --- | --- | --- |
| `small-live` | 10 | 250 ms | 120 | Sanity baseline |
| `medium-live` | 25 | 100 ms | 240 | Main live comparison |
| `medium-scrub` | 25 | 100 ms | 240 | Focus on scrub latency |

Each scenario runs both routes:

- `/investigation/pipe`
- `/investigation/signal`

Each run should use the same seed, same symbol set, same browser, and the same number of repetitions.

# TickerTime Performance Investigation Report

## Executive Summary

This report compares the two investigation routes in the current codebase:

- `/investigation/pipe`: derive status in a render-time Angular pipe
- `/investigation/signal`: derive status in a store-side computed signal

The repository now runs on **.NET 8** and **Angular 17**, and the benchmark was rerun after updating the stack and fixing the scenario plumbing so each run actually uses its configured symbol count and history window.

The result is straightforward:

- both implementations executed the same number of derivations in every scenario
- the **signal-based approach** produced lower latency under medium and high load
- the **pipe-based approach** remained competitive in the smallest scenario, where the extra structure of a computed store brings little benefit

## 1. Methodology

### 1.1 Environment

- Backend: ASP.NET Core `net8.0`
- Frontend: Angular `17.3.x`
- Browser runner: Playwright + Chromium
- Benchmark date: `2026-04-22`
- Execution mode: local development environment, one Playwright worker, Angular dev server on `http://localhost:4200`, API on `http://localhost:5000`

### 1.2 Benchmark Flow

Each test run used this sequence:

1. Post the scenario settings to `POST /api/investigation/scenario`
2. Load either `/investigation/pipe` or `/investigation/signal`
3. Subscribe to the scenario-sized watchlist returned by `/api/symbols`
4. Capture live render metrics for 10 seconds
5. Switch to history mode
6. Drive five deterministic slider `input` events to measure scrub latency

The backend now pre-seeds the in-memory timeline to the scenario's configured history depth, so the scrub stage uses the intended history window instead of a partially warmed cache.

### 1.3 Scenarios

| Scenario | Symbols | Tick Rate | History Window |
| --- | ---: | ---: | ---: |
| Light | 5 | 250 ms | 120 points |
| Heavy | 50 | 100 ms | 120 points |
| Stress | 100 | 50 ms | 240 points |

### 1.4 Captured Metrics

- `derivationCount`: total status calculations executed during the run
- `avg render latency`: mean time from state change to next painted frame
- `max render latency`: worst observed render delay
- `avg scrub latency`: mean time from slider input to next painted frame
- `max scrub latency`: worst observed scrub delay

## 2. Results

| Scenario | Mode | Derivations | Avg Render Latency | Max Render Latency | Avg Scrub Latency | Max Scrub Latency |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Light | Pipe | 45 | 7.54 ms | 14.50 ms | 6.28 ms | 14.80 ms |
| Light | Signal | 45 | 6.90 ms | 17.90 ms | 6.40 ms | 18.30 ms |
| Heavy | Pipe | 1,575 | 9.10 ms | 29.70 ms | 14.93 ms | 30.30 ms |
| Heavy | Signal | 1,575 | 8.53 ms | 26.00 ms | 13.90 ms | 27.00 ms |
| Stress | Pipe | 5,650 | 7.70 ms | 63.20 ms | 26.65 ms | 65.20 ms |
| Stress | Signal | 5,650 | 6.94 ms | 48.20 ms | 23.98 ms | 49.50 ms |

## 3. Analysis

### 3.1 Derivation Count Did Not Decide The Outcome

The derivation counts were identical within each scenario:

- Light: `45` vs `45`
- Heavy: `1,575` vs `1,575`
- Stress: `5,650` vs `5,650`

That matters because it shows the signal win did **not** come from eliminating derivations entirely. In this implementation, both routes still recompute the same number of rows. The difference shows up in **when** the work is paid for and how much latency spikes under load.

### 3.2 Light Load Is Effectively A Wash

At 5 symbols and 250 ms ticks, the signal route had a modest average render advantage:

- `8.5%` lower average render latency (`6.90 ms` vs `7.54 ms`)

But the pipe route had slightly better worst-case behavior in this smallest case:

- lower max render latency (`14.50 ms` vs `17.90 ms`)
- lower max scrub latency (`14.80 ms` vs `18.30 ms`)

For small boards and low-frequency updates, either approach is acceptable.

### 3.3 Heavy Load Favors Computed Signals

At 50 symbols and 100 ms ticks, the signal route was better across every latency column:

- `6.3%` lower average render latency
- `12.5%` lower max render latency
- `6.9%` lower average scrub latency
- `10.9%` lower max scrub latency

This is the point where keeping derivation out of the template starts to pay off consistently.

### 3.4 Stress Load Makes The Tradeoff Clear

At 100 symbols, 50 ms ticks, and a 240-point history window, the difference widened:

- `9.8%` lower average render latency for signals
- `23.7%` lower max render latency for signals
- `10.0%` lower average scrub latency for signals
- `24.1%` lower max scrub latency for signals

The important number here is the **peak** behavior. Pipe mode hit `63.20 ms` max render latency and `65.20 ms` max scrub latency, while signal mode stayed at `48.20 ms` and `49.50 ms`. Under aggressive update pressure, the computed-signal path is materially more stable.

## 4. When To Choose Each Approach

### Choose Render-Time Pipes When

- the derived value is simple, local, and used in one template
- the list is small and update frequency is low
- readability in the template matters more than squeezing out peak latency
- the value is presentation-oriented rather than shared application state
- you want the smallest possible abstraction for a prototype or admin view

### Choose Computed Signals When

- the same derived row state is reused across components or interactions
- updates are frequent enough that peak frame latency matters
- the board size can grow into dozens or hundreds of rows
- you need better scrub behavior on history or playback views
- you want derivation logic to live in testable, reusable state code rather than the template

For **TickerTime specifically**, the signal-based store is the better default for the investigation board itself, because the app's core job is to compare behavior under real-time load rather than optimize for the shortest template code.

## 5. Conclusion

The updated `.NET 8` / `Angular 17` run reaches the same high-level conclusion as the earlier prototype, but with cleaner scenario fidelity:

- use **pipes** for small, simple, low-pressure views
- use **computed signals** for real-time boards where peak latency and scalability matter

In this codebase, computed signals should be the preferred implementation for any status board expected to handle medium or stress-level traffic.

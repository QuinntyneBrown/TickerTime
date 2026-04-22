# TickerTime

<p align="center">
  <a href="https://github.com/QuinntyneBrown/TickerTime/actions/workflows/ci.yml">
    <img src="https://github.com/QuinntyneBrown/TickerTime/actions/workflows/ci.yml/badge.svg" alt="Build status">
  </a>
  <a href="./LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="MIT License">
  </a>
  <img src="https://img.shields.io/badge/.NET-11%20preview-512BD4" alt=".NET 11 preview">
  <img src="https://img.shields.io/badge/Angular-21-DD0031" alt="Angular 21">
  <img src="https://img.shields.io/badge/SignalR-real--time-008272" alt="SignalR">
  <img src="https://img.shields.io/badge/Playwright-benchmarks-45BA4B" alt="Playwright">
  <img src="https://img.shields.io/badge/status-experimental-orange" alt="Project status">
</p>

<p align="center">
  <a href="#highlights">Highlights</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#testing-and-benchmarks">Testing</a> •
  <a href="#repository-layout">Repository Layout</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

TickerTime is an experimental real-time market board for comparing two Angular derivation strategies over the same deterministic stock feed:

- `render-time pipe` derivation at `/investigation/pipe`
- `store-side computed signal` derivation at `/investigation/signal`

The repository pairs an ASP.NET Core + SignalR backend with an Angular frontend, instrumentation for render timing, and a Playwright harness for repeatable browser-side performance experiments.

> [!NOTE]
> The checked-in code is the source of truth for runtime requirements. The app currently targets `.NET 11 preview` and `Angular 21`. Some design docs in `docs/` were written earlier and should be treated as architecture notes rather than exact version guarantees.

## Highlights

- Deterministic live quote generation for repeatable comparisons.
- SignalR-based subscription delivery and live update fan-out.
- Shared playback/history flow so both UI modes operate on identical data.
- Built-in instrumentation for derivation count, render latency, and scrub latency.
- Focused backend tests plus a browser benchmark harness for side-by-side route comparisons.
- Slice-oriented design docs in [`docs/detailed-designs`](./docs/detailed-designs/README.md).

## Architecture

| Layer | Stack | Responsibility |
| --- | --- | --- |
| Backend | ASP.NET Core `net11.0` + SignalR | Quote generation, subscriptions, history, scenario configuration |
| Frontend | Angular 21 + Signals | Pipe-based and signal-based investigation routes |
| Test Harness | xUnit, Moq, Playwright | Backend verification and browser performance runs |

### API Surface

- `GET /api/history` returns in-memory quote history.
- `POST /api/investigation/scenario` updates benchmark settings.
- `POST /api/investigation/reset` clears benchmark scenario state.
- `SignalR /hubs/stocks` handles subscriptions and live quote delivery.

## Quick Start

### Prerequisites

- .NET SDK `11.0.100-preview.3` or newer preview in the .NET 11 line
- Node.js `24+`
- npm `10+`

### 1. Start the backend

The Angular clients are currently hard-coded to talk to `http://localhost:5000`, so run the API on that port:

```bash
dotnet run --project src/backend/TickerTime.Api/TickerTime.Api.csproj --urls http://localhost:5000
```

### 2. Start the frontend

```bash
cd src/frontend/ticker-time-ui
npm ci
npm start
```

Then open:

- `http://localhost:4200/investigation/pipe`
- `http://localhost:4200/investigation/signal`

### 3. Explore the comparison

- Use the watchlist to subscribe to available sample symbols.
- Let live quotes stream in real time.
- Switch to history mode and scrub the timeline.
- Compare derivation counts and render behavior across both routes.

## Testing And Benchmarks

### Backend tests

```bash
dotnet test src/backend/TickerTime.Api.Tests/TickerTime.Api.Tests.csproj
```

### Frontend production build

```bash
cd src/frontend/ticker-time-ui
npm ci
npm run build
```

### Playwright performance runs

Start the backend on `http://localhost:5000` and the frontend on `http://localhost:4200`, then run:

```bash
cd src/frontend/ticker-time-ui-e2e
npm ci
npx playwright install
npx playwright test src/specs/pipe-vs-signal.performance.spec.ts
```

Related material:

- Benchmark summary: [`docs/performance-report.md`](./docs/performance-report.md)
- Design docs: [`docs/detailed-designs/README.md`](./docs/detailed-designs/README.md)

> [!IMPORTANT]
> The current sample catalog ships with five symbols in the checked-in code. If you want to run larger scenarios than the default watchlist supports, expand the symbol catalog and frontend watchlist first.

## Repository Layout

```text
TickerTime/
├── docs/
│   ├── detailed-designs/
│   └── performance-report.md
├── src/
│   ├── backend/
│   │   ├── TickerTime.Api/
│   │   └── TickerTime.Api.Tests/
│   └── frontend/
│       ├── ticker-time-ui/
│       └── ticker-time-ui-e2e/
├── .github/
│   └── workflows/
└── TickerTime.slnx
```

## CI

GitHub Actions runs a lightweight CI workflow on pushes and pull requests that:

- restores and tests the backend
- installs and builds the Angular frontend

The build badge at the top of this README points to that workflow.

## Contributing

Contributions are welcome, especially in these areas:

- tightening the benchmark harness and reporting
- extending the symbol/scenario model beyond the current sample set
- improving ergonomics around local environment configuration
- adding broader frontend test coverage

For substantive changes, open an issue or draft pull request first so the benchmark goal and scope stay aligned.

## License

This project is licensed under the MIT License. See [`LICENSE`](./LICENSE) for details.

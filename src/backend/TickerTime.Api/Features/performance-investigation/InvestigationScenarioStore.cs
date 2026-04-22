namespace TickerTime.Api.Features.PerformanceInvestigation
{
    public class InvestigationScenarioStore
    {
        public InvestigationScenarioSettings Current { get; private set; } = new(5, 250, 120, 12345);

        public void Update(InvestigationScenarioSettings settings)
        {
            Current = settings;
        }

        public void Reset()
        {
            Current = new(5, 250, 120, 12345);
        }
    }
}

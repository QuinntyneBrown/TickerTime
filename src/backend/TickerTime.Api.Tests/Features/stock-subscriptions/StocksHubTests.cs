using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Moq;
using TickerTime.Api.Features.StockSubscriptions;
using Xunit;

namespace TickerTime.Api.Tests.Features.StockSubscriptions
{
    public class StocksHubTests
    {
        [Fact]
        public async Task SetSubscriptions_UpdatesGroupMemberships()
        {
            var store = new ConnectionSubscriptionStore();
            var mockGroups = new Mock<IGroupManager>();
            var mockContext = new Mock<HubCallerContext>();
            var connectionId = "conn1";
            mockContext.Setup(c => c.ConnectionId).Returns(connectionId);

            var addedGroups = new List<string>();
            var removedGroups = new List<string>();

            mockGroups.Setup(g => g.AddToGroupAsync(connectionId, It.IsAny<string>(), default))
                .Returns(Task.CompletedTask)
                .Callback<string, string, System.Threading.CancellationToken>((cid, group, _) => addedGroups.Add(group));
            mockGroups.Setup(g => g.RemoveFromGroupAsync(connectionId, It.IsAny<string>(), default))
                .Returns(Task.CompletedTask)
                .Callback<string, string, System.Threading.CancellationToken>((cid, group, _) => removedGroups.Add(group));

            var hub = new StocksHub(store)
            {
                Groups = mockGroups.Object,
                Context = mockContext.Object
            };

            // Initial subscription
            await hub.SetSubscriptions(new SetSubscriptionsRequest(new List<string> { "SYM001", "SYM002" }));
            Assert.Contains("SYM001", addedGroups);
            Assert.Contains("SYM002", addedGroups);

            // Change subscription
            addedGroups.Clear();
            removedGroups.Clear();
            await hub.SetSubscriptions(new SetSubscriptionsRequest(new List<string> { "SYM002", "SYM003" }));
            Assert.Contains("SYM003", addedGroups);
            Assert.Contains("SYM001", removedGroups);
        }
    }
}

using System.Collections.Generic;
using TickerTime.Api.Features.StockSubscriptions;
using Xunit;

namespace TickerTime.Api.Tests.Features.StockSubscriptions
{
    public class ConnectionSubscriptionStoreTests
    {
        [Fact]
        public void Can_Add_And_Get_Subscriptions()
        {
            var store = new ConnectionSubscriptionStore();
            var connectionId = "conn1";
            var symbols = new List<string> { "SYM001", "SYM002" };

            store.Set(connectionId, symbols);
            var result = store.Get(connectionId);

            Assert.Equal(symbols, result);
        }

        [Fact]
        public void Can_Replace_Subscriptions()
        {
            var store = new ConnectionSubscriptionStore();
            var connectionId = "conn1";
            store.Set(connectionId, new List<string> { "SYM001" });
            store.Set(connectionId, new List<string> { "SYM002" });

            var result = store.Get(connectionId);
            Assert.Equal(new List<string> { "SYM002" }, result);
        }

        [Fact]
        public void Can_Remove_Subscriptions()
        {
            var store = new ConnectionSubscriptionStore();
            var connectionId = "conn1";
            store.Set(connectionId, new List<string> { "SYM001" });
            store.Remove(connectionId);

            var result = store.Get(connectionId);
            Assert.Empty(result);
        }
    }
}

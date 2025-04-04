using ccxt;
namespace Tests;

// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:
// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code

public partial class BaseTest
{
        public void testExtend()
        {
            var exchange = new ccxt.Exchange(new Dictionary<string, object>() {
                { "id", "regirock" },
            });
            object obj1 = new Dictionary<string, object>() {
                { "a", 1 },
                { "b", new List<object>() {1, 2} },
                { "c", new List<object>() {new Dictionary<string, object>() {
            { "test1", 1 },
            { "test2", 1 },
        }} },
                { "d", null },
                { "e", "not_undefined" },
                { "sub", new Dictionary<string, object>() {
                    { "a", 1 },
                    { "b", new List<object>() {1, 2} },
                    { "c", new List<object>() {new Dictionary<string, object>() {
            { "test1", 1 },
            { "test2", 2 },
        }} },
                    { "d", null },
                    { "e", "not_undefined" },
                    { "other1", "x" },
                } },
                { "other1", "x" },
            };
            object obj2 = new Dictionary<string, object>() {
                { "a", 2 },
                { "b", new List<object>() {3, 4} },
                { "c", new List<object>() {new Dictionary<string, object>() {
            { "test1", 2 },
            { "test3", 3 },
        }} },
                { "d", "not_undefined" },
                { "e", null },
                { "sub", new Dictionary<string, object>() {
                    { "a", 2 },
                    { "b", new List<object>() {3, 4} },
                    { "c", new List<object>() {new Dictionary<string, object>() {
            { "test1", 2 },
            { "test3", 3 },
        }} },
                    { "d", "not_undefined" },
                    { "e", null },
                    { "other2", "y" },
                } },
                { "other2", "y" },
            };
            // extend
            object extended = exchange.extend(obj1, obj2);
            tbfeCheckExtended(extended, true);
        }
        public void tbfeCheckExtended(object extended, object hasSub)
        {
            Assert(isEqual(getValue(extended, "a"), 2));
            Assert(isEqual(getValue(getValue(extended, "b"), 0), 3));
            Assert(isEqual(getValue(getValue(extended, "b"), 1), 4));
            Assert(isEqual(getValue(getValue(getValue(extended, "c"), 0), "test1"), 2));
            Assert(!isTrue((inOp(getValue(getValue(extended, "c"), 0), "test2"))));
            Assert(isEqual(getValue(getValue(getValue(extended, "c"), 0), "test3"), 3));
            Assert(isEqual(getValue(extended, "d"), "not_undefined"));
            Assert(isEqual(getValue(extended, "e"), null));
            Assert(isEqual(getValue(extended, "other1"), "x"));
            Assert(isEqual(getValue(extended, "other2"), "y"));
            if (isTrue(hasSub))
            {
                Assert(inOp(extended, "sub"));
            }
        }
}
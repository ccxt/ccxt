using System.Globalization;
using System.Net;
using System.Collections.Generic;

namespace ccxt;

using dict = Dictionary<string, object>;

public partial class Exchange
{

    public class BaseCache<T> : List<T>
    {
        // Add any custom properties or methods
        public int? maxSize;

        public int? length;
        public BaseCache(int? maxSixe = null) : base()
        {
            this.maxSize = maxSixe;

        }

        public void clear()
        {
            this.length = 0;
        }
    }

    public class ArrayCache<T> : BaseCache<T>
    {
        // Add any custom properties or methods
        private bool nestedNewUpdatesBySymbol;
        private Dictionary<string, object> newUpdatesBySymbol;
        private Dictionary<string, object> clearUpdatesBySymbol;
        private int allNewUpdates;
        private bool clearAllUpdates;
        public ArrayCache(int? maxSixe = null) : base(maxSixe)
        {

        }

        public int getLimit(object symbol2, object limit2)
        {
            var symbol = symbol2.ToString();
            var limit = (int)limit2;
            int? newUpdatesValue = null;

            if (symbol == null)
            {
                newUpdatesValue = this.allNewUpdates;
                this.clearAllUpdates = true;
            }
            else
            {
                var tempNewUpdates = this.newUpdatesBySymbol[symbol];
                if ((tempNewUpdates != null) && this.nestedNewUpdatesBySymbol)
                {
                    newUpdatesValue = ((HashSet<int>)tempNewUpdates).Count;
                }
                this.clearUpdatesBySymbol[symbol] = true;
            }

            if (newUpdatesValue == null)
            {
                return limit;
            }
            else if (limit != null)
            {
                return Math.Min((int)newUpdatesValue, limit);
            }
            else
            {
                return (int)newUpdatesValue;
            }
        }

        public void append(object item)
        {
            if (this.maxSize != null && this.length == this.maxSize)
            {
                this.RemoveAt(0);
            }
            this.Add((T)item);
            if (this.clearAllUpdates)
            {
                this.clearAllUpdates = false;
                this.clearUpdatesBySymbol = new Dictionary<string, object>();
                this.allNewUpdates = 0;
                this.newUpdatesBySymbol = new Dictionary<string, object>();
            }

            var itemSymbol = Exchange.SafeString(item, "symbol");
            var clearUpdateBySymbol = (this.clearUpdatesBySymbol.ContainsKey(itemSymbol)) ? this.clearUpdatesBySymbol[itemSymbol] : null;
            if (clearUpdateBySymbol != null)
            {
                this.clearUpdatesBySymbol[itemSymbol] = false;
                this.newUpdatesBySymbol[itemSymbol] = 0;
            }
            var defaultValue = (this.newUpdatesBySymbol.ContainsKey(itemSymbol)) ? (int)this.newUpdatesBySymbol[itemSymbol] : 0;
            this.newUpdatesBySymbol[itemSymbol] = defaultValue + 1;
            this.allNewUpdates = this.allNewUpdates + 1;

        }
    }


    public class ArrayCacheByTimestamp<T> : BaseCache<T>
    {
        public Dictionary<string, object> hashmap = new Dictionary<string, object>();
        public HashSet<int> sizeTracker = new HashSet<int>();
        public ArrayCacheByTimestamp(int? maxSixe = null) : base(maxSixe)
        {

        }
    }

}
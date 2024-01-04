using System.Globalization;
using System.Net;
using System.Collections.Generic;
using System.Runtime.ExceptionServices;
namespace ccxt;

using dict = Dictionary<string, object>;

// public partial class Exchange
// {

public partial class Exchange
{
    public static int bisectLeft(IList<decimal> arr, decimal x)
    {
        int low = 0;
        int high = arr.Count - 1;
        while (low <= high)
        {
            int mid = (low + high) / 2;
            if (arr[mid] < x) low = mid + 1;
            else high = mid - 1;
        }
        return low;
    }

}

public class OrderBookSide : SlimConcurrentList<object>
{
    protected readonly object _syncRoot = new object();

    private bool _side = false;

    protected bool side
    {
        get
        {
            lock (_syncRoot)
            {
                return _side;
            }
        }
        set
        {
            lock (_syncRoot)
            {
                _side = value;
            }
        }
    }


    private SlimConcurrentList<decimal> __index = new SlimConcurrentList<decimal>();

    public SlimConcurrentList<decimal> _index
    {
        get
        {
            lock (_syncRoot)
            {
                return __index;
            }
        }
        set
        {
            lock (_syncRoot)
            {
                __index = value;
            }
        }
    }

    // public int Count = 0;

    private int __depth;

    public int _depth
    {
        get
        {
            lock (_syncRoot)
            {
                return __depth;
            }
        }
        set
        {
            lock (_syncRoot)
            {
                __depth = value;
            }
        }
    }

    public OrderBookSide(object deltas2, object depth = null, bool side = false) : base()
    {
        lock (_syncRoot)
        {

            this.side = side;
            this._depth = (depth == null) ? Int32.MaxValue : (int)depth;
            // var deltas = (List<object>)deltas2;
            // for (var i = 0; i < deltas.Count; i++)
            // {
            //     this.storeArray(deltas[i]); // do we need to copy here??
        }
        // }
    }

    public void storeArray(object delta2)
    {
        lock (_syncRoot)
        {
            var delta = (IList<object>)delta2;
            var price = Convert.ToDecimal(delta[0]);
            var amount = Convert.ToDecimal(delta[1]);
            var index_price = (this.side) ? -price : price;
            var index = Exchange.bisectLeft(this._index, index_price);
            if (amount != null && amount != 0)
            { // check this out does not make sense right now we have to consider null amounts?
                if (index < this._index.Count && this._index[index] == index_price)
                {
                    (this[index] as IList<object>)[1] = amount;
                }
                else
                {
                    this._index.Insert(index, index_price);
                    this.Insert(index, delta);
                }
            }
            else if (index < this._index.Count && this._index[index] == index_price)
            {
                this._index.RemoveAt(index);
                this.RemoveAt(index);

            }
        }
    }

    public void store(object price, object amount)
    {
        lock (_syncRoot)
        {
            this.storeArray(new SlimConcurrentList<object> { price, amount });
        }
    }

    public void limit()
    {
        lock (_syncRoot)
        {
            var different = this.Count - this._depth;
            for (var i = 0; i < different; i++)
            {
                var length = this.Count;
                this.RemoveAt(length - 1);
                this._index.RemoveAt(length - 1); // don't use this.Count because it mutates from one line to the other
            }
        }
    }
}


public class NormalOrderBookSide : OrderBookSide
{
    public NormalOrderBookSide(object deltas2, object depth = null, bool side = false) : base(deltas2, depth, side)
    {

        lock (_syncRoot)
        {

            var deltas = (IList<object>)deltas2;
            for (var i = 0; i < deltas.Count; i++)
            {
                this.storeArray(deltas[i]); // do we need to copy here??
            }
        }

    }
}

public class CountedOrderBookSide : OrderBookSide
{

    public CountedOrderBookSide(object deltas2, object depth = null, bool side = false) : base(deltas2, depth, side)
    {

        lock (_syncRoot)
        {

            var deltas = (IList<object>)deltas2;
            for (var i = 0; i < deltas.Count; i++)
            {
                this.storeArray(deltas[i]); // do we need to copy here??
            }
        }
    }

    public void store(object price, object size, object count)
    {
        lock (_syncRoot)
        {
            this.storeArray(new SlimConcurrentList<object> { price, size, count }); // shouldn't be needed but I'm going crazy
        }
    }

    public void storeArray(object deltaArra2)
    {
        lock (_syncRoot)
        {
            var deltaArray = (IList<object>)deltaArra2;
            var price = deltaArray[0];
            var size = Convert.ToDecimal(deltaArray[1]);
            var count = Convert.ToInt32(deltaArray[2]);
            var decimalPrice = Convert.ToDecimal(price);
            var index_price = (this.side) ? -decimalPrice : decimalPrice;
            var index = Exchange.bisectLeft(this._index, index_price);
            if (size != 0 && count != 0)
            {
                if ((index < this._index.Count) && this._index[index] == index_price)
                {
                    var entry = this[index] as IList<object>;
                    entry[1] = size;
                    entry[2] = count;
                }
                else
                {
                    // this._index.InsertRange(index, new List<decimal>() { index_price });
                    this._index.Insert(index, index_price);
                    this.Insert(index, new SlimConcurrentList<object>() { price, size, count });
                }
            }
            else if (index < this._index.Count && this._index[index] == index_price)
            {
                this._index.RemoveAt(index);
                this.RemoveAt(index);
            }
        }
    }
}

public class IndexedOrderBookSide : OrderBookSide
{
    public IDictionary<string, object> hasmap = new CustomConcurrentDictionary<string, object>();
    public IndexedOrderBookSide(object deltas2, object depth = null, bool side = false) : base(deltas2, depth, side)
    {

        lock (_syncRoot)
        {

            var deltas = (IList<object>)deltas2;
            for (var i = 0; i < deltas.Count; i++)
            {
                this.storeArray(deltas[i]); // do we need to copy here??
                                            // check if we need this if here or we can 
            }
        }

    }

    public void storeArray(object delta2)
    {
        lock (_syncRoot)
        {

            var delta = (IList<object>)delta2;
            var price = Convert.ToDecimal(delta[0]);
            var size = Convert.ToDecimal(delta[1]);
            var order_id = delta[2];
            decimal? index_price = -1;
            if (price != 0)
            {
                var decimalPrice = Convert.ToDecimal(price);
                index_price = (this.side) ? -decimalPrice : decimalPrice;
            }
            else
            {
                index_price = null;
            }
            if (size != 0)
            {
                var stringId = order_id.ToString();
                if (this.hasmap.ContainsKey(stringId))
                {
                    var old_price = Convert.ToDecimal(this.hasmap[stringId]);
                    if (index_price != null)
                    {
                        index_price = Convert.ToDecimal(index_price);
                    }
                    else
                    {
                        index_price = old_price;
                    }
                    delta[0] = Math.Abs(Convert.ToDecimal(index_price));

                    if (index_price == old_price)
                    {
                        var index2 = Exchange.bisectLeft(this._index, Convert.ToDecimal(index_price));
                        while (((IList<object>)this[index2])[2] != order_id)
                        {
                            index2++;
                        }
                        this._index[index2] = index_price.Value;
                        this[index2] = delta;
                        return;
                    }
                    else
                    {
                        var old_index = Exchange.bisectLeft(this._index, old_price);
                        while (((IList<object>)this[old_index])[2] != order_id)
                        {
                            old_index++;
                        }
                        this._index.RemoveAt(old_index);
                        this.RemoveAt(old_index);
                    }
                }
                // insert new price Level
                this.hasmap[stringId] = index_price;
                var index = Exchange.bisectLeft(this._index, index_price.Value);
                while (index < this._index.Count && (this._index[index] == index_price) && (Convert.ToDecimal(((IList<object>)this[index])[2])) < Convert.ToDecimal(order_id))
                {
                    index++;
                }
                this._index.Insert(index, index_price.Value);
                this.Insert(index, delta);
            }
            else if (this.hasmap.ContainsKey(order_id.ToString()))
            {
                var old_price2 = Convert.ToDecimal(this.hasmap[order_id.ToString()]);
                var index3 = Exchange.bisectLeft(this._index, old_price2);
                while (((IList<object>)this[index3])[2] != order_id)
                {
                    index3++;
                }
                this._index.RemoveAt(index3);
                this.RemoveAt(index3);
                this.hasmap.Remove(order_id.ToString());
            }
        }
    }

    public void remove_index(object order2)
    {
        lock (_syncRoot)
        {

            var order = (IList<object>)order2;
            var order_id = order[2];
            if (this.hasmap.ContainsKey(order_id.ToString()))
            {
                this.hasmap.Remove(order_id.ToString());
            }
        }
    }

    public void store(object price, object size, object order_id)
    {
        lock (_syncRoot)
        {
            this.storeArray(new SlimConcurrentList<object> { price, size, order_id });
        }
    }

    // public void limit() {
    //     if (this.Count > this._depth) {
    //         FirstChanceExceptionEventArgs ()
    //     }
    // }
}


public class Asks : NormalOrderBookSide
{
    public Asks(object deltas2, object depth = null) : base(deltas2, depth)
    {
        this.side = false;
    }
}

public class Bids : NormalOrderBookSide
{
    public Bids(object deltas2, object depth = null) : base(deltas2, depth, true)
    {
        this.side = true;
    }
}

public class CountedAsks : CountedOrderBookSide
{
    public CountedAsks(object deltas2, object depth = null) : base(deltas2, depth)
    {
        this.side = false;
        // super.side = false;
    }
}

public class CountedBids : CountedOrderBookSide
{
    public CountedBids(object deltas2, object depth = null) : base(deltas2, depth, true)
    {
        this.side = true;
    }
}


public class IndexedAsks : IndexedOrderBookSide
{
    public IndexedAsks(object deltas2, object depth = null) : base(deltas2, depth)
    {
        this.side = false;
    }
}

public class IndexedBids : IndexedOrderBookSide
{
    public IndexedBids(object deltas2, object depth = null) : base(deltas2, depth, true)
    {
        this.side = true;
    }
}

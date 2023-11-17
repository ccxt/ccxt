using System.Globalization;
using System.Net;
using System.Collections.Generic;

namespace ccxt;

using dict = Dictionary<string, object>;

// public partial class Exchange
// {

public partial class Exchange
{
    public static int bisectLeft(List<decimal> arr, decimal x)
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

public class OrderBookSide : List<object>
{
    protected bool side = false;

    public List<decimal> _index = new List<decimal>();

    public int Count = 0;
    public int _depth;

    public object n;

    public OrderBookSide(object deltas2, object depth = null) : base()
    {

        var deltas = (object[])deltas2;
        for (var i = 0; i < deltas.Length; i++)
        {
            this.storeArray(deltas[i]); // do we need to copy here??
        }
    }

    public void storeArray(object delta)
    {
        var price = ((decimal[])delta)[0];
        var amount = ((decimal[])delta)[1];
        var index_price = (this.side) ? -price : price;
        var index = Exchange.bisectLeft(this._index, index_price);
        if (amount != null)
        { // check this out does not make sense right now we have to consider null amounts?
            if (index < this._index.Count && this._index[index] == index_price)
            {
                (this[index] as List<object>)[1] = amount;
            }
            else
            {
                this._index.Insert(index, index_price);
                this.Insert(index, index_price);
            }
        }
        else if (index < this._index.Count && this._index[index] == index_price)
        {
            this._index.RemoveAt(index);
            this.RemoveAt(index);

        }

    }

    public void store(object price, object amount)
    {
        this.storeArray(new object[] { price, amount });
    }

    public void limit()
    {
        var different = this.Count - this._depth;
        for (var i = 0; i < different; i++)
        {
            this.RemoveAt(this.Count - 1);
            this._index.RemoveAt(this.Count - 1);
        }
    }
}

public class CountedOrderBookSide : OrderBookSide
{

    public CountedOrderBookSide(object deltas2, object depth = null) : base(deltas2, depth)
    {
    }

    public void store(object price, object size, object count)
    {
        this.storeArray(new object[] { price, size, count });
    }

    public void storeArray(object deltaArra2)
    {
        var deltaArray = (object[])deltaArra2;
        var price = deltaArray[0];
        var size = deltaArray[1];
        var count = deltaArray[2];
        var index_price = (this.side) ? -(decimal)price : (decimal)price;
        var index = Exchange.bisectLeft(this._index, index_price);
        if (size != null && count != null)
        {
            if (this._index[index] == index_price)
            {
                var entry = this[index] as List<object>;
                entry[1] = size;
                entry[2] = count;
            }
            else
            {
                this._index.InsertRange(index, new List<decimal>() { index_price });
                this.InsertRange(index, new List<object>() { price, size, count });
            }
        }
        else if (index < this._index.Count && this._index[index] == index_price)
        {
            this._index.RemoveAt(index);
            this.RemoveAt(index);
        }
    }
}

public class IndexedOrderBookSide : OrderBookSide
{
    public Dictionary<string, object> hasmap = new Dictionary<string, object>();
    public IndexedOrderBookSide(object deltas2, object depth = null) : base(deltas2, depth)
    {
    }

    public void storedArray(object delta2)
    {
        var delta = (object[])delta2;
        var price = delta[0];
        var size = delta[1];
        var order_id = delta[2];
        decimal? index_price = -1;
        if (price != null)
        {
            index_price = (this.side) ? -(decimal)price : (decimal)price;
        }
        else
        {
            index_price = null;
        }
        if (size != null)
        {
            var stringId = order_id.ToString();
            if (this.hasmap.ContainsKey(stringId))
            {
                var old_price = (decimal)this.hasmap[stringId];
                if (index_price != null)
                {
                    index_price = (decimal)old_price;
                }
                delta[0] = Math.Abs((decimal)index_price);

                if (index_price == old_price)
                {
                    var index2 = Exchange.bisectLeft(this._index, (decimal)index_price);
                    while (((List<object>)this[index2])[2] != order_id)
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
                    while (((List<object>)this[old_index])[2] != order_id)
                    {
                        old_index++;
                    }
                    this._index.RemoveAt(old_index);
                    this.RemoveAt(old_index);
                }
                // insert new price Level
                this.hasmap[stringId] = index_price;
                var index = Exchange.bisectLeft(this._index, (decimal)index_price);
                while (index < this._index.Count && (this._index[index] == index_price) && ((decimal)((List<object>)this[index])[2]) < (decimal)order_id)
                {
                    index++;
                }
                this._index.Insert(index, (decimal)index_price);
                this.Insert(index, delta);
            }
        }
        else if (this.hasmap.ContainsKey(order_id.ToString()))
        {
            var old_price2 = (decimal)this.hasmap[order_id.ToString()];
            var index3 = Exchange.bisectLeft(this._index, old_price2);
            while (((List<object>)this[index3])[2] != order_id)
            {
                index3++;
            }
            this._index.RemoveAt(index3);
            this.RemoveAt(index3);
            this.hasmap.Remove(order_id.ToString());
        }
    }

    public void remove_index(object order2)
    {
        var order = (object[])order2;
        var order_id = order[2];
        if (this.hasmap.ContainsKey(order_id.ToString()))
        {
            this.hasmap.Remove(order_id.ToString());
        }
    }

    public void store(object price, object size, object order_id)
    {
        this.storedArray(new object[] { price, size, order_id });
    }
}


public class Asks : OrderBookSide
{
    public Asks(object deltas2, object depth = null) : base(deltas2, depth)
    {
        this.side = false;
    }
}

public class Bids : OrderBookSide
{
    public Bids(object deltas2, object depth = null) : base(deltas2, depth)
    {
        this.side = true;
    }
}

public class CountedAsks : CountedOrderBookSide
{
    public CountedAsks(object deltas2, object depth = null) : base(deltas2, depth)
    {
        this.side = false;
    }
}

public class CountedBids : CountedOrderBookSide
{
    public CountedBids(object deltas2, object depth = null) : base(deltas2, depth)
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
    public IndexedBids(object deltas2, object depth = null) : base(deltas2, depth)
    {
        this.side = true;
    }
}

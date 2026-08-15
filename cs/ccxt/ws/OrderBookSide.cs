namespace ccxt.pro;

// public partial class Exchange : ccxt.Exchange
// {
//     public static int bisectLeft(IList<decimal> arr, decimal x)
//     {
//         int low = 0;
//         int high = arr.Count - 1;
//         while (low <= high)
//         {
//             int mid = (low + high) / 2;
//             if (arr[mid] < x) low = mid + 1;
//             else high = mid - 1;
//         }
//         return low;
//     }

// }

public interface IOrderBookSide : IList<object>
{
    void store(object price, object size);
    void storeArray(object delta);
    void limit();
    void store(object price, object size, object order_id);
    IOrderBookSide Copy();
}


public class OrderBookSide : SlimConcurrentList<object>, IOrderBookSide
{
    protected readonly object _syncRoot = new object();

    // A two-side snapshot (OrderBook.Copy) cannot be made atomic by the book's
    // own _syncRoot: every mutator here guards the *side's* monitor instead, so
    // the book lock excludes nothing and a ws delta can land between the two
    // side copies. Expose the monitor to the rest of the assembly so Copy() can
    // hold both sides for the whole snapshot, rather than widening the field
    // itself or adding a second lock to the storeArray hot path.
    internal object SyncRoot
    {
        get { return _syncRoot; }
    }

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

    // perf: the IList<decimal> overload above enters/exits SlimConcurrentList's
    // ReaderWriterLockSlim once for Count plus once per ~log2(n) probe. When the
    // argument is statically known to be a SlimConcurrentList<decimal> (which every
    // in-repo call site is, since _index is one) this overload runs the identical
    // binary search under a SINGLE read lock. The IList<decimal> signature above is
    // public API and is deliberately left untouched.
    public static int bisectLeft(SlimConcurrentList<decimal> arr, decimal x)
    {
        return arr.BisectLeft(x);
    }

    // perf: bisect + the `index < _index.Count && _index[index] == x` hit test that
    // every caller runs immediately afterwards, fused into ONE read lock instead of
    // three. `hit` is by construction exactly that expression: Comparer<decimal>.
    // Default.Compare is decimal.Compare, i.e. the same value-based (scale-ignoring)
    // comparison as decimal's == and < operators, so tie-breaking is unchanged.
    public static int bisectLeft(SlimConcurrentList<decimal> arr, decimal x, out bool hit)
    {
        return arr.BisectLeft(x, out hit);
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
            this._depth = (depth == null) ? Int32.MaxValue : Convert.ToInt32(depth);
            // var deltas = (List<object>)deltas2;
            // for (var i = 0; i < deltas.Count; i++)
            // {
            //     this.storeArray(deltas[i]); // do we need to copy here??
            // }
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
            // perf: we already hold _syncRoot, and both the `side` and `_index`
            // property accessors lock that very same object, so each extra read below
            // was a pure recursive Monitor re-entry returning an identical value
            // (nothing can reassign either one without also holding _syncRoot).
            // Hoisting them into locals removes those re-entries without touching
            // lock ordering or observable behaviour.
            var sideLocal = this.side;
            var type = (sideLocal) ? "bid" : "ask";
            // if (amount == 0)
            // {
            //     Console.WriteLine($"[{type}]Will deleteeeeee {price} {amount}");

            // }
            // else
            // {
            //     Console.WriteLine($"[{type}] Will store {price} {amount}");

            // }
            // debug
            var index_price = (sideLocal) ? -price : price;
            var indexList = this._index;
            // perf: `hit` is exactly `index < indexList.Count && indexList[index] == index_price`,
            // computed under the same single read lock as the bisect itself. Nothing can
            // mutate _index in between anyway: every writer holds _syncRoot, which we hold.
            var index = bisectLeft(indexList, index_price, out var hit);
            if (amount != 0)
            { // check this out does not make sense right now we have to consider null amounts?
                if (hit)
                {
                    (this[index] as IList<object>)[1] = amount;
                }
                else
                {
                    indexList.Insert(index, index_price);
                    this.Insert(index, delta);
                }
            }
            else if (hit)
            {
                indexList.RemoveAt(index);
                this.RemoveAt(index);

            }
        }
        // check if there are duplicated prices in the ob
        // for (var i = 0; i < this._index.Count - 1; i++)
        // {
        //     if (this._index[i] == this._index[i + 1])
        //     {
        //         Console.WriteLine($"Duplicated price on index {this._index[i]}");
        //     }
        //     if (this[i] == this[i + 1])
        //     {
        //         Console.WriteLine($"Duplicated price{this._index[i]}");
        //     }

        //     if (this.side && this._index[i] < this._index[i + 1]) // bids
        //     {
        //         Console.WriteLine($"bids order on index {this._index[i]}");
        //     }
        //     if (this.side && Convert.ToDouble(this[i]) < Convert.ToDouble(this[i + 1]))
        //     {
        //         Console.WriteLine($"bids order on index {this._index[i]}");
        //     }
        //     if (!this.side && this._index[i] > this._index[i + 1])
        //     {
        //         Console.WriteLine($"Wrong order on index {this._index[i]}");
        //     }
        //     if (!this.side && Convert.ToDouble(this[i]) > Convert.ToDouble(this[i + 1]))
        //     {
        //         Console.WriteLine($"Asks Wrong order on index {this._index[i]}");
        //     }

        // }
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
            var indexList = this._index; // perf: hoist the recursive-lock property read out of the loop
            for (var i = 0; i < different; i++)
            {
                var length = this.Count;
                this.RemoveAt(length - 1);
                indexList.RemoveAt(length - 1); // don't use this.Count because it mutates from one line to the other
            }
        }
    }

    public void store(object price, object size, object order_id)
    {
        lock (_syncRoot)
        {
            // default implementation, not used on this mode
            this.storeArray(new SlimConcurrentList<object> { price, size });
        }
    }

    public IOrderBookSide Copy()
    {
        lock (_syncRoot)
        {

            var copy = new OrderBookSide(this);
            // return copy.ToList() as IOrderBookSide;
            return copy;
        }
    }
}


public class NormalOrderBookSide : OrderBookSide, IOrderBookSide
{
    public NormalOrderBookSide(object deltas2, object depth = null, bool side = false) : base(deltas2, depth, side)
    {

        lock (_syncRoot)
        {

            var deltas = (IList<object>)deltas2;
            var copiedDeltas = new List<object>(deltas);
            for (var i = 0; i < copiedDeltas.Count; i++)
            {
                var delta = copiedDeltas[i] as IList<object>;
                this.storeArray(new List<object>(delta)); // do we need to copy here??
            }
        }
    }

    public IOrderBookSide Copy()
    {
        lock (_syncRoot)
        {

            var copy = new NormalOrderBookSide(this);
            return copy;
        }
    }
}

public class CountedOrderBookSide : OrderBookSide, IOrderBookSide
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

    public IOrderBookSide Copy()
    {
        lock (_syncRoot)
        {

            var copy = new CountedOrderBookSide(this);
            return copy;
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
            // var count = Convert.ToInt32(deltaArray[2]);
            int count = -1;
            var countObject = deltaArray[2];
            if (!(countObject is IList<object> || countObject is IDictionary<string, object>))
            {
                countObject = Convert.ToInt32(countObject);
                count = Convert.ToInt32(countObject);
            }
            // object storedCount = countObject;
            // int intCount = -1;
            // int.TryParse(storedCount.ToString(), out intCount);
            // if (intCount != -1)
            // {
            //     storedCount = intCount;
            // }
            // int.TryParse(deltaArray[2].ToString(), out count);
            var decimalPrice = Convert.ToDecimal(price);
            // perf: hoist the `side` / `_index` property reads (both re-enter the
            // _syncRoot Monitor we already hold) into locals, see OrderBookSide.storeArray
            var sideLocal = this.side;
            var indexList = this._index;
            var index_price = (sideLocal) ? -decimalPrice : decimalPrice;
            var index = bisectLeft(indexList, index_price, out var hit); // see OrderBookSide.storeArray
            if (size != 0 && countObject != null && count != 0)
            {

                if (hit)
                {

                    var entry = this[index] as IList<object>;
                    entry[1] = size;
                    entry[2] = countObject;
                }
                else
                {
                    // this._index.InsertRange(index, new List<decimal>() { index_price });
                    indexList.Insert(index, index_price);
                    this.Insert(index, new SlimConcurrentList<object>() { price, size, countObject });
                }
            }
            else if (hit)
            {
                indexList.RemoveAt(index);
                this.RemoveAt(index);
            }
        }
    }
}

public class IndexedOrderBookSide : OrderBookSide, IOrderBookSide
{
    public IDictionary<string, object> hashmap = new CustomConcurrentDictionary<string, object>();
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

    public IOrderBookSide Copy()
    {
        lock (_syncRoot)
        {

            var copy = new IndexedOrderBookSide(this);
            return copy;
        }
    }

    // ids arrive as freshly boxed references on every parsed ws message, so the
    // former reference-inequality walks (row[2] != order_id) never matched an
    // existing row and ran off the end of the list with an
    // ArgumentOutOfRangeException on every update or delete of a known id; the
    // hashmap already keys by ToString(), the row walks must match it, and the
    // walk must stop at Count so a stale hashmap entry degrades gracefully
    // instead of throwing, see https://github.com/ccxt/ccxt/pull/29745
    private int findRowById(int start, string orderId)
    {
        var index = start;
        while (index < this.Count)
        {
            var row = (IList<object>)this[index];
            if (row.Count > 2 && row[2]?.ToString() == orderId)
            {
                return index;
            }
            index++;
        }
        return -1;
    }

    // the inherited limit() trims rows but left their ids behind in the
    // hashmap, and every later touch of a trimmed id then walked off the list;
    // mirror the python remove_index hook, which existed here but had no
    // caller, see https://github.com/ccxt/ccxt/pull/29745
    public new void limit()
    {
        lock (_syncRoot)
        {
            var different = this.Count - this._depth;
            var indexList = this._index; // perf: hoist the recursive-lock property read out of the loop
            for (var i = 0; i < different; i++)
            {
                var length = this.Count;
                this.remove_index(this[length - 1]);
                this.RemoveAt(length - 1);
                indexList.RemoveAt(length - 1); // don't use this.Count because it mutates from one line to the other
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
            // perf: hoist the `side` / `_index` property reads (both re-enter the
            // _syncRoot Monitor we already hold) into locals, see OrderBookSide.storeArray
            var sideLocal = this.side;
            var indexList = this._index;
            decimal? index_price = -1;
            if (price != 0)
            {
                var decimalPrice = Convert.ToDecimal(price);
                index_price = (sideLocal) ? -decimalPrice : decimalPrice;
            }
            else
            {
                index_price = null;
            }
            if (size != 0)
            {
                var stringId = order_id.ToString();
                if (this.hashmap.ContainsKey(stringId))
                {
                    var old_price = Convert.ToDecimal(this.hashmap[stringId]);
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
                        var index2 = this.findRowById(bisectLeft(indexList, Convert.ToDecimal(index_price)), stringId);
                        if (index2 >= 0)
                        {
                            indexList[index2] = index_price.Value;
                            this[index2] = delta;
                            return;
                        }
                        // stale hashmap entry, the row is gone (e.g. trimmed by
                        // limit before this fix): fall through and insert as new,
                        // see https://github.com/ccxt/ccxt/pull/29745
                    }
                    else
                    {
                        var old_index = this.findRowById(bisectLeft(indexList, old_price), stringId);
                        if (old_index >= 0)
                        {
                            indexList.RemoveAt(old_index);
                            this.RemoveAt(old_index);
                        }
                        // stale entry: nothing to move, fall through and insert as new
                    }
                }
                // insert new price Level
                this.hashmap[stringId] = index_price;
                var indexPriceValue = new decimal(-1);
                if (index_price != null)
                {
                    indexPriceValue = index_price.Value;
                }
                var index = bisectLeft(indexList, indexPriceValue);
                // var index2Val = ((IList<object>)this[index])[2];
                // index might be a stringified number like '1' or an id like '11AABB'
                // perf: indexList.Count is loop-invariant here (the body only advances
                // `index` and reads rows), so hoist its lock out of the loop. The
                // `indexList[index] == index_price` test is deliberately NOT fused into
                // the bisect: index_price is a `decimal?` and may be null here, where the
                // lifted == yields false; the fused decimal hit test cannot express that.
                var indexCount = indexList.Count;
                while (index < indexCount && (indexList[index] == index_price) && this.isOrderIsBigger(order_id, index))
                {
                    index++;
                }
                indexList.Insert(index, indexPriceValue);
                this.Insert(index, delta);
            }
            else if (this.hashmap.ContainsKey(order_id.ToString()))
            {
                var stringId2 = order_id.ToString();
                var old_price2 = Convert.ToDecimal(this.hashmap[stringId2]);
                var index3 = this.findRowById(bisectLeft(indexList, old_price2), stringId2);
                if (index3 >= 0)
                {
                    indexList.RemoveAt(index3);
                    this.RemoveAt(index3);
                }
                // a stale entry has no row to remove, just heal the hashmap,
                // see https://github.com/ccxt/ccxt/pull/29745
                this.hashmap.Remove(stringId2);
            }
        }
    }

    private bool isOrderIsBigger(object orderId, int index)
    {
        // index might be a stringified number like '1' or an id like '11AABB'
        var index2Val = ((IList<object>)this[index])[2];
        try
        {
            // Try converting both to decimal
            decimal orderIdDecimal = Convert.ToDecimal(orderId);
            decimal indexDecimal = Convert.ToDecimal(index2Val);
            return orderIdDecimal > indexDecimal;
        }
        catch
        {
            // Fall back to string comparison if decimal conversion fails
            string orderIdStr = orderId?.ToString() ?? "";
            string indexStr = index2Val?.ToString() ?? "";
            return string.Compare(orderIdStr, indexStr, StringComparison.Ordinal) > 0;
        }
    }

    public void remove_index(object order2)
    {
        lock (_syncRoot)
        {

            var order = (IList<object>)order2;
            var order_id = order[2];
            if (this.hashmap.ContainsKey(order_id.ToString()))
            {
                this.hashmap.Remove(order_id.ToString());
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


public interface IAsks : IOrderBookSide
{
    public IAsks Copy();

}

public interface IBids : IOrderBookSide
{
    public IBids Copy();

}

public class Asks : NormalOrderBookSide, IAsks
{
    public Asks(object deltas2, object depth = null) : base(deltas2, depth)
    {
        this.side = false;
    }

    public IAsks Copy()
    {
        lock (_syncRoot)
        {

            var copy = new Asks(this.ToList());
            return copy;
        }
    }
}

public class Bids : NormalOrderBookSide, IBids
{
    public Bids(object deltas2, object depth = null) : base(deltas2, depth, true)
    {
        this.side = true;
    }

    public IBids Copy()
    {
        lock (_syncRoot)
        {

            var copy = new Bids(this);
            return copy;
        }
    }
}

public class CountedAsks : CountedOrderBookSide, IAsks
{
    public CountedAsks(object deltas2, object depth = null) : base(deltas2, depth)
    {
        this.side = false;
        // super.side = false;
    }

    public IAsks Copy()
    {
        lock (_syncRoot)
        {

            var copy = new CountedAsks(this);
            return copy;
        }
    }
}

public class CountedBids : CountedOrderBookSide, IBids
{
    public CountedBids(object deltas2, object depth = null) : base(deltas2, depth, true)
    {
        this.side = true;
    }

    public IBids Copy()
    {
        lock (_syncRoot)
        {

            var copy = new CountedBids(this);
            return copy;
        }
    }
}


public class IndexedAsks : IndexedOrderBookSide, IAsks
{
    public IndexedAsks(object deltas2, object depth = null) : base(deltas2, depth)
    {
        this.side = false;
    }

    public IAsks Copy()
    {
        lock (_syncRoot)
        {

            var copy = new IndexedAsks(this);
            return copy;
        }
    }
}

public class IndexedBids : IndexedOrderBookSide, IBids
{
    public IndexedBids(object deltas2, object depth = null) : base(deltas2, depth, true)
    {
        this.side = true;
    }

    public IBids Copy()
    {
        lock (_syncRoot)
        {

            var copy = new IndexedBids(this);
            return copy;
        }
    }
}

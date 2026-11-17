using System.Collections;

// Single-owner list. Every mutator runs on the client's receive loop (the thread that
// feeds this structure); no member here takes a lock. Readers that are not on that loop
// use ToArray(), which returns the immutable snapshot the owner last published, so a
// reader keeps enumerating a stable array while the owner appends.

namespace ccxt.pro;
/// <summary>
/// Strongly typed list with exactly one writer: the ws receive loop of the client that
/// owns it. Owner-side use is the inherited List&lt;T&gt; surface; readers off the loop go
/// through <see cref="ToArray"/>, which returns the last <see cref="Publish"/>ed snapshot
/// instead of the live contents.
/// </summary>
/// <typeparam name="T">The type of elements in the list.</typeparam>
public class SlimConcurrentList<T> : List<T>, IReadOnlyList<T>, IReadOnlyCollection<T>, IDisposable
{
    private T[] _published = Array.Empty<T>();

    /// <summary>
    /// Owner-side publication point: freezes the current contents into the array that
    /// readers off the loop observe. That array is never mutated afterwards.
    /// </summary>
    public virtual void Publish()
    {
        this.Published = base.ToArray();
    }

    /// <summary>
    /// The immutable view for readers that are not on the owner loop. Replaced wholesale
    /// by <see cref="Publish"/>, never edited in place.
    /// </summary>
    public T[] Published
    {
        get { return _published; }
        set { _published = value ?? Array.Empty<T>(); }
    }

    /// <summary>
    /// Snapshot of the list for callers outside the owner loop. Owner-side code that needs
    /// the live contents keeps using the inherited List&lt;T&gt; members.
    /// </summary>
    public new T[] ToArray()
    {
        return _published;
    }

    /// <summary>
    /// Live copy of the array, for owner-side code that is freezing the whole list anyway
    /// (building a book snapshot) and therefore must not read a stale publication.
    /// </summary>
    internal T[] LiveArray()
    {
        return base.ToArray();
    }

    /// <summary>
    /// Bisect-left over the live list (owner side), fused with the "is the found slot an
    /// exact hit?" test that every caller runs straight afterwards.
    /// </summary>
    public int BisectLeft(T value, IComparer<T> comparer = null)
    {
        bool found;
        return this.BisectLeft(value, out found, comparer);
    }

    /// <summary>Bisect-left plus the exact-hit test, in one pass over the live list.</summary>
    public int BisectLeft(T value, out bool found, IComparer<T> comparer = null)
    {
        int count = this.Count;
        int low = 0;
        int high = count - 1;
        if (comparer == null)
        {
            while (low <= high)
            {
                int mid = (low + high) / 2;
                if (Comparer<T>.Default.Compare(this[mid], value) < 0) low = mid + 1;
                else high = mid - 1;
            }
            found = low < count && Comparer<T>.Default.Compare(this[low], value) == 0;
        }
        else
        {
            while (low <= high)
            {
                int mid = (low + high) / 2;
                if (comparer.Compare(this[mid], value) < 0) low = mid + 1;
                else high = mid - 1;
            }
            found = low < count && comparer.Compare(this[low], value) == 0;
        }
        return low;
    }

    /// <summary>Searches for the first element that matches the predicate, on the loop.</summary>
    public new T Find(Predicate<T> match)
    {
        return base.Find(match);
    }

    /// <summary>Compatibility shim: the list holds no disposable state any more.</summary>
    public void Dispose()
    {
    }
}

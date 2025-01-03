using System;
using System.Collections.Generic;

namespace Org.BouncyCastle.Utilities.Collections
{
    internal sealed class StoreImpl<T>
        : IStore<T>
    {
        private readonly List<T> m_contents;

        internal StoreImpl(IEnumerable<T> e)
        {
            m_contents = new List<T>(e);
        }

        IEnumerable<T> IStore<T>.EnumerateMatches(ISelector<T> selector)
        {
            foreach (T candidate in m_contents)
            {
                if (selector == null || selector.Match(candidate))
                    yield return candidate;
            }
        }
    }
}

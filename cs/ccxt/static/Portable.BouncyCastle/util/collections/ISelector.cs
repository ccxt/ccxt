using System;

namespace Org.BouncyCastle.Utilities.Collections
{
    /// <summary>Interface for matching objects in an <see cref="IStore{T}"/>.</summary>
    /// <typeparam name="T">The contravariant type of selectable objects.</typeparam>
    public interface ISelector<in T>
        : ICloneable
    {
        /// <summary>Match the passed in object, returning true if it would be selected by this selector, false
        /// otherwise.</summary>
        /// <param name="candidate">The object to be matched.</param>
        /// <returns><code>true</code> if the objects is matched by this selector, false otherwise.</returns>
        bool Match(T candidate);
    }
}

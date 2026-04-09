using System;
using System.Collections.Generic;

namespace Org.BouncyCastle.Utilities.Collections
{
    internal abstract class ReadOnlyDictionary<K, V>
        : IDictionary<K, V>
    {
        public V this[K key]
        {
            get { return Lookup(key); }
            set { throw new NotSupportedException(); }
        }

        System.Collections.IEnumerator System.Collections.IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }

        public bool IsReadOnly => true;

        public void Add(K key, V value) => throw new NotSupportedException();
        public void Add(KeyValuePair<K, V> item) => throw new NotSupportedException();
        public void Clear() => throw new NotSupportedException();
        public bool Remove(K key) => throw new NotSupportedException();
        public bool Remove(KeyValuePair<K, V> item) => throw new NotSupportedException();

        public abstract bool Contains(KeyValuePair<K, V> item);
        public abstract bool ContainsKey(K key);
        public abstract void CopyTo(KeyValuePair<K, V>[] array, int arrayIndex);
        public abstract int Count { get; }
        public abstract IEnumerator<KeyValuePair<K, V>> GetEnumerator();
        public abstract ICollection<K> Keys { get; }
        public abstract bool TryGetValue(K key, out V value);
        public abstract ICollection<V> Values { get; }

        protected abstract V Lookup(K key);
    }

    internal class ReadOnlyDictionaryProxy<K, V>
        : ReadOnlyDictionary<K, V>
    {
        private readonly IDictionary<K, V> m_target;

        internal ReadOnlyDictionaryProxy(IDictionary<K, V> target)
        {
            if (target == null)
                throw new ArgumentNullException(nameof(target));

            m_target = target;
        }

        public override bool Contains(KeyValuePair<K, V> item) => m_target.Contains(item);
        public override bool ContainsKey(K key) => m_target.ContainsKey(key);
        public override void CopyTo(KeyValuePair<K, V>[] array, int arrayIndex) => m_target.CopyTo(array, arrayIndex);
        public override int Count => m_target.Count;
        public override IEnumerator<KeyValuePair<K, V>> GetEnumerator() => m_target.GetEnumerator();
        public override ICollection<K> Keys => new ReadOnlyCollectionProxy<K>(m_target.Keys);
        public override bool TryGetValue(K key, out V value) => m_target.TryGetValue(key, out value);
        public override ICollection<V> Values => new ReadOnlyCollectionProxy<V>(m_target.Values);

        protected override V Lookup(K key) => m_target[key];
    }
}

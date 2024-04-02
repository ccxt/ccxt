using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;

using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.Collections;

namespace Org.BouncyCastle.Bcpg.OpenPgp
{
	/// <remarks>
	/// Often a PGP key ring file is made up of a succession of master/sub-key key rings.
	/// If you want to read an entire secret key file in one hit this is the class for you.
	/// </remarks>
    public class PgpSecretKeyRingBundle
    {
        private readonly IDictionary<long, PgpSecretKeyRing> m_secretRings;
        private readonly IList<long> m_order;

		private PgpSecretKeyRingBundle(IDictionary<long, PgpSecretKeyRing> secretRings, IList<long> order)
        {
            m_secretRings = secretRings;
            m_order = order;
        }

		public PgpSecretKeyRingBundle(byte[] encoding)
            : this(new MemoryStream(encoding, false))
		{
        }

		/// <summary>Build a PgpSecretKeyRingBundle from the passed in input stream.</summary>
		/// <param name="inputStream">Input stream containing data.</param>
		/// <exception cref="IOException">If a problem parsing the stream occurs.</exception>
		/// <exception cref="PgpException">If an object is encountered which isn't a PgpSecretKeyRing.</exception>
		public PgpSecretKeyRingBundle(Stream inputStream)
			: this(new PgpObjectFactory(inputStream).AllPgpObjects())
        {
        }

		public PgpSecretKeyRingBundle(IEnumerable<PgpObject> e)
        {
			m_secretRings = new Dictionary<long, PgpSecretKeyRing>();
			m_order = new List<long>();

			foreach (var obj in e)
			{
                // Marker packets must be ignored
                if (obj is PgpMarker)
                    continue;

                if (!(obj is PgpSecretKeyRing pgpSecret))
					throw new PgpException(Platform.GetTypeName(obj) + " found where PgpSecretKeyRing expected");

				long key = pgpSecret.GetPublicKey().KeyId;
				m_secretRings.Add(key, pgpSecret);
				m_order.Add(key);
			}
        }

		/// <summary>Return the number of rings in this collection.</summary>
		public int Count
        {
			get { return m_order.Count; }
        }

		/// <summary>Allow enumeration of the secret key rings making up this collection.</summary>
		public IEnumerable<PgpSecretKeyRing> GetKeyRings()
        {
            return CollectionUtilities.Proxy(m_secretRings.Values);
        }

		/// <summary>Allow enumeration of the key rings associated with the passed in userId.</summary>
		/// <param name="userId">The user ID to be matched.</param>
		/// <returns>An <c>IEnumerable</c> of key rings which matched (possibly none).</returns>
		public IEnumerable<PgpSecretKeyRing> GetKeyRings(string userId)
		{
			return GetKeyRings(userId, false, false);
		}

		/// <summary>Allow enumeration of the key rings associated with the passed in userId.</summary>
		/// <param name="userId">The user ID to be matched.</param>
		/// <param name="matchPartial">If true, userId need only be a substring of an actual ID string to match.</param>
		/// <returns>An <c>IEnumerable</c> of key rings which matched (possibly none).</returns>
		public IEnumerable<PgpSecretKeyRing> GetKeyRings(string userId, bool matchPartial)
        {
			return GetKeyRings(userId, matchPartial, false);
        }

		/// <summary>Allow enumeration of the key rings associated with the passed in userId.</summary>
		/// <param name="userID">The user ID to be matched.</param>
		/// <param name="matchPartial">If true, userId need only be a substring of an actual ID string to match.</param>
		/// <param name="ignoreCase">If true, case is ignored in user ID comparisons.</param>
		/// <returns>An <c>IEnumerable</c> of key rings which matched (possibly none).</returns>
		public IEnumerable<PgpSecretKeyRing> GetKeyRings(string userID, bool matchPartial, bool ignoreCase)
		{
			var compareInfo = CultureInfo.InvariantCulture.CompareInfo;
			var compareOptions = ignoreCase ? CompareOptions.OrdinalIgnoreCase : CompareOptions.Ordinal;

			foreach (PgpSecretKeyRing secRing in GetKeyRings())
			{
				foreach (string nextUserID in secRing.GetSecretKey().UserIds)
				{
					if (matchPartial)
					{
						if (compareInfo.IndexOf(nextUserID, userID, compareOptions) >= 0)
							yield return secRing;
					}
					else
					{
						if (compareInfo.Compare(nextUserID, userID, compareOptions) == 0)
							yield return secRing;
					}
				}
			}
		}

		/// <summary>Return the PGP secret key associated with the given key id.</summary>
		/// <param name="keyId">The ID of the secret key to return.</param>
		public PgpSecretKey GetSecretKey(long keyId)
        {
            foreach (PgpSecretKeyRing secRing in GetKeyRings())
            {
                PgpSecretKey sec = secRing.GetSecretKey(keyId);
				if (sec != null)
                    return sec;
            }

            return null;
        }

		/// <summary>Return the secret key ring which contains the key referred to by keyId</summary>
		/// <param name="keyId">The ID of the secret key</param>
		public PgpSecretKeyRing GetSecretKeyRing(long keyId)
        {
			if (m_secretRings.TryGetValue(keyId, out var keyRing))
				return keyRing;

			foreach (PgpSecretKeyRing secretRing in GetKeyRings())
            {
                if (secretRing.GetSecretKey(keyId) != null)
                    return secretRing;
            }

            return null;
        }

		/// <summary>
		/// Return true if a key matching the passed in key ID is present, false otherwise.
		/// </summary>
		/// <param name="keyID">key ID to look for.</param>
		public bool Contains(long keyID)
		{
			return GetSecretKey(keyID) != null;
		}

		public byte[] GetEncoded()
        {
            MemoryStream bOut = new MemoryStream();
			Encode(bOut);
			return bOut.ToArray();
        }

		public void Encode(Stream outStr)
        {
			BcpgOutputStream bcpgOut = BcpgOutputStream.Wrap(outStr);

			foreach (long key in m_order)
            {
				m_secretRings[key].Encode(bcpgOut);
            }
        }

		/// <summary>
		/// Return a new bundle containing the contents of the passed in bundle and
		/// the passed in secret key ring.
		/// </summary>
		/// <param name="bundle">The <c>PgpSecretKeyRingBundle</c> the key ring is to be added to.</param>
		/// <param name="secretKeyRing">The key ring to be added.</param>
		/// <returns>A new <c>PgpSecretKeyRingBundle</c> merging the current one with the passed in key ring.</returns>
		/// <exception cref="ArgumentException">If the keyId for the passed in key ring is already present.</exception>
        public static PgpSecretKeyRingBundle AddSecretKeyRing(PgpSecretKeyRingBundle bundle,
            PgpSecretKeyRing secretKeyRing)
        {
            long key = secretKeyRing.GetPublicKey().KeyId;

            if (bundle.m_secretRings.ContainsKey(key))
                throw new ArgumentException("Collection already contains a key with a keyId for the passed in ring.");

			var newSecretRings = new Dictionary<long, PgpSecretKeyRing>(bundle.m_secretRings);
			var newOrder = new List<long>(bundle.m_order);

            newSecretRings[key] = secretKeyRing;
            newOrder.Add(key);

            return new PgpSecretKeyRingBundle(newSecretRings, newOrder);
        }

		/// <summary>
		/// Return a new bundle containing the contents of the passed in bundle with
		/// the passed in secret key ring removed.
		/// </summary>
		/// <param name="bundle">The <c>PgpSecretKeyRingBundle</c> the key ring is to be removed from.</param>
		/// <param name="secretKeyRing">The key ring to be removed.</param>
		/// <returns>A new <c>PgpSecretKeyRingBundle</c> not containing the passed in key ring.</returns>
		/// <exception cref="ArgumentException">If the keyId for the passed in key ring is not present.</exception>
        public static PgpSecretKeyRingBundle RemoveSecretKeyRing(PgpSecretKeyRingBundle bundle,
            PgpSecretKeyRing secretKeyRing)
        {
            long key = secretKeyRing.GetPublicKey().KeyId;

			if (!bundle.m_secretRings.ContainsKey(key))
                throw new ArgumentException("Collection does not contain a key with a keyId for the passed in ring.");

			var newSecretRings = new Dictionary<long, PgpSecretKeyRing>(bundle.m_secretRings);
			var newOrder = new List<long>(bundle.m_order);

			newSecretRings.Remove(key);
			newOrder.Remove(key);

			return new PgpSecretKeyRingBundle(newSecretRings, newOrder);
        }
    }
}

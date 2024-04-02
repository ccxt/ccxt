using System;

using Org.BouncyCastle.Utilities.Collections;

namespace Org.BouncyCastle.X509.Store
{
	/// <remarks>
	/// This class is an <code>IX509Selector</code> implementation to select
	/// certificate pairs, which are e.g. used for cross certificates. The set of
	/// criteria is given from two <code>X509CertStoreSelector</code> objects,
	/// each of which, if present, must match the respective component of a pair.
	/// </remarks>
	public class X509CertPairStoreSelector
		: ISelector<X509CertificatePair>
	{
		private static X509CertStoreSelector CloneSelector(
			X509CertStoreSelector s)
		{
			return s == null ? null : (X509CertStoreSelector) s.Clone();
		}

		private X509CertificatePair certPair;
		private X509CertStoreSelector forwardSelector;
		private X509CertStoreSelector reverseSelector;

		public X509CertPairStoreSelector()
		{
		}

		private X509CertPairStoreSelector(
			X509CertPairStoreSelector o)
		{
			this.certPair = o.CertPair;
			this.forwardSelector = o.ForwardSelector;
			this.reverseSelector = o.ReverseSelector;
		}

		/// <summary>The certificate pair which is used for testing on equality.</summary>
		public X509CertificatePair CertPair
		{
			get { return certPair; }
			set { this.certPair = value; }
		}

		/// <summary>The certificate selector for the forward part.</summary>
		public X509CertStoreSelector ForwardSelector
		{
			get { return CloneSelector(forwardSelector); }
			set { this.forwardSelector = CloneSelector(value); }
		}

		/// <summary>The certificate selector for the reverse part.</summary>
		public X509CertStoreSelector ReverseSelector
		{
			get { return CloneSelector(reverseSelector); }
			set { this.reverseSelector = CloneSelector(value); }
		}

		/// <summary>
		/// Decides if the given certificate pair should be selected. If
		/// <c>obj</c> is not a <code>X509CertificatePair</code>, this method
		/// returns <code>false</code>.
		/// </summary>
		/// <param name="pair">The <code>X509CertificatePair</code> to be tested.</param>
		/// <returns><code>true</code> if the object matches this selector.</returns>
		public bool Match(X509CertificatePair pair)
		{
			if (pair == null)
				return false;

			if (certPair != null && !certPair.Equals(pair))
				return false;

			if (forwardSelector != null && !forwardSelector.Match(pair.Forward))
				return false;

			if (reverseSelector != null && !reverseSelector.Match(pair.Reverse))
				return false;

			return true;
		}

		public object Clone()
		{
			return new X509CertPairStoreSelector(this);
		}
	}
}

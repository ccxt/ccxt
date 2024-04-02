using System;

using Org.BouncyCastle.Asn1.X509;

namespace Org.BouncyCastle.Pkix
{
	/// <summary>
	/// This class helps to handle CRL revocation reasons mask. Each CRL handles a
	/// certain set of revocation reasons.
	/// </summary>
	internal class ReasonsMask
	{
		private int _reasons;

		/// <summary>
		/// Constructs are reason mask with the reasons.
		/// </summary>
		/// <param name="reasons">The reasons.</param>
		internal ReasonsMask(
			int reasons)
		{
			_reasons = reasons;
		}

		/// <summary>
		/// A reason mask with no reason.
		/// </summary>
		internal ReasonsMask()
			: this(0)
		{
		}

		/// <summary>
		/// A mask with all revocation reasons.
		/// </summary>
		internal static readonly ReasonsMask AllReasons = new ReasonsMask(
				ReasonFlags.AACompromise | ReasonFlags.AffiliationChanged | ReasonFlags.CACompromise
			|	ReasonFlags.CertificateHold | ReasonFlags.CessationOfOperation
			|	ReasonFlags.KeyCompromise | ReasonFlags.PrivilegeWithdrawn | ReasonFlags.Unused
			|	ReasonFlags.Superseded);

		/**
		 * Adds all reasons from the reasons mask to this mask.
		 *
		 * @param mask The reasons mask to add.
		 */
		internal void AddReasons(
			ReasonsMask mask)
		{
			_reasons = _reasons | mask.Reasons.IntValue;
		}

		/// <summary>
		/// Returns <code>true</code> if this reasons mask contains all possible
		/// reasons.
		/// </summary>
		/// <returns>true if this reasons mask contains all possible reasons.
		/// </returns>
		internal bool IsAllReasons
		{
			get { return _reasons == AllReasons._reasons; }
		}

		/// <summary>
		/// Intersects this mask with the given reasons mask.
		/// </summary>
		/// <param name="mask">mask The mask to intersect with.</param>
		/// <returns>The intersection of this and teh given mask.</returns>
		internal ReasonsMask Intersect(
			ReasonsMask mask)
		{
			ReasonsMask _mask = new ReasonsMask();
			_mask.AddReasons(new ReasonsMask(_reasons & mask.Reasons.IntValue));
			return _mask;
		}

		/// <summary>
		/// Returns <c>true</c> if the passed reasons mask has new reasons.
		/// </summary>
		/// <param name="mask">The reasons mask which should be tested for new reasons.</param>
		/// <returns><c>true</c> if the passed reasons mask has new reasons.</returns>
		internal bool HasNewReasons(
			ReasonsMask mask)
		{
			return ((_reasons | mask.Reasons.IntValue ^ _reasons) != 0);
		}

		/// <summary>
		/// Returns the reasons in this mask.
		/// </summary>
		public ReasonFlags Reasons
		{
			get { return new ReasonFlags(_reasons); }
		}
	}
}

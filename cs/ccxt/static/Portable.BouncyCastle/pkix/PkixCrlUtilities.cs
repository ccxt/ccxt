using System;
using System.Collections.Generic;

using Org.BouncyCastle.Utilities.Collections;
using Org.BouncyCastle.Utilities.Date;
using Org.BouncyCastle.X509;
using Org.BouncyCastle.X509.Store;

namespace Org.BouncyCastle.Pkix
{
	public class PkixCrlUtilities
	{
		public virtual ISet<X509Crl> FindCrls(X509CrlStoreSelector crlSelector, PkixParameters paramsPkix,
			DateTime currentDate)
		{
			HashSet<X509Crl> initialSet;

			// get complete CRL(s)
			try
			{
				initialSet = FindCrls(crlSelector, paramsPkix.GetStoresCrl());
			}
			catch (Exception e)
			{
				throw new Exception("Exception obtaining complete CRLs.", e);
			}

			var finalSet = new HashSet<X509Crl>();
			DateTime validityDate = currentDate;

			if (paramsPkix.Date != null)
			{
				validityDate = paramsPkix.Date.Value;
			}

			// based on RFC 5280 6.3.3
			foreach (X509Crl crl in initialSet)
			{
                DateTimeObject nextUpdate = crl.NextUpdate;

                if (null == nextUpdate || nextUpdate.Value.CompareTo(validityDate) > 0)
				{
					X509Certificate cert = crlSelector.CertificateChecking;

                    if (null == cert || crl.ThisUpdate.CompareTo(cert.NotAfter) < 0)
                    {
                        finalSet.Add(crl);
                    }
				}
			}

			return finalSet;
		}

		public virtual ISet<X509Crl> FindCrls(X509CrlStoreSelector crlSelector, PkixParameters paramsPkix)
		{
			// get complete CRL(s)
			try
			{
				return FindCrls(crlSelector, paramsPkix.GetStoresCrl());
			}
			catch (Exception e)
			{
				throw new Exception("Exception obtaining complete CRLs.", e);
			}
		}

		/// <summary>
		/// crl checking
		/// Return a Collection of all CRLs found in the X509Store's that are
		/// matching the crlSelect criteriums.
		/// </summary>
		/// <param name="crlSelector">a {@link X509CRLStoreSelector} object that will be used
		/// to select the CRLs</param>
		/// <param name="crlStores">a List containing only {@link org.bouncycastle.x509.X509Store
		/// X509Store} objects. These are used to search for CRLs</param>
		/// <returns>a Collection of all found {@link X509CRL X509CRL} objects. May be
		/// empty but never <code>null</code>.
		/// </returns>
		private HashSet<X509Crl> FindCrls(ISelector<X509Crl> crlSelector, IList<IStore<X509Crl>> crlStores)
		{
            var crls = new HashSet<X509Crl>();

			Exception lastException = null;
			bool foundValidStore = false;

			foreach (var crlStore in crlStores)
			{
				try
				{
					crls.UnionWith(crlStore.EnumerateMatches(crlSelector));
					foundValidStore = true;
				}
				catch (Exception e)
				{
					lastException = new Exception("Exception searching in X.509 CRL store.", e);
				}
			}

	        if (!foundValidStore && lastException != null)
	            throw lastException;

			return crls;
		}
	}
}

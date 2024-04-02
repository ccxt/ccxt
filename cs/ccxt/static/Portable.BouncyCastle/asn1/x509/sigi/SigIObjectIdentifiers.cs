using System;

namespace Org.BouncyCastle.Asn1.X509.SigI
{
	/**
	 * Object Identifiers of SigI specifciation (German Signature Law
	 * Interoperability specification).
	 */
	public sealed class SigIObjectIdentifiers
	{
		private SigIObjectIdentifiers()
		{
		}

		public readonly static DerObjectIdentifier IdSigI = new DerObjectIdentifier("1.3.36.8");

		/**
		* Key purpose IDs for German SigI (Signature Interoperability
		* Specification)
		*/
		public readonly static DerObjectIdentifier IdSigIKP = new DerObjectIdentifier(IdSigI + ".2");

		/**
		* Certificate policy IDs for German SigI (Signature Interoperability
		* Specification)
		*/
		public readonly static DerObjectIdentifier IdSigICP = new DerObjectIdentifier(IdSigI + ".1");

		/**
		* Other Name IDs for German SigI (Signature Interoperability Specification)
		*/
		public readonly static DerObjectIdentifier IdSigION = new DerObjectIdentifier(IdSigI + ".4");

		/**
		* To be used for for the generation of directory service certificates.
		*/
		public static readonly DerObjectIdentifier IdSigIKPDirectoryService = new DerObjectIdentifier(IdSigIKP + ".1");

		/**
		* ID for PersonalData
		*/
		public static readonly DerObjectIdentifier IdSigIONPersonalData = new DerObjectIdentifier(IdSigION + ".1");

		/**
		* Certificate is conform to german signature law.
		*/
		public static readonly DerObjectIdentifier IdSigICPSigConform = new DerObjectIdentifier(IdSigICP + ".1");
	}
}

using System;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.X9;

namespace Org.BouncyCastle.Asn1.Sec
{
	public abstract class SecObjectIdentifiers
	{
		/**
		 *  EllipticCurve OBJECT IDENTIFIER ::= {
		 *        iso(1) identified-organization(3) certicom(132) curve(0)
		 *  }
		 */
		public static readonly DerObjectIdentifier EllipticCurve = new DerObjectIdentifier("1.3.132.0");

		public static readonly DerObjectIdentifier SecT163k1 = new DerObjectIdentifier(EllipticCurve + ".1");
		public static readonly DerObjectIdentifier SecT163r1 = new DerObjectIdentifier(EllipticCurve + ".2");
		public static readonly DerObjectIdentifier SecT239k1 = new DerObjectIdentifier(EllipticCurve + ".3");
		public static readonly DerObjectIdentifier SecT113r1 = new DerObjectIdentifier(EllipticCurve + ".4");
		public static readonly DerObjectIdentifier SecT113r2 = new DerObjectIdentifier(EllipticCurve + ".5");
		public static readonly DerObjectIdentifier SecP112r1 = new DerObjectIdentifier(EllipticCurve + ".6");
		public static readonly DerObjectIdentifier SecP112r2 = new DerObjectIdentifier(EllipticCurve + ".7");
		public static readonly DerObjectIdentifier SecP160r1 = new DerObjectIdentifier(EllipticCurve + ".8");
		public static readonly DerObjectIdentifier SecP160k1 = new DerObjectIdentifier(EllipticCurve + ".9");
		public static readonly DerObjectIdentifier SecP256k1 = new DerObjectIdentifier(EllipticCurve + ".10");
		public static readonly DerObjectIdentifier SecT163r2 = new DerObjectIdentifier(EllipticCurve + ".15");
		public static readonly DerObjectIdentifier SecT283k1 = new DerObjectIdentifier(EllipticCurve + ".16");
		public static readonly DerObjectIdentifier SecT283r1 = new DerObjectIdentifier(EllipticCurve + ".17");
		public static readonly DerObjectIdentifier SecT131r1 = new DerObjectIdentifier(EllipticCurve + ".22");
		public static readonly DerObjectIdentifier SecT131r2 = new DerObjectIdentifier(EllipticCurve + ".23");
		public static readonly DerObjectIdentifier SecT193r1 = new DerObjectIdentifier(EllipticCurve + ".24");
		public static readonly DerObjectIdentifier SecT193r2 = new DerObjectIdentifier(EllipticCurve + ".25");
		public static readonly DerObjectIdentifier SecT233k1 = new DerObjectIdentifier(EllipticCurve + ".26");
		public static readonly DerObjectIdentifier SecT233r1 = new DerObjectIdentifier(EllipticCurve + ".27");
		public static readonly DerObjectIdentifier SecP128r1 = new DerObjectIdentifier(EllipticCurve + ".28");
		public static readonly DerObjectIdentifier SecP128r2 = new DerObjectIdentifier(EllipticCurve + ".29");
		public static readonly DerObjectIdentifier SecP160r2 = new DerObjectIdentifier(EllipticCurve + ".30");
		public static readonly DerObjectIdentifier SecP192k1 = new DerObjectIdentifier(EllipticCurve + ".31");
		public static readonly DerObjectIdentifier SecP224k1 = new DerObjectIdentifier(EllipticCurve + ".32");
		public static readonly DerObjectIdentifier SecP224r1 = new DerObjectIdentifier(EllipticCurve + ".33");
		public static readonly DerObjectIdentifier SecP384r1 = new DerObjectIdentifier(EllipticCurve + ".34");
		public static readonly DerObjectIdentifier SecP521r1 = new DerObjectIdentifier(EllipticCurve + ".35");
		public static readonly DerObjectIdentifier SecT409k1 = new DerObjectIdentifier(EllipticCurve + ".36");
		public static readonly DerObjectIdentifier SecT409r1 = new DerObjectIdentifier(EllipticCurve + ".37");
		public static readonly DerObjectIdentifier SecT571k1 = new DerObjectIdentifier(EllipticCurve + ".38");
		public static readonly DerObjectIdentifier SecT571r1 = new DerObjectIdentifier(EllipticCurve + ".39");

		public static readonly DerObjectIdentifier SecP192r1 = X9ObjectIdentifiers.Prime192v1;
		public static readonly DerObjectIdentifier SecP256r1 = X9ObjectIdentifiers.Prime256v1;
	}
}
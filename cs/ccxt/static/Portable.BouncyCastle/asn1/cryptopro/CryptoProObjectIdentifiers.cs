using System;

using Org.BouncyCastle.Asn1;

namespace Org.BouncyCastle.Asn1.CryptoPro
{
    public abstract class CryptoProObjectIdentifiers
    {
        // GOST Algorithms OBJECT IDENTIFIERS :
        // { iso(1) member-body(2) ru(643) rans(2) cryptopro(2)}
        public const string GostID = "1.2.643.2.2";

		public static readonly DerObjectIdentifier GostR3411 = new DerObjectIdentifier(GostID + ".9");
        public static readonly DerObjectIdentifier GostR3411Hmac = new DerObjectIdentifier(GostID + ".10");

        public static readonly DerObjectIdentifier GostR28147Cbc = new DerObjectIdentifier(GostID + ".21");

        public static readonly DerObjectIdentifier ID_Gost28147_89_CryptoPro_A_ParamSet = new DerObjectIdentifier(GostID + ".31.1");

        public static readonly DerObjectIdentifier GostR3410x94 = new DerObjectIdentifier(GostID + ".20");
        public static readonly DerObjectIdentifier GostR3410x2001 = new DerObjectIdentifier(GostID + ".19");
        public static readonly DerObjectIdentifier GostR3411x94WithGostR3410x94 = new DerObjectIdentifier(GostID + ".4");
        public static readonly DerObjectIdentifier GostR3411x94WithGostR3410x2001 = new DerObjectIdentifier(GostID + ".3");

		// { iso(1) member-body(2) ru(643) rans(2) cryptopro(2) hashes(30) }
        public static readonly DerObjectIdentifier GostR3411x94CryptoProParamSet = new DerObjectIdentifier(GostID + ".30.1");

		// { iso(1) member-body(2) ru(643) rans(2) cryptopro(2) signs(32) }
        public static readonly DerObjectIdentifier GostR3410x94CryptoProA = new DerObjectIdentifier(GostID + ".32.2");
        public static readonly DerObjectIdentifier GostR3410x94CryptoProB = new DerObjectIdentifier(GostID + ".32.3");
        public static readonly DerObjectIdentifier GostR3410x94CryptoProC = new DerObjectIdentifier(GostID + ".32.4");
        public static readonly DerObjectIdentifier GostR3410x94CryptoProD = new DerObjectIdentifier(GostID + ".32.5");

		// { iso(1) member-body(2) ru(643) rans(2) cryptopro(2) exchanges(33) }
        public static readonly DerObjectIdentifier GostR3410x94CryptoProXchA = new DerObjectIdentifier(GostID + ".33.1");
        public static readonly DerObjectIdentifier GostR3410x94CryptoProXchB = new DerObjectIdentifier(GostID + ".33.2");
        public static readonly DerObjectIdentifier GostR3410x94CryptoProXchC = new DerObjectIdentifier(GostID + ".33.3");

		//{ iso(1) member-body(2)ru(643) rans(2) cryptopro(2) ecc-signs(35) }
        public static readonly DerObjectIdentifier GostR3410x2001CryptoProA = new DerObjectIdentifier(GostID + ".35.1");
        public static readonly DerObjectIdentifier GostR3410x2001CryptoProB = new DerObjectIdentifier(GostID + ".35.2");
        public static readonly DerObjectIdentifier GostR3410x2001CryptoProC = new DerObjectIdentifier(GostID + ".35.3");

		// { iso(1) member-body(2) ru(643) rans(2) cryptopro(2) ecc-exchanges(36) }
        public static readonly DerObjectIdentifier GostR3410x2001CryptoProXchA  = new DerObjectIdentifier(GostID + ".36.0");
        public static readonly DerObjectIdentifier GostR3410x2001CryptoProXchB  = new DerObjectIdentifier(GostID + ".36.1");

		public static readonly DerObjectIdentifier GostElSgDH3410Default = new DerObjectIdentifier(GostID + ".36.0");
        public static readonly DerObjectIdentifier GostElSgDH3410x1 = new DerObjectIdentifier(GostID + ".36.1");
    }
}

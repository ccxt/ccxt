using System;
using System.Collections.Generic;
using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Nist;

namespace Org.BouncyCastle.Pqc.Crypto.Lms
{
    public class LMOtsParameters
    {
        //TODO add all parameter sets

        public static int reserved = 0;
        public static LMOtsParameters sha256_n32_w1 = new LMOtsParameters(1, 32, 1, 265, 7, 8516, NistObjectIdentifiers.IdSha256);
        public static LMOtsParameters sha256_n32_w2 = new LMOtsParameters(2, 32, 2, 133, 6, 4292, NistObjectIdentifiers.IdSha256);
        public static LMOtsParameters sha256_n32_w4 = new LMOtsParameters(3, 32, 4, 67, 4, 2180, NistObjectIdentifiers.IdSha256);
        public static LMOtsParameters sha256_n32_w8 = new LMOtsParameters(4, 32, 8, 34, 0, 1124, NistObjectIdentifiers.IdSha256);

        private static Dictionary<Object, LMOtsParameters> suppliers = new Dictionary<object, LMOtsParameters>
        {
            { sha256_n32_w1.type, sha256_n32_w1 },
            { sha256_n32_w2.type, sha256_n32_w2 },
            { sha256_n32_w4.type, sha256_n32_w4 },
            { sha256_n32_w8.type, sha256_n32_w8 }
        };
        
        
        private int type;
        private int n;
        private int w;
        private int p;
        private int ls;
        private uint sigLen;
        private DerObjectIdentifier digestOID;

        protected LMOtsParameters(int type, int n, int w, int p, int ls, uint sigLen, DerObjectIdentifier digestOID)
        {
            this.type = type;
            this.n = n;
            this.w = w;
            this.p = p;
            this.ls = ls;
            this.sigLen = sigLen;
            this.digestOID = digestOID;
        }
        public new int GetType()
        {
            return type;
        }

        public int GetN()
        {
            return n;
        }

        public int GetW()
        {
            return w;
        }

        public int GetP()
        {
            return p;
        }

        public int GetLs()
        {
            return ls;
        }

        public uint GetSigLen()
        {
            return sigLen;
        }

        public DerObjectIdentifier GetDigestOid()
        {
            return digestOID;
        }

        public static LMOtsParameters GetParametersForType(int type)
        {
            return suppliers[type];
        }

    }
}
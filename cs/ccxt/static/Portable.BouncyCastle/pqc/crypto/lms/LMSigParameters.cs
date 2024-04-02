using System;
using System.Collections.Generic;
using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Nist;

namespace Org.BouncyCastle.Pqc.Crypto.Lms
{
    public class LMSigParameters
    {
        public static LMSigParameters lms_sha256_n32_h5 = new LMSigParameters(5, 32, 5, NistObjectIdentifiers.IdSha256);
        public static LMSigParameters lms_sha256_n32_h10 = new LMSigParameters(6, 32, 10, NistObjectIdentifiers.IdSha256);
        public static LMSigParameters lms_sha256_n32_h15 = new LMSigParameters(7, 32, 15, NistObjectIdentifiers.IdSha256);
        public static LMSigParameters lms_sha256_n32_h20 = new LMSigParameters(8, 32, 20, NistObjectIdentifiers.IdSha256);
        public static LMSigParameters lms_sha256_n32_h25 = new LMSigParameters(9, 32, 25, NistObjectIdentifiers.IdSha256);


        private static Dictionary<int, LMSigParameters> paramBuilders = new Dictionary<int, LMSigParameters>
        {
            { lms_sha256_n32_h5.type,  lms_sha256_n32_h5  },
            { lms_sha256_n32_h10.type, lms_sha256_n32_h10 },
            { lms_sha256_n32_h15.type, lms_sha256_n32_h15 },
            { lms_sha256_n32_h20.type, lms_sha256_n32_h20 },
            { lms_sha256_n32_h25.type, lms_sha256_n32_h25 }
        };

        private int type;
        private int m;
        private int h;
        private DerObjectIdentifier digestOid;

        protected LMSigParameters(int type, int m, int h, DerObjectIdentifier digestOid)
        {
            this.type = type;
            this.m = m;
            this.h = h;
            this.digestOid = digestOid;

        }
        public int GetType()
        {
            return type;
        }

        public int GetH()
        {
            return h;
        }

        public int GetM()
        {
            return m;
        }

        public DerObjectIdentifier GetDigestOid()
        {
            return digestOid;
        }

        public static LMSigParameters GetParametersForType(int type)
        {
            return paramBuilders[type];
        }
    }
}
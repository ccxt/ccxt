using System;
using Org.BouncyCastle.Crypto;

namespace Org.BouncyCastle.Pqc.Crypto.Falcon
{
    public class FalconParameters 
        : ICipherParameters
    {
        public static FalconParameters falcon_512 = new FalconParameters("falcon512", 9, 40);
        public static FalconParameters falcon_1024 = new FalconParameters("falcon1024", 10, 40);

        private String name;
        private uint logn;
        private uint nonce_length;

        private FalconParameters(String name, uint logn, uint nonce_length)
        {
            this.name = name;
            this.logn = logn;
            this.nonce_length = nonce_length;
        }

        public uint LogN
        {
            get { return logn; }
        }

        public uint NonceLength
        {
            get { return nonce_length; }
        }

        public string Name
        {
            get { return name; }
        }
    }
}

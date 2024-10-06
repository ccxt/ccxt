using System;

namespace Cryptography.ECDSA.Internal.Secp256K1
{
    internal class FeStorage
    {
        public UInt32[] N;

        public FeStorage()
        {
            N = new UInt32[8];
        }

        public FeStorage(UInt32[] arr)
        {
            N = arr;
        }

        public FeStorage(FeStorage other)
        {
            N = new uint[other.N.Length];
            Array.Copy(other.N, N, other.N.Length);
        }

        public FeStorage Clone()
        {
            return new FeStorage(this);
        }
    }
}
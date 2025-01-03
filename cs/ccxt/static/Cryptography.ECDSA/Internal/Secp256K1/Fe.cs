using System;

namespace Cryptography.ECDSA.Internal.Secp256K1
{
    internal class Fe
    {
        // X = sum(i=0..9, elem[i]*2^26) mod n 
        public UInt32[] N;

        public UInt32 this[int index] => N[index];

        public Fe()
        {
            N = new UInt32[10];
        }

        public Fe(UInt32[] arr)
        {
            N = arr;
        }

        public Fe(Fe other)
        {
            N = new uint[other.N.Length];
            Array.Copy(other.N, N, other.N.Length);
        }

        public Fe Clone()
        {
            return new Fe(this);
        }

#if VERIFY
        public int magnitude;
        public int normalized;
#endif
    }
}
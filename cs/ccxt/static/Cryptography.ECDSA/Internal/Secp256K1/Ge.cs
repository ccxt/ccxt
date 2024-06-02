using System;

namespace Cryptography.ECDSA.Internal.Secp256K1
{
    /// <summary>
    /// A group element of the secp256k1 curve, in affine coordinates.
    /// </summary>
    internal class Ge
    {
        public Fe X;
        public Fe Y;
        public bool Infinity; // whether this represents the point at infinity

        public Ge()
        {
            X = new Fe();
            Y = new Fe();
        }

        public Ge(UInt32[] xarr, UInt32[] yarr)
        {
            X = new Fe(xarr);
            Y = new Fe(yarr);
        }
    }
}
using System;

namespace StarkSharp.StarkCurve.Utils
{
    public static class Errors
    {
        public class InvalidPublicKeyError : Exception
        {
            public InvalidPublicKeyError() : base("Given x coordinate does not represent any point on the elliptic curve.") { }
        }
    }
}
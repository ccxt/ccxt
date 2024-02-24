namespace Cryptography.ECDSA.Internal.Secp256K1
{
    /// <summary>
    /// A group element of the secp256k1 curve, in jacobian coordinates.
    /// </summary>
    internal class GeJ
    {
        public Fe X; // actual X: x/z^2 
        public Fe Y; // actual Y: y/z^3
        public Fe Z;
        public bool Infinity; // whether this represents the point at infinity

        public GeJ()
        {
            X = new Fe();
            Y = new Fe();
            Z = new Fe();
        }

        public GeJ(Fe xVal, Fe yVal, Fe zVal)
        {
            X = xVal ?? new Fe();
            Y = yVal ?? new Fe();
            Z = zVal ?? new Fe();
        }

        public GeJ Clone()
        {
            return new GeJ(X?.Clone(), Y?.Clone(), Z?.Clone());
        }
    }
}
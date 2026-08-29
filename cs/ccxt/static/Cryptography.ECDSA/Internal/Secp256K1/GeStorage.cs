namespace Cryptography.ECDSA.Internal.Secp256K1
{
    internal class GeStorage
    {
        public FeStorage X;
        public FeStorage Y;

        public GeStorage()
        {
            X = new FeStorage();
            Y = new FeStorage();
        }
    }
}
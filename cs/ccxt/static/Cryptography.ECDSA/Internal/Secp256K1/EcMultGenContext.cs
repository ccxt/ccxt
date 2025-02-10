namespace Cryptography.ECDSA.Internal.Secp256K1
{
    internal class EcmultGenContext
    {
        // For accelerating the computation of a*G:
        // To harden against timing attacks, use the following mechanism:
        // * Break up the multiplicand into groups of 4 bits, called n_0, n_1, n_2, ..., n_63.
        // * Compute sum(n_i * 16^i * G + U_i, i=0..63), where:
        //   * U_i = U * 2^i (for i=0..62)
        //   * U_i = U * (1-2^63) (for i=63)
        //   where U is a point with no known corresponding scalar. Note that sum(U_i, i=0..63) = 0.
        // For each i, and each of the 16 possible values of n_i, (n_i * 16^i * G + U_i) is
        // precomputed (call it prec(i, n_i)). The formula now becomes sum(prec(i, n_i), i=0..63).
        // None of the resulting prec group elements have a known scalar, and neither do any of
        // the intermediate sums while computing a*G.
        public GeStorage[][] Prec; /* prec[j][i] = 16^j * i * G + U_i */
        public Scalar Blind;
        public GeJ Initial;

        public void PrecInit()
        {
            Prec = new GeStorage[64][];
            for (var i = 0; i < 64; i++)
            {
                Prec[i] = new GeStorage[16];
                for (int j = 0; j < 16; j++)
                {
                    Prec[i][j] = new GeStorage();
                }
            }
            Blind = new Scalar();
            Initial = new GeJ();
        }
    }
}
using System;

namespace Org.BouncyCastle.Pqc.Crypto.Crystals.Dilithium
{
    internal class PolyVecMatrix
    {
        private int K, L;
        public PolyVecL[] Matrix;

        public PolyVecMatrix(DilithiumEngine Engine)
        {
            K = Engine.K;
            L = Engine.L;
            Matrix = new PolyVecL[K];

            for (int i = 0; i < K; i++)
            {
                Matrix[i] = new PolyVecL(Engine);
            }
        }

        public void ExpandMatrix(byte[] rho)
        {
            int i, j;
            for (i = 0; i < K; ++i)
            {
                for (j = 0; j < L; ++j)
                {
                    Matrix[i].Vec[j].UniformBlocks(rho, (ushort)((ushort) (i << 8) + j));
                }
            }
        }

        public void PointwiseMontgomery(PolyVecK t, PolyVecL v)
        {
            int i;
            for (i = 0; i < K; ++i)
            {
                t.Vec[i].PointwiseAccountMontgomery(Matrix[i], v);
            }
        }
    }
}

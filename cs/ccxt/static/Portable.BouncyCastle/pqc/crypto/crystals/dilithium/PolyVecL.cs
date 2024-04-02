using System;

namespace Org.BouncyCastle.Pqc.Crypto.Crystals.Dilithium
{
    internal class PolyVecL
    {
        public Poly[] Vec;
        private DilithiumEngine Engine;
        private int Mode;
        private int PolyVecBytes;
        private int L;
        private int K;

        public PolyVecL(DilithiumEngine Engine)
        {
            this.Engine = Engine;
            Mode = Engine.Mode;
            L = Engine.L;
            K = Engine.K;
            Vec = new Poly[L];
            for (int i = 0; i < L; i++)
            {
                Vec[i] = new Poly(Engine);
            }
        }

        public void UniformEta(byte[] seed, ushort nonce)
        {
            int i;
            for (i = 0; i < L; i++)
            {
                Vec[i].UniformEta(seed, nonce++);
            }
        }

        public void CopyPolyVecL(PolyVecL OutPoly)
        {
            for (int i = 0; i < L; i++)
            {
                for (int j = 0; j < DilithiumEngine.N; j++)
                {
                    OutPoly.Vec[i].Coeffs[j] = Vec[i].Coeffs[j];
                }
            }
        }

        public void InverseNttToMont()
        {
            for (int i = 0; i < L; i++)
            {
                Vec[i].InverseNttToMont();
            }
        }

        public void Ntt()
        {
            for (int i = 0; i < L; i++)
            {
                Vec[i].PolyNtt();
            }
        }
        
        public void UniformGamma1(byte[] seed, ushort nonce)
        {
            for (int i = 0; i < L; i++)
            {
                Vec[i].UniformGamma1(seed, (ushort)(L * nonce + i));
            }
        }

        public void PointwisePolyMontgomery(Poly a, PolyVecL v)
        {
            for (int i = 0; i < L; ++i)
            {
                Vec[i].PointwiseMontgomery(a, v.Vec[i]);
            }
        }

        public void AddPolyVecL(PolyVecL b)
        {
            for (int i = 0; i < L; i++)
            {
                Vec[i].AddPoly(b.Vec[i]);
            }
        }

        public void Reduce()
        {
            for (int i = 0; i < L; i++)
            {
                Vec[i].ReducePoly();
            }
        }

        public bool CheckNorm(int bound)
        {
            for (int i = 0; i < L; ++i)
            {
                if (Vec[i].CheckNorm(bound))
                {
                    return true;
                }
            }
            return false;
        }
    }
}

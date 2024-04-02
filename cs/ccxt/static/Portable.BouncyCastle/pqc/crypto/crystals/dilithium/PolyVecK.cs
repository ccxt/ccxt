using System;

namespace Org.BouncyCastle.Pqc.Crypto.Crystals.Dilithium
{
    internal class PolyVecK
    {
        public Poly[] Vec;
        private DilithiumEngine Engine;
        private int Mode;
        private int PolyVecBytes;
        private int K;
        private int L;

        public PolyVecK(DilithiumEngine Engine)
        {
            this.Engine = Engine;
            Mode = Engine.Mode;
            K = Engine.K;
            L = Engine.L;
            Vec = new Poly[K];
            
            for (int i = 0; i < K; i++)
            {
                Vec[i] = new Poly(Engine);
            }
        }

        public void UniformEta(byte[] seed, ushort nonce)
        {
            int i;
            ushort n = nonce;
            for (i = 0; i < K; i++)
            {
                Vec[i].UniformEta(seed, n++);
            }
        }

        public void Reduce()
        {
            for (int i = 0; i < K; i++)
            {
                Vec[i].ReducePoly();
            }
        }

        public void Ntt()
        {
            for (int i= 0; i < K; ++i)
            {
                Vec[i].PolyNtt();
            }
        }

        public void InverseNttToMont()
        {
            for (int i = 0; i < K; ++i)
            {
                Vec[i].InverseNttToMont();
            }
        }
        
        public void AddPolyVecK(PolyVecK b)
        {
            for (int i = 0; i < K; ++i)
            {
                Vec[i].AddPoly(b.Vec[i]);
            }
        }

        public void Subtract(PolyVecK v)
        {
            for (int i = 0; i < K; ++i)
            {
                Vec[i].Subtract(v.Vec[i]);
            }
        }

        public void ConditionalAddQ()
        {
            for (int i = 0; i < K; ++i)
            {
                Vec[i].ConditionalAddQ();
            }
        }

        public void Power2Round(PolyVecK v)
        {
            for (int i = 0; i < K; ++i)
            {
                Vec[i].Power2Round(v.Vec[i]);
            }
        }

        public void Decompose(PolyVecK v)
        {
            for (int i = 0; i < K; ++i)
            {
                Vec[i].Decompose(v.Vec[i]);
            }
        }

        public void PackW1(byte[] r)
        {
            int i;
            for (i = 0; i < K; i++)
            {
                Vec[i].PackW1(r, i * Engine.PolyW1PackedBytes);
            }
        }

        public void PointwisePolyMontgomery(Poly a, PolyVecK v)
        {
            for (int i = 0; i < K; ++i)
            {
                Vec[i].PointwiseMontgomery(a, v.Vec[i]);
            }
        }

        public bool CheckNorm(int bound)
        {
            for (int i = 0; i < K; ++i)
            {
                if (Vec[i].CheckNorm(bound))
                {
                    return true;
                }
            }
            return false;
        }

        public int MakeHint(PolyVecK v0, PolyVecK v1)
        {
            int i, s = 0;
            for (i = 0; i < K; ++i)
            {
                s += Vec[i].PolyMakeHint(v0.Vec[i], v1.Vec[i]);
            }

            return s;
        }

        public void UseHint(PolyVecK a, PolyVecK h)
        {
            for (int i = 0; i < K; ++i)
            {
                Vec[i].PolyUseHint(a.Vec[i], h.Vec[i]);
            }
        }

        public void ShiftLeft()
        {
            for (int i = 0; i < K; ++i)
            {
                Vec[i].ShiftLeft();
            }
        }

    }
}

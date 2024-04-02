using System;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.Crystals.Dilithium
{
    internal class Packing
    {
        public static void PackPublicKey(byte[] pk, byte[] rho, PolyVecK t1, DilithiumEngine Engine)
        {
            Array.Copy(rho, 0, pk, 0, DilithiumEngine.SeedBytes);
            for (int i = 0; i < Engine.K; i++)
            {
                t1.Vec[i].PolyT1Pack(pk, DilithiumEngine.SeedBytes + i * DilithiumEngine.PolyT1PackedBytes);
            }
        }

        public static void UnpackPublicKey(byte[] rho, PolyVecK t1, byte[] pk, DilithiumEngine Engine)
        {
            int i;

            Array.Copy(pk, 0, rho, 0, DilithiumEngine.SeedBytes);

            for (i = 0; i < Engine.K; ++i)
            {
                t1.Vec[i].PolyT1Unpack(pk, DilithiumEngine.SeedBytes + i * DilithiumEngine.PolyT1PackedBytes);
            }
        }

        public static void PackSecretKey(byte[] sk, byte[] rho, byte[] tr, byte[] key, PolyVecK t0, PolyVecL s1, PolyVecK s2, DilithiumEngine Engine)
        {
            int i, end = 0;
            Array.Copy(rho, sk, DilithiumEngine.SeedBytes);
            end += DilithiumEngine.SeedBytes;

            Array.Copy(key, 0, sk, end, DilithiumEngine.SeedBytes);
            end += DilithiumEngine.SeedBytes;

            Array.Copy(tr, 0, sk, end, DilithiumEngine.SeedBytes);
            end += DilithiumEngine.SeedBytes;

            for (i = 0; i < Engine.L; ++i)
            {
                s1.Vec[i].PolyEtaPack(sk, end + i * Engine.PolyEtaPackedBytes);
            }
            end += Engine.L * Engine.PolyEtaPackedBytes;

            for (i = 0; i < Engine.K; ++i)
            {
                s2.Vec[i].PolyEtaPack(sk, end + i * Engine.PolyEtaPackedBytes);
            }
            end += Engine.K * Engine.PolyEtaPackedBytes;

            for (i = 0; i < Engine.K; ++i)
            {
                t0.Vec[i].PolyT0Pack(sk, end + i * DilithiumEngine.PolyT0PackedBytes);
            }
        }

        public static void UnpackSecretKey(byte[] rho, byte[] tr, byte[] key, PolyVecK t0, PolyVecL s1, PolyVecK s2, byte[] sk, DilithiumEngine Engine)
        {
            int i, end = 0;
            Array.Copy(sk, 0, rho, 0, DilithiumEngine.SeedBytes);
            end += DilithiumEngine.SeedBytes;

            Array.Copy(sk, end, key, 0, DilithiumEngine.SeedBytes);
            end += DilithiumEngine.SeedBytes;

            Array.Copy(sk, end, tr, 0, DilithiumEngine.SeedBytes);
            end += DilithiumEngine.SeedBytes;

            for (i = 0; i < Engine.L; ++i)
            {
                s1.Vec[i].PolyEtaUnpack(sk, end + i * Engine.PolyEtaPackedBytes);
            }
            end += Engine.L * Engine.PolyEtaPackedBytes;

            for (i = 0; i < Engine.K; ++i)
            {
                s2.Vec[i].PolyEtaUnpack(sk, end + i * Engine.PolyEtaPackedBytes);
            }
            end += Engine.K * Engine.PolyEtaPackedBytes;

            for (i = 0; i < Engine.K; ++i)
            {
                t0.Vec[i].PolyT0Unpack(sk, end + i * DilithiumEngine.PolyT0PackedBytes);
            }
        }

        public static byte[] PackSignature(byte[] c, PolyVecL z, PolyVecK h, DilithiumEngine engine)
        {
            int i, j, k, end = 0;
            byte[] sig = new byte[engine.CryptoBytes];


            Array.Copy(c, 0, sig, 0, DilithiumEngine.SeedBytes);
            end += DilithiumEngine.SeedBytes;

            for (i = 0; i < engine.L; ++i)
            {
                z.Vec[i].PackZ(sig, end + i * engine.PolyZPackedBytes);
            }
            end += engine.L * engine.PolyZPackedBytes;

            for (i = 0; i < engine.Omega + engine.K; ++i)
            {
                sig[end + i] = 0;
            }


            k = 0;
            for (i = 0; i < engine.K; ++i)
            {
                for (j = 0; j < DilithiumEngine.N; ++j)
                {
                    if (h.Vec[i].Coeffs[j] != 0)
                    {
                        sig[end + k++] = (byte)j;
                    }
                }
                sig[end + engine.Omega + i] = (byte)k;
            }

            return sig;

        }

        public static bool UnpackSignature(byte[] c, PolyVecL z, PolyVecK h, byte[] sig, DilithiumEngine Engine)
        {
            int i, j, k;

            Array.Copy(sig, c, DilithiumEngine.SeedBytes);

            int end = DilithiumEngine.SeedBytes;
            for (i = 0; i < Engine.L; ++i)
            {
                z.Vec[i].UnpackZ(sig, end + i * Engine.PolyZPackedBytes);
            }
            end += Engine.L * Engine.PolyZPackedBytes;

            k = 0;
            for (i = 0; i < Engine.K; ++i)
            {
                for (j = 0; j < DilithiumEngine.N; ++j)
                {
                    h.Vec[i].Coeffs[j] = 0;
                }

                if ((sig[end + Engine.Omega + i] & 0xFF) < k || (sig[end + Engine.Omega + i] & 0xFF) > Engine.Omega)
                {
                    return false;
                }

                for (j = k; j < (sig[end + Engine.Omega + i] & 0xFF); ++j)
                {
                    if (j > k && (sig[end + j] & 0xFF) <= (sig[end + j - 1] & 0xFF))
                    {
                        return false;
                    }
                    h.Vec[i].Coeffs[sig[end + j] & 0xFF] = 1;
                }

                k = (int)(sig[end + Engine.Omega + i]);
            }
            for (j = k; j < Engine.Omega; ++j)
            {
                if ((sig[end + j] & 0xFF) != 0)
                {
                    return false;
                }
            }
            return true;
        }
    }
}

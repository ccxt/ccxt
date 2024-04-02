using System;
using System.Collections.Generic;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Crypto.Digests;
using Org.BouncyCastle.Crypto.Engines;
using Org.BouncyCastle.Crypto.Modes;
using Org.BouncyCastle.Crypto.Parameters;

namespace Org.BouncyCastle.Pqc.Crypto.NtruPrime
{
    internal class NtruPrimeEngine
    {
        // Key Sizes
        private readonly int _skBytes; // [KEM] Size of secret key
        private readonly int _pkBytes; // [KEM] Size of public key
        private readonly int _ctBytes; // [KEM] Size of ciphertext

        private readonly int _secretKeyBytes; // C Reference: SecretKey_bytes
        private readonly int _publicKeyBytes; // C Reference: PublicKey_bytes
        private readonly int _ciphertextsBytes; // C Reference: Ciphertext_bytes
        
        private readonly int _confirmBytes;
        private readonly int _inputsBytes; // For encoding _I-bit inputs
        private readonly int _topBytes;
        private readonly int _seedBytes;
        private readonly int _smallBytes;
        private readonly int _hashBytes;
        
        private readonly int SessionKeyBytes;

        // Parameters for NTRU
        private readonly int _p;
        private readonly int _q;

        private readonly int _roundedBytes; // Defined in params.h

        // private readonly int _rqBytes; // Defined in params.h - Public key bytes for streamlined nTRU
        private readonly bool _lpr;
        private readonly int _w;
        private readonly int _tau0;
        private readonly int _tau1;
        private readonly int _tau2;
        private readonly int _tau3;

        private readonly int _I;

        private readonly int _q12;

        public int PrivateKeySize => _skBytes;
        public int PublicKeySize => _pkBytes;
        public int CipherTextSize => _ctBytes;
        public int SessionKeySize => SessionKeyBytes;
        
        public NtruPrimeEngine(int p, int q, bool lpr, int w, int tau0,
            int tau1, int tau2, int tau3, int skBytes, int pkBytes, int ctBytes, int roundedBytes, int rqBytes, int defaultKeyLen)
        {
            this._p = p;
            this._q = q;
            this._w = w;
            this._tau0 = tau0;
            this._tau1 = tau1;
            this._tau2 = tau2;
            this._tau3 = tau3;

            // KEM parameters
            this._roundedBytes = roundedBytes;
            this._skBytes = skBytes;
            this._pkBytes = pkBytes;
            this._ctBytes = ctBytes;
            
            this._lpr = lpr;

            this._confirmBytes = 32;
            this.SessionKeyBytes = defaultKeyLen;

            _smallBytes = ((p + 3) / 4);
            _q12 = ((q - 1) / 2);
            _hashBytes = 32;

            if (lpr)
            {
                _seedBytes = 32;
                _I = 256;
                _inputsBytes = _I / 8;
                _topBytes = _I / 2;
                _ciphertextsBytes = roundedBytes + _topBytes;
                _secretKeyBytes = _smallBytes;
                _publicKeyBytes = _seedBytes + roundedBytes;
            }
            else
            {
                _inputsBytes = _smallBytes;
                _ciphertextsBytes = _roundedBytes;
                _secretKeyBytes = (2*_smallBytes);
                _publicKeyBytes = rqBytes;
            }
        }

        
        public void kem_keypair(byte[] pk, byte[] sk, SecureRandom random) //KEM_KeyGen
        {
            
            KeyGen(random, ref pk, ref sk);
            Array.Copy(pk, 0, sk, _secretKeyBytes, _publicKeyBytes);
            byte[] rand = new byte[_inputsBytes];
            random.NextBytes(rand);
            Array.Copy(rand, 0, sk, _secretKeyBytes+_publicKeyBytes, _inputsBytes);
            HashPrefix(ref sk, 4, ref pk, _publicKeyBytes);
        }

      
        public void kem_enc(byte[] ct, byte[] ss, byte[] pk, SecureRandom random)
        {
            sbyte[] inputs;

            if (_lpr)
            {
                inputs = new sbyte[_I];
            }
            else
            {
                inputs = new sbyte[_p];
            }
            
            byte[] r_enc = new byte[_inputsBytes];
            byte[] cache = new byte[_hashBytes];
            
            HashPrefix(ref cache, 4, ref pk, _publicKeyBytes);
            
            if (_lpr)
            {
                InputsRandom(ref inputs, random);
            }
            else
            {
                ShortRandom(ref inputs, random);
            }
            
            Hide(ref ct, r_enc, inputs, pk, cache);
            HashSession(ref ss, 1, r_enc, ct);
        }

        public void kem_dec(byte[] ss, byte[] ct, byte[] sk)
        {
            byte[] pk = new byte[sk.Length - _secretKeyBytes];

            // Shift sk by _secretKeyBytes and copy to pk

            Array.Copy(sk, _secretKeyBytes, pk, 0, pk.Length);

            byte[] rho = new byte[pk.Length - _publicKeyBytes];

            // Shift pk by _publicKeyBytes and fill rho
            Array.Copy(pk, _publicKeyBytes, rho, 0, rho.Length);

            byte[] cache = new byte[rho.Length - _inputsBytes];

            // Shift rho by _inputsBytes and fill cache

            Array.Copy(rho, _inputsBytes, cache, 0, cache.Length);
            
            sbyte[] r;

            if (_lpr)
            {
                r = new sbyte[_I];
            }
            else
            {
                r = new sbyte[_p];
            }
            
            byte[] r_enc = new byte[_inputsBytes];
            byte[] cnew = new byte[_ciphertextsBytes + _confirmBytes];

            byte[] ct_dec = Arrays.Clone(ct); // ct somehow gets modified in Decrypt
            
            Decrypt(ref r, ct_dec, sk);

            Hide(ref cnew, r_enc, r, pk, cache);
            
            int mask = ctDiffMask(ct, cnew);
            
            for (int i = 0; i < _inputsBytes; ++i)
            {
                r_enc[i] ^= (byte)(mask & (r_enc[i] ^ rho[i]));
            }
            
            HashSession(ref ss, 1 + mask, r_enc, ct);
        }

        // ---------------------------------------------------------------------    

        private void KeyGen(SecureRandom random, ref byte[] pk, ref byte[] sk) // ZKeyGen
        {
            if (_lpr)
            {
                short[] A = new short[_p];
                sbyte[] a = new sbyte[_p];
                
                // BEGIN: XKeyGen
                byte[] seedOut = new byte[_seedBytes];
                random.NextBytes(seedOut);
                Array.Copy(seedOut, 0, pk, 0, _seedBytes);
                short[] genOut = new short[_p];
                Generator(ref genOut, seedOut);
            
                // BEGIN: XKeyGen > KeyGen
                ShortRandom(ref a, random);
                short[] aG = new short[_p];
                RqMult(ref aG,  genOut, ref a);
                Round(ref A, aG);
                // END XKeyGen > KeyGen
                // END: XKeyGen

                byte[] roundedEncOut = new byte[pk.Length];
                RoundedEncode(ref roundedEncOut, A);

                Array.Copy(roundedEncOut, 0, pk, _seedBytes, pk.Length - _seedBytes);

                ByteEncode(ref sk, a);
            }
            else
            {
                // KeyGen
                short[] h = new short[_p];
                sbyte[] f = new sbyte[_p];
                
                sbyte[] ginv = new sbyte[_p];
                sbyte[] g = new sbyte[_p];
                short[] finv = new short[_p];

                while (true)
                {
                    ByteRandom(ref g, random);

                    if (R3Recip(ref ginv, g) == 0)
                    {
                        break;
                    }
                    
                }
                
                ShortRandom(ref f, random);
                RqRecip3(ref finv, f);
                RqMult(ref h, finv, g);
                // END KeyGen
                
                RqEncode(ref pk, h);
                
                ByteEncode(ref sk, f);
                
                byte[] smallEncOut = new byte[sk.Length];
                ByteEncode(ref smallEncOut, ginv);
                
                Array.Copy(smallEncOut, 0, sk, _smallBytes, sk.Length - _smallBytes);
                
            }
            
        }
        
        //----------------------- Streamlined --------------------------------
        
        private void ByteRandom(ref sbyte[] output, SecureRandom random)
        {
            for (int i = 0;i < _p;++i)
            {
                byte[] smallRandom = new byte[4];
                random.NextBytes(smallRandom);
                output[i] = (sbyte)((((BitConverter.ToUInt32(smallRandom, 0) & 0x3fffffff) * 3) >> 30)-1);
            };
        }

        private int R3Recip(ref sbyte[] output, sbyte[] input)
        {
            sbyte[] f = new sbyte[_p+1];
            sbyte[] g = new sbyte[_p+1];
            sbyte[] v = new sbyte[_p+1];
            sbyte[] r = new sbyte[_p+1];

            for (int i = 0; i < _p+1; ++i)
            {
                v[i] = 0;
                r[i] = 0;
            }

            r[0] = 1;

            for (int i = 0; i < _p; ++i)
            {
                f[i] = 0;
            }
            
            f[0] = 1;
            f[_p - 1] = f[_p] = -1;

            for (int i = 0; i < _p; ++i)
            {
                g[_p-1-i] = input[i];
            }
            
            g[_p] = 0;

            int delta = 1;

            int sign, swap, t;

            for (int i = 0; i < 2*_p-1; ++i)
            {
                for (int j = _p; j > 0; --j)
                {
                    v[j] = v[j - 1];
                }

                v[0] = 0;

                sign = -g[0] * f[0];
                
                
                swap = NegativeMask((short)-delta) & ((g[0] != 0) ? -1 : 0);
                
                
                delta ^= swap & (delta ^ -delta);
                delta +=1;

                for (int j = 0; j < _p + 1; ++j)
                {
                    t = swap&(f[j]^g[j]);
                    f[j] ^= (sbyte)t; 
                    g[j] ^= (sbyte)t;
                    t = swap&(v[j]^r[j]); 
                    v[j] ^= (sbyte)t; 
                    r[j] ^= (sbyte)t;

                }
                for (int j = 0; j < _p+1; ++j)
                {
                    g[j] =(sbyte)(mod(((g[j] + sign * f[j]) + 1), 3) - 1);
                }

                for (int j = 0; j < _p+1; ++j)
                {
                    r[j] =(sbyte)(mod(((r[j] + sign * v[j]) + 1), 3) - 1);
                }

                for (int j = 0; j < _p; ++j)
                {
                    g[j] = g[j + 1];
                }
                g[_p] = 0;
            }

            sign = f[0];

            for (int i = 0; i < _p; ++i)
            {
                output[i] = (sbyte)(sign * v[_p - 1 - i]);
            }
            
            return (delta != 0) ? -1 : 0;

        }

        private int RqRecip3(ref short[] output, sbyte[] input)
        {
            short[] f = new short[_p + 1];
            short[] g = new short[_p + 1];
            short[] v = new short[_p + 1];
            short[] r = new short[_p + 1];
            int swap, t;
            short scale;
            int f0, g0;

            for (int i = 0; i < _p + 1; ++i)
            {
                v[i] = 0;
                r[i] = 0;
            }

            r[0] = FqRecip(3);

            for (int i = 0; i < _p; ++i)
            {
                f[i] = 0;
            }

            f[0] = 1;
            f[_p - 1] = f[_p] = -1;

            for (int i = 0; i < _p; ++i)
            {
                g[_p - 1 - i] = input[i];
            }

            g[_p] = 0;

            int delta = 1;

            for (int i = 0; i < 2 * _p - 1; ++i)
            {

                for (int j = _p; j > 0; --j)
                {
                    v[j] = v[j - 1];
                }

                v[0] = 0;
                

                swap = NegativeMask((short)-delta) & ((g[0] != 0) ? -1 : 0);
                
                delta ^= swap & (delta ^ -delta);
                delta += 1;

                for (int j = 0; j < _p + 1; ++j)
                {
                    t = swap & (f[j] ^ g[j]);
                    f[j] ^= (short)t;
                    g[j] ^= (short)t;
                    t = swap & (v[j] ^ r[j]);
                    v[j] ^= (short)t;
                    r[j] ^= (short)t;
                }

                f0 = f[0];
                g0 = g[0];

                for (int j = 0; j < _p + 1; ++j)
                {
                    g[j] = ArithmeticMod_q(f0 * g[j] - g0 * f[j]);
                }

                for (int j = 0; j < _p + 1; ++j)
                {
                    r[j] = ArithmeticMod_q(f0 * r[j] - g0 * v[j]);
                }

                for (int j = 0; j < _p; ++j)
                {
                    g[j] = g[j + 1];
                }

                g[_p] = 0;
            }

            scale = FqRecip(f[0]);

            for (int i = 0; i < _p; ++i)
            {
                output[i] = ArithmeticMod_q(scale * v[_p - 1 - i]);
            }

            return (delta != 0) ? -1 : 0;
        }

        private short FqRecip(short a1)
        {
            int i = 1;
            short ai = a1;

            while (i < _q - 2)
            {
                ai = ArithmeticMod_q(a1 * ai);
                i++;
            }

            return ai;
        }

        private void RqMult(ref short[] output, short[] f, sbyte[] g)
        {
            // h = f * g in the ring Rq
            
            short[] fg = new short[_p + _p + 1]; // Can directly modify h
            short result;

            for (int i = 0; i < _p; ++i)
            {
                result = 0;
                for (int j = 0; j <= i; ++j)
                {
                    result = ArithmeticMod_q(result + f[j] * g[i - j]);
                }
                fg[i] = result;
            }

            for (int i = _p;i < _p+_p-1;++i)
            {
                result = 0;
                for (int j = i-_p+1;j < _p;++j)
                {
                    result = ArithmeticMod_q(result + f[j] * g[i - j]);
                }
                fg[i] = result;
            }

            for (int i = _p+_p-2; i >= _p; --i)
            {
                fg[i - _p] = ArithmeticMod_q(fg[i - _p] + fg[i]);
                fg[i-_p+1] = ArithmeticMod_q(fg[i-_p+1] + fg[i]);
            }
            
            for (int i = 0; i < _p; ++i)
            {
                output[i] = fg[i];
            }
        }

        private void RqEncode(ref byte[] output, short[] r)
        {
            ushort[] R = new ushort[_p];
            ushort[] M = new ushort[_p];

            for (int i = 0; i < _p; ++i)
            {
                R[i] = (ushort)(r[i] + _q12);
                M[i] = (ushort)_q;
            }
            
            List<byte> sList = new List<byte>();

            Encode(ref sList, R, M, _p);

            Array.Copy(sList.ToArray(), 0, output, 0, sList.Count);
        }

        private void RqDecode(ref short[] output, byte[] s)
        {
            ushort[] R = new ushort[_p];
            ushort[] M = new ushort[_p];

            for (int i = 0; i < _p; ++i)
            {
                M[i] = (ushort)_q;
            }
            
            List<byte> rList = new List<byte>(s);
            List<ushort> mList = new List<ushort>(M);
            
            List<ushort> decoded = Decode(rList, mList);

            for (int i = 0; i < _p; ++i)
            {
                output[i] = (short)(decoded[i] - _q12);
            }
        }

        private void RqMult3(ref short[] output, short[] f)
        {
            for (int i = 0; i < _p; ++i)
            { 
                output[i] = ArithmeticMod_q(f[i] * 3);
            }
        }

        private void R3FromRq(ref sbyte[] output, short[] r)
        {
            for (int i = 0; i < _p; ++i)
            {
                output[i] = (sbyte)ArithmeticMod_3(r[i]);
            }
        }

        private void R3Mult(ref sbyte[] output, sbyte[] f, sbyte[] g)
        {
            sbyte[] fg = new sbyte[_p + _p + 1];
            sbyte result;

            for (int i = 0; i < _p; ++i)
            {
                result = 0;
                for (int j = 0; j <= i; ++j)
                {
                    result = (sbyte)(ArithmeticMod_3(result + f[j] * g[i - j]));
                }
                fg[i] = result;
            }

            for (int i = _p;i < _p+_p-1;++i)
            {
                result = 0;

                for (int j = i-_p+1;j < _p;++j)
                {
                    result = (sbyte)(ArithmeticMod_3(result+f[j]*g[i-j]));
                }
                fg[i] = result;
            }

            for (int i = _p+_p-2;i >= _p;--i)
            {
                fg[i - _p] = (sbyte)(ArithmeticMod_3(fg[i - _p] + fg[i]));
                fg[i - _p + 1] = (sbyte)(ArithmeticMod_3(fg[i - _p + 1] + fg[i]));
            }

            for (int i = 0; i < _p; ++i)
            {
                output[i] = fg[i];
            }
        }

        private int WeightMask(sbyte[] r)
        {
            int weight = 0;

            for (int i = 0; i < _p; ++i)
            {
                weight += r[i]&1;
            }

            return NonZeroMask((short)(weight - _w));

        }

        private int NonZeroMask(short x)
        {
            /* return -1 if x!=0; else return 0 */
            return (x == 0) ? 0 : -1;
        }

        //---------------------------------------------------------------------
        
        private List<ushort> Decode(List<byte> S, List<ushort> M)
        {
            int limit = 16384;

            if (M.Count == 0)
            {
                return new List<ushort>();
            }

            if (M.Count == 1)
            {
                if (M[0] == 1)
                {
                    return new List<ushort>() { 0 };
                }
                if (M[0] <= 256)
                {
                    return new List<ushort>() { (ushort)mod(S[0], M[0]) };
                } else
                {
                    return new List<ushort>() { (ushort)mod(S[0] + (((uint)S[1]) << 8), M[0]) };
                }
            }

            int k = 0;
            List<ushort> bottomr = new List<ushort>();
            List<uint> bottomt = new List<uint>();
            List<ushort> M2 = new List<ushort>();

            for (int i = 0; i < M.Count - 1; i += 2)
            {
                uint m = (uint)(M[i] * M[i + 1]);
                ushort r = 0;
                uint t = 1;

                while (m >= limit)
                {
                    r = (ushort)(r + S[k] * t);
                    t = t * 256;
                    k = k + 1;
                    m = (uint)System.Math.Floor((double)((m + 255) / 256));
                }
                bottomr.Add(r);
                bottomt.Add(t);
                M2.Add((ushort)m);
            }

            if (M.Count % 2 != 0)
            {
                M2.Add(M[M.Count - 1]);
            }

            List<byte> S2 = new List<byte>();

            S2 = S.GetRange(k, S.Count - k);

            List<ushort> R2 = Decode(S2, M2);

            List<ushort> R = new List<ushort>();

            for (int i = 0; i < M.Count - 1; i += 2)
            {
                uint r = bottomr[i / 2];
                uint t = bottomt[i / 2];
                r += (uint)(t * R2[i / 2]);
                R.Add((ushort)mod(r, M[i]));
                R.Add((ushort)(mod(System.Math.Floor((double)r / M[i]), M[i + 1])));
            }
            if (M.Count % 2 != 0)
            {
                R.Add(R2[M2.Count - 1]);
            }
            return R;
        }

        private void Encode(ref List<byte> output, ushort[] R, ushort[] M, long len)
        {
            int limit = 16384;
            if (len == 1)
            {
                ushort r = R[0];
                ushort m = M[0];

                while (m > 1)
                {
                    output.Add(Decimal.ToByte(r % 256));
                    r >>= 8;
                    m = (ushort)((m + 255) >> 8);
                }
            }

            if (len > 1)
            {
                ushort[] R2 = new ushort[(len + 1) / 2];
                ushort[] M2 = new ushort[(len + 1) / 2];

                int i;
                for (i = 0; i < len - 1; i += 2)
                {
                    uint m0 = M[i];
                    uint r = R[i] + R[i + 1] * m0;
                    uint m = M[i + 1] * m0;

                    while (m >= limit)
                    {
                        output.Add(Decimal.ToByte(r % 256));
                        r >>= 8;
                        m = (m + 255) >> 8;
                    }

                    R2[i / 2] = (ushort)r;
                    M2[i / 2] = (ushort)m;
                }

                if (i < len)
                {
                    R2[i / 2] = R[i];
                    M2[i / 2] = M[i];
                }

                Encode(ref output, R2, M2, (len + 1) / 2);
            }
        }

        private void Encrypt(ref byte[] output, sbyte[] r, byte[] pk) // ZEncrypt
        {
            if (_lpr)
            {
                short[] A = new short[_p];
                short[] B = new short[_p];
                sbyte[] T = new sbyte[_I];

                byte[] pkMinusSeed = new byte[pk.Length - _seedBytes];
                Array.Copy(pk, _seedBytes, pkMinusSeed, 0, pkMinusSeed.Length);

                RoundedDecode(ref A, pkMinusSeed);

                // BEGIN: XEncrypt
                short[] G = new short[_p];
                sbyte[] b = new sbyte[_p];
                byte[] seedOut = new byte[_seedBytes];

                Array.Copy(pk, 0, seedOut, 0, _seedBytes);

                Generator(ref G, seedOut);
                HashShort(ref b, r);

                // BEGIN: Encrypt
                short[] bG = new short[_p];
                short[] bA = new short[_p];

                RqMult(ref bG, G, ref b);

                Round(ref B, bG);

                RqMult(ref bA, A, ref b);

                for (int i = 0; i < _I; ++i)
                {
                    T[i] = Top(ArithmeticMod_q(bA[i] + r[i] * _q12));
                }
                // END: Encrypt
                // END: XEncrypt
            
                RoundedEncode(ref output, B);
                byte[] topEncOut = new byte[output.Length];
                TopEncode(ref topEncOut, T);
                Array.Copy(topEncOut, 0, output, _roundedBytes, output.Length - _roundedBytes);
            }
            else
            {
                short[] h = new short[_p];
                short[] c = new short[_p];
                
                RqDecode(ref h, pk);
        
                // Encrypt
                short[] hr = new short[_p];
                RqMult(ref hr, h, r);
                Round(ref c, hr);
                // END Encrypt
                
                RoundedEncode(ref output, c);

            }
        }
        
        private void Decrypt(ref sbyte[] output, byte[] c, byte[] sk) // ZDecrypt
        {
            if (_lpr)
            {
                sbyte[] a = new sbyte[_p];
                short[] B = new short[_p];
                sbyte[] T = new sbyte[_I];

                ByteDecode(ref a, sk);
                RoundedDecode(ref B, c);

                Array.Copy(c, _roundedBytes, c, 0, c.Length - _roundedBytes);

                TopDecode(ref T, c);
                
                // BEGIN: XDecrypt
                short[] aB = new short[_p];

                RqMult(ref aB, B, ref a);

                for (int i = 0; i < _I; ++i)
                {
                    int freeze = Right(T[i]) - aB[i] + 4 * _w + 1;
                    output[i] = (sbyte)(-NegativeMask((short)(mod(freeze + _q12, _q) - _q12)));
                }
                // END: XDecrypt
            }
            else
            {
                sbyte[] f = new sbyte[_p];
                sbyte[] v = new sbyte[_p];
                
                short[] c2 = new short[_p];
                
                ByteDecode(ref f, sk);
                
                byte[] skShift = new byte[sk.Length];
                
                Array.Copy(sk, _smallBytes, skShift, 0, skShift.Length - _smallBytes);
                
                ByteDecode(ref v, skShift);
                
                RoundedDecode(ref c2, c);
                
                short[] cf = new short[_p];
                short[] cf3 = new short[_p];
                sbyte[] e = new sbyte[_p];
                sbyte[] ev = new sbyte[_p];
                
                RqMult(ref cf, c2, f);
                RqMult3(ref cf3, cf);
                R3FromRq(ref e, cf3);
                R3Mult(ref ev, e, v);

                int mask = WeightMask(ev);
                
                for (int i = 0; i < _w; ++i)
                {
                    output[i] = (sbyte)(((ev[i] ^ 1) & ~mask) ^ 1);
                }
                
                for (int i = _w; i < _p; ++i)
                {
                    output[i] = (sbyte)(ev[i] & ~mask);
                }
            }
            
        }
        
        private void Hide(ref byte[] output, byte[] r_enc, sbyte[] r, byte[] pk, byte[] cache)
        {
            /* c,r_enc = Hide(r,pk,cache); cache is Hash4(pk) */

            if (_lpr)
            {
                InputsEncode(ref r_enc, r);
            }
            else
            {
                ByteEncode(ref r_enc, r);
            }
            
            Encrypt(ref output, r, pk);
            
            Array.Copy(output, 0, output, _ctBytes, output.Length - _ctBytes);
            
            HashConfirm(ref output, ref r_enc, ref pk, ref cache);

        }

        private void Generator(ref short[] output, byte[] seed)
        {
            uint[] L = Expand(seed);
            
            for (int i = 0; i < _p; i++)
            {
                output[i] = (short)((L[i] % _q) - _q12);
            }
        }

        private uint[] Expand(byte[] k)
        {
            byte[] L = new byte[_p * 4];
            byte[] cipherInput = new byte[_p * 4];
            uint[] L_uint = new uint[_p];

            // AES256 CTR
            BufferedBlockCipher cipher = new BufferedBlockCipher(new SicBlockCipher(new AesEngine()));
            KeyParameter kp = new KeyParameter(k);
            cipher.Init(true, new ParametersWithIV(kp, new byte[16]));
            int len = cipher.ProcessBytes(cipherInput, 0, 4 * _p, L, 0);
            len += cipher.DoFinal(L, len);
            
            for (int i = 0; i < _p; ++i)
            {
                uint L0 = L[4 * i];
                uint L1 = L[4 * i + 1];
                uint L2 = L[4 * i + 2];
                uint L3 = L[4 * i + 3];

                L_uint[i] = L0 + (L1 << 8) + (L2 << 16) + (L3 << 24);
            }
            return L_uint;
        }
        
        private void ShortRandom(ref sbyte[] output, SecureRandom random)
        {
            uint[] L = new uint[_p];

            for (int i = 0; i < _p; ++i)
            {
                byte[] shortRandom = new byte[4];
                random.NextBytes(shortRandom);
                L[i] = BitConverter.ToUInt32(shortRandom, 0);
            }
            ShortFromList(ref output, L);
        }

        private void ShortFromList(ref sbyte[] output, uint[] L_in)
        {
            uint[] L = new uint[_p];

            for (int i = 0; i < _w; ++i)
            {
                L[i] = (uint)(L_in[i] & -2);
            }
            
            for (int i = _w; i < _p; ++i)
            {
                L[i] = (uint)(L_in[i] & -3) | 1;
            }

            Array.Sort(L);

            for (int i = 0; i < _p; ++i)
            {
                output[i] = (sbyte)((L[i] & 3) - 1);
            }
        }
        
        private void RqMult(ref short[] output, short[] G, ref sbyte[] a) // aG, G, a -> h, f, g
        {
            short[] fg = new short[_p + _p - 1];
            short result;

            for (int i = 0; i < _p; ++i)
            {
                result = 0;
                for (int j = 0; j <= i; ++j)
                {
                    result = ArithmeticMod_q(result + (G[j] * a[i - j]));
                }

                fg[i] = result;
            }

            for (int i = _p; i < _p + _p - 1; ++i)
            {
                result = 0;
                for (int j = i - _p + 1; j < _p; ++j)
                {
                    result = ArithmeticMod_q(result + (G[j] * a[i - j]));
                }

                fg[i] = result;
            }

            for (int i = _p + _p - 2; i >= _p; --i)
            {
                fg[i - _p] = ArithmeticMod_q(fg[i - _p] + fg[i]);
                fg[i - _p + 1] = ArithmeticMod_q(fg[i - _p + 1] + fg[i]);
            }

            for (int i = 0; i < _p; ++i)
            {
                output[i] = fg[i];
            }
        }

        private void Round(ref short[] output, short[] aG)
        {
            for (int i = 0; i < _p; ++i)
            {
                output[i] = (short)(aG[i] - ArithmeticMod_3(aG[i]));
            }
        }
        
        private void InputsRandom(ref sbyte[] output, SecureRandom random)
        {
            byte[] s = new byte[_inputsBytes];
            random.NextBytes(s);
            for (int i = 0; i < _I; ++i)
            {
                output[i] = (sbyte)(1 & (s[i >> 3] >> (i & 7)));
            }
        }
        
        private void InputsEncode(ref byte[] output, sbyte[] r)
        {
            for (int i = 0; i < _inputsBytes; ++i)
            {
                output[i] = 0;
            }

            for (int i = 0; i < _I; ++i)
            {
                output[i >> 3] |= (byte)(r[i] << (i & 7));
            }
        }
        
        private void RoundedEncode(ref byte[] output, short[] A)
        {
            ushort[] R = new ushort[_p];
            ushort[] M = new ushort[_p];
            
            for (int i = 0; i < _p; ++i)
            {
                R[i] = (ushort)(((A[i] + _q12) * 10923) >> 15);
            }

            for (int i = 0; i < _p; ++i)
            {
                M[i] = (ushort)((_q + 2) / 3);
            }
            
            List<byte> outputList = new List<byte>();

            Encode(ref outputList, R, M, _p);

            Array.Copy(outputList.ToArray(), 0, output, 0, outputList.Count);
        }
        
        private void RoundedDecode(ref short[] output, byte[] s)
        {
            List<ushort> M = new List<ushort>(_p);
            List<byte> S = new List<byte>(s);

            for (int i = 0; i < _p; ++i)
            {
                M.Add((ushort)((_q + 2) / 3));
            }

            List<ushort> decoded = Decode(S, M);

            for (int i = 0; i < _p; ++i)
            {
                output[i] = (short)((decoded[i] * 3) - _q12);
            }
        }
        
        private void ByteEncode(ref byte[] output, sbyte[] a)
        {
            sbyte x;
            for (int i = 0; i < _p / 4; ++i)
            {
                int x0 = a[4 * i] + 1;
                int x1 = (a[4 * i + 1] + 1) << 2;
                int x2 = (a[4 * i + 2] + 1) << 4;
                int x3 = (a[4 * i + 3] + 1) << 6;
                x = (sbyte)(x0 + x1 + x2 + x3);
                output[i] = (byte)x;
            }
            output[_p / 4] = (byte)(a[_p - 1] + 1);
        }
        
        private void ByteDecode(ref sbyte[] output, byte[] s)
        {
            byte x;
            for (int i = 0; i < _p / 4; ++i)
            {
                x = s[i];
                output[i * 4] = (sbyte)((x & 3) - 1);
                x >>= 2;
                output[i * 4 + 1] = (sbyte)((x & 3) - 1);
                x >>= 2;
                output[i * 4 + 2] = (sbyte)((x & 3) - 1);
                x >>= 2;
                output[i * 4 + 3] = (sbyte)((x & 3) - 1);
            }

            x = s[_p / 4];
            output[_p / 4 * 4] = (sbyte)((x & 3) - 1);
        }

        private void TopEncode(ref byte[] output, sbyte[] T)
        {
            for (int i = 0; i < _topBytes; ++i)
            {
                output[i] = (byte)(T[2 * i] + (T[2 * i + 1] << 4));
            }
        }

        private void TopDecode(ref sbyte[] output, byte[] s)
        {
            for (int i = 0; i < _topBytes; ++i)
            {
                output[2 * i] = (sbyte)(s[i] & 15);
                output[2 * i + 1] = (sbyte)(s[i] >> 4);
            }
        }
        
        private void HashShort(ref sbyte[] output, sbyte[] r)
        {
            byte[] s = new byte[_inputsBytes];
            byte[] h = new byte[_hashBytes];
            uint[] L = new uint[_p];

            InputsEncode(ref s, r);
            HashPrefix(ref h, 5, ref s, s.Length);
            L = Expand(h);
            ShortFromList(ref output, L);
        }

        private void HashPrefix(ref byte[] output, int b, ref byte[] input, int inlen)
        {
            byte[] x = new byte[inlen + 1];
            byte[] h = new byte[64];

            x[0] = (byte)b;

            for (int i = 0; i < inlen; ++i)
            {
                x[i + 1] = input[i];
            }

            Sha512Digest sha512 = new Sha512Digest();
            sha512.BlockUpdate(x, 0, x.Length);
            sha512.DoFinal(h, 0);

            Array.Copy(h, 0, output, output.Length - 32, 32);
        }
        
        private void HashConfirm(ref byte[] output, ref byte[] r, ref byte[] pk, ref byte[] cache)
        {

            byte[] x;
            
            if (_lpr)
            {
                
                x = new byte[_inputsBytes + _hashBytes];


                for (int i = 0; i < _inputsBytes; ++i)
                {
                    x[i] = r[i];
                }

                for (int i = 0; i < _hashBytes; ++i)
                {
                    x[_inputsBytes + i] = cache[i];
                }
                
            }
            else
            {
                x = new byte[_hashBytes*2];

                byte[] prefix = new byte[_hashBytes];
                
                HashPrefix(ref prefix, 3, ref r, _inputsBytes);
                
                Array.Copy(prefix, 0, x, 0, _hashBytes);
                
                for (int i = 0; i < _hashBytes; ++i)
                {
                    x[_hashBytes + i] = cache[i];
                }
            }
            HashPrefix(ref output, 2, ref x, x.Length);

        }
        
        private void HashSession(ref byte[] output, int b, byte[] y, byte[] z)
        {
            byte[] x;
            
            if (_lpr)
            {
                x = new byte[_inputsBytes + _ciphertextsBytes + _confirmBytes];

                for (int i = 0; i < _inputsBytes; ++i)
                {
                    x[i] = y[i];
                }

                for (int i = 0; i < _ciphertextsBytes + _confirmBytes; ++i)
                {
                    x[_inputsBytes + i] = z[i];
                }
            }
            else
            {
                x = new byte[_hashBytes + _ciphertextsBytes + _confirmBytes];
                
                byte[] prefix = new byte[_hashBytes];
                HashPrefix(ref prefix, 3, ref y, _inputsBytes);
                Array.Copy(prefix, 0, x, 0, _hashBytes);
                
                for (int i = 0; i < _ciphertextsBytes + _confirmBytes; ++i)
                {
                    x[_hashBytes + i] = z[i];
                }
            }

            byte[] hash = new byte[32];
            HashPrefix(ref hash, b, ref x, x.Length);
            Array.Copy(hash, 0, output, 0, output.Length);
        }
        
        private int NegativeMask(short x)
        {
            return (x < 0) ? -1 : 0;
        }
        
        private int ctDiffMask(byte[] c, byte[] c2)
        {
            int x = c.Length ^ c2.Length;
            for (int i = 0; i < c.Length && i < c2.Length; ++i)
            {
                x |= c[i] ^ c2[i];
            }

            // Return 0 if matching, else -1
            return x == 0 ? 0 : -1;
        }
        
        // Arithmetics
        double mod(double a, double b)
        {
            return a - b * System.Math.Floor(a / b);
        }
        
        private short ArithmeticMod_q(int x)  // Fq_freeze
        {
            return (short)((mod(x + _q12, _q)) - _q12);
        }
        
        private short ArithmeticMod_3(int x) // F3_freeze
        {
            return (short)(mod(x + 1, 3) - 1);
        }
        
        private sbyte Top(int C)
        {
            return (sbyte)((_tau1 * (C + _tau0) + 16384) >> 15);
        }
        
        private short Right(sbyte T)
        {
            int freeze = _tau3 * T - _tau2;
            return (short)(mod(freeze + _q12, _q) - _q12);
        }
        
    }
}

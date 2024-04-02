

using System;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Digests;
using Org.BouncyCastle.Crypto.Engines;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.Frodo
{
    public abstract class FrodoMatrixGenerator
    {
        int n;
        int q;

        public FrodoMatrixGenerator(int n, int q)
        {
            this.n = n;
            this.q = q;
        }

        internal abstract short[] GenMatrix(byte[] seedA);

        internal class Shake128MatrixGenerator
            : FrodoMatrixGenerator
        {
            public Shake128MatrixGenerator(int n, int q)
                : base(n, q)
            {
            }

            internal override short[] GenMatrix(byte[] seedA)
            {
                short[] A = new short[n * n];
                ushort i, j;
                byte[] b, tmp = new byte[(16 * n) / 8];
                byte[] temp = new byte[2];
                for (i = 0; i < n; i++)
                {
                    // 1. b = i || seedA in {0,1}^{16 + len_seedA}, where i is encoded as a 16-bit integer in little-endian byte order
                    Pack.UInt16_To_LE(i, temp);
                    b = Arrays.Concatenate(temp, seedA);

                    // 2. c_{i,0} || c_{i,1} || ... || c_{i,n-1} = SHAKE128(b, 16n) (length in bits) where each c_{i,j} is parsed as a 16-bit integer in little-endian byte order format
                    IXof digest = new ShakeDigest(128);
                    digest.BlockUpdate(b, 0, b.Length);
                    digest.DoFinal(tmp, 0, tmp.Length);
                    for (j = 0; j < n; j++)
                    {
                        A[i * n + j] = (short) (Pack.LE_To_UInt16(tmp, 2 * j) % q);//todo add % q
                    }

                }

                return A;
            }

        }

        internal class Aes128MatrixGenerator
            : FrodoMatrixGenerator
        {
            BufferedBlockCipher cipher;

            public Aes128MatrixGenerator(int n, int q)
                : base(n, q)
            {
                cipher = new BufferedBlockCipher(new AesEngine());

            }

            internal override short[] GenMatrix(byte[] seedA)
            {
                //        """Generate matrix A using AES-128 (FrodoKEM specification, Algorithm 7)"""
                //        A = [[None for j in range(self.n)] for i in range(self.n)]
                short[] A = new short[n * n];
                byte[] b = new byte[16];
                byte[] c = new byte[16];
                byte[] temp = new byte[4];

                // 1. for i = 0; i < n; i += 1
                for (int i = 0; i < n; i++)
                {
                    // 2. for j = 0; j < n; j += 8
                    for (int j = 0; j < n; j += 8)
                    {

                        // 3. b = i || j || 0 || ... || 0 in {0,1}^128, where i and j are encoded as 16-bit integers in little-endian byte order
                        Pack.UInt16_To_LE((ushort) (i & 0xffff), temp);
                        Array.Copy(temp, 0, b, 0, 2);
                        Pack.UInt16_To_LE((ushort) (j & 0xffff), temp);
                        Array.Copy(temp, 0, b, 2, 2);
                        //                b = bytearray(16)
                        //                struct.pack_into('<H', b, 0, i)
                        //                struct.pack_into('<H', b, 2, j)
                        // 4. c = AES128(seedA, b)
                        Aes128(c, seedA, b);
                        // 5. for k = 0; k < 8; k += 1
                        for (int k = 0; k < 8; k++)
                        {
                            // 6. A[i][j+k] = c[k] where c is treated as a sequence of 8 16-bit integers each in little-endian byte order
                            A[i * n + j + k] = (short) (Pack.LE_To_UInt16(c, 2 * k) % q); //todo add % q
                        }
                    }
                }

                return A;
            }

            void Aes128(byte[] output, byte[] keyBytes, byte[] msg)
            {
                try
                {
                    KeyParameter kp = new KeyParameter(keyBytes);
                    cipher.Init(true, kp);
                    int len = cipher.ProcessBytes(msg, 0, msg.Length, output, 0);
                    cipher.DoFinal(output, len);
                }
                catch (InvalidCipherTextException e)
                {
                    throw new Exception(e.ToString(), e);
                }

            }
        }
    }
}
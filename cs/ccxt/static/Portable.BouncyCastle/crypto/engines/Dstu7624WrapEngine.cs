using System;
using System.Collections.Generic;

using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Engines
{
    public class Dstu7624WrapEngine
        : IWrapper
    {
        private KeyParameter param;
        private Dstu7624Engine engine;
        private bool forWrapping;
        private int blockSize;

        public Dstu7624WrapEngine(int blockSizeBits)
        {
            engine = new Dstu7624Engine(blockSizeBits);
            param = null;

            blockSize = blockSizeBits / 8;
        }

        public string AlgorithmName
        {
            get { return "Dstu7624WrapEngine"; }
        }

        public void Init(bool forWrapping, ICipherParameters parameters)
        {
            this.forWrapping = forWrapping;

            if (parameters is KeyParameter)
            {
                this.param = (KeyParameter)parameters;

                engine.Init(forWrapping, param);
            }
            else
            {
                throw new ArgumentException("Bad parameters passed to Dstu7624WrapEngine");
            }
        }

        public byte[] Wrap(byte[] input, int inOff, int length)
        {
            if (!forWrapping)
                throw new InvalidOperationException("Not set for wrapping");

            if (length % blockSize != 0)
                throw new ArgumentException("Padding not supported");

            int n = 2 * (1 + length / blockSize);
            int V = (n - 1) * 6;

            byte[] buffer = new byte[length + blockSize];
            Array.Copy(input, inOff, buffer, 0, length);
            //Console.WriteLine(Org.BouncyCastle.Utilities.Encoders.Hex.ToHexString(buffer));

            byte[] B = new byte[blockSize / 2];
            Array.Copy(buffer, 0, B, 0, blockSize / 2);
            //Console.WriteLine("B0: "+ Org.BouncyCastle.Utilities.Encoders.Hex.ToHexString(B));

            var bTemp = new List<byte[]>();
            int bHalfBlocksLen = buffer.Length - blockSize / 2;
            int bufOff = blockSize / 2;
            while (bHalfBlocksLen != 0)
            {
                byte[] temp = new byte[blockSize / 2];
                Array.Copy(buffer, bufOff, temp, 0, blockSize / 2);
                //Console.WriteLine(Org.BouncyCastle.Utilities.Encoders.Hex.ToHexString(buffer));
                //Console.WriteLine(buffer.Length);
                //Console.WriteLine("b: " + Org.BouncyCastle.Utilities.Encoders.Hex.ToHexString(temp));

                bTemp.Add(temp);

                bHalfBlocksLen -= blockSize / 2;
                bufOff += blockSize / 2;
            }

            for (int j = 0; j < V; j++)
            {
                Array.Copy(B, 0, buffer, 0, blockSize / 2);
                Array.Copy(bTemp[0], 0, buffer, blockSize / 2, blockSize / 2);

                engine.ProcessBlock(buffer, 0, buffer, 0);

                byte[] intArray = Pack.UInt32_To_LE((uint)(j + 1));
                for (int byteNum = 0; byteNum < intArray.Length; byteNum++)
                {
                    buffer[byteNum + blockSize / 2] ^= intArray[byteNum];
                }

                Array.Copy(buffer, blockSize / 2, B, 0, blockSize / 2);

                for (int i = 2; i < n; i++)
                {
                    Array.Copy(bTemp[i - 1], 0, bTemp[i - 2], 0, blockSize / 2);
                }

                Array.Copy(buffer, 0, bTemp[n - 2], 0, blockSize / 2);

                //Console.WriteLine("B" + j.ToString() + ": " + Org.BouncyCastle.Utilities.Encoders.Hex.ToHexString(B));
                //Console.WriteLine("b: " + Org.BouncyCastle.Utilities.Encoders.Hex.ToHexString(bTemp[0]));
                //Console.WriteLine("b: " + Org.BouncyCastle.Utilities.Encoders.Hex.ToHexString(bTemp[1]));
                //Console.WriteLine("b: " + Org.BouncyCastle.Utilities.Encoders.Hex.ToHexString(bTemp[2]));

                //Console.WriteLine(Org.BouncyCastle.Utilities.Encoders.Hex.ToHexString(buffer));
            }

            Array.Copy(B, 0, buffer, 0, blockSize / 2);
            bufOff = blockSize / 2;

            for (int i = 0; i < n - 1; i++)
            {
                Array.Copy((byte[])bTemp[i], 0, buffer, bufOff, blockSize / 2);
                bufOff += blockSize / 2;
            }

            return buffer;
        }

        public byte[] Unwrap(byte[] input, int inOff, int length)
        {
            if (forWrapping)
                throw new InvalidOperationException("not set for unwrapping");

            if (length % blockSize != 0)
                throw new ArgumentException("Padding not supported");

            int n = 2 * length / blockSize;
            int V = (n - 1) * 6;

            byte[] buffer = new byte[length];
            Array.Copy(input, inOff, buffer, 0, length);

            byte[] B = new byte[blockSize / 2];
            Array.Copy(buffer, 0, B, 0, blockSize / 2);
            //Console.WriteLine("B18: " + Org.BouncyCastle.Utilities.Encoders.Hex.ToHexString(B));

            var bTemp = new List<byte[]>();

            int bHalfBlocksLen = buffer.Length - blockSize / 2;
            int bufOff = blockSize / 2;
            while (bHalfBlocksLen != 0)
            {
                byte[] temp = new byte[blockSize / 2];
                Array.Copy(buffer, bufOff, temp, 0, blockSize / 2);
                //Console.WriteLine(Org.BouncyCastle.Utilities.Encoders.Hex.ToHexString(buffer));
                //Console.WriteLine(buffer.Length);
                //Console.WriteLine("b: " + Org.BouncyCastle.Utilities.Encoders.Hex.ToHexString(temp));

                bTemp.Add(temp);

                bHalfBlocksLen -= blockSize / 2;
                bufOff += blockSize / 2;
            }

            for (int j = 0; j < V; j++)
            {
                Array.Copy(bTemp[n - 2], 0, buffer, 0, blockSize / 2);
                Array.Copy(B, 0, buffer, blockSize / 2, blockSize / 2);

                byte[] intArray = Pack.UInt32_To_LE((uint)(V - j));
                for (int byteNum = 0; byteNum < intArray.Length; byteNum++)
                {
                    buffer[byteNum + blockSize / 2] ^= intArray[byteNum];
                }

                //Console.WriteLine(Org.BouncyCastle.Utilities.Encoders.Hex.ToHexString(buffer));

                engine.ProcessBlock(buffer, 0, buffer, 0);

                //Console.WriteLine(Org.BouncyCastle.Utilities.Encoders.Hex.ToHexString(buffer));

                Array.Copy(buffer, 0, B, 0, blockSize / 2);

                for (int i = 2; i < n; i++)
                {
                    Array.Copy(bTemp[n - i - 1], 0, bTemp[n - i], 0, blockSize / 2);
                }

                Array.Copy(buffer, blockSize / 2, bTemp[0], 0, blockSize / 2);

                //Console.WriteLine("B" + (V - j - 1).ToString() + ": " + Org.BouncyCastle.Utilities.Encoders.Hex.ToHexString(B));
                //Console.WriteLine("b: " + Org.BouncyCastle.Utilities.Encoders.Hex.ToHexString(bTemp[0]));
                //Console.WriteLine("b: " + Org.BouncyCastle.Utilities.Encoders.Hex.ToHexString(bTemp[1]));
                //Console.WriteLine("b: " + Org.BouncyCastle.Utilities.Encoders.Hex.ToHexString(bTemp[2]));

                //Console.WriteLine(Org.BouncyCastle.Utilities.Encoders.Hex.ToHexString(buffer));
            }

            Array.Copy(B, 0, buffer, 0, blockSize / 2);
            bufOff = blockSize / 2;

            for (int i = 0; i < n - 1; i++)
            {
                Array.Copy(bTemp[i], 0, buffer, bufOff, blockSize / 2);
                bufOff += blockSize / 2;
            }

            byte diff = 0;
            for (int i = buffer.Length - blockSize; i < buffer.Length; ++i)
            {
                diff |= buffer[i];
            }

            if (diff != 0)
                throw new InvalidCipherTextException("checksum failed");

            return Arrays.CopyOfRange(buffer, 0, buffer.Length - blockSize);
        }
    }
}

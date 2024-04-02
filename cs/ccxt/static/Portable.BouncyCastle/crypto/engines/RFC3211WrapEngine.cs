using System;

using Org.BouncyCastle.Crypto.Modes;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Crypto.Engines
{
	/**
	 * an implementation of the RFC 3211 Key Wrap
	 * Specification.
	 */
	public class Rfc3211WrapEngine
		: IWrapper
	{
		private CbcBlockCipher		engine;
		private ParametersWithIV	param;
		private bool				forWrapping;
		private SecureRandom		rand;

		public Rfc3211WrapEngine(
			IBlockCipher engine)
		{
			this.engine = new CbcBlockCipher(engine);
		}

        public virtual void Init(
			bool				forWrapping,
			ICipherParameters	param)
		{
			this.forWrapping = forWrapping;

			if (param is ParametersWithRandom)
			{
				ParametersWithRandom p = (ParametersWithRandom)param;

                this.rand = p.Random;
                this.param = p.Parameters as ParametersWithIV;
			}
			else
			{
				if (forWrapping)
				{
					rand = new SecureRandom();
				}

                this.param = param as ParametersWithIV;
            }

            if (null == this.param)
                throw new ArgumentException("RFC3211Wrap requires an IV", "param");
        }

        public virtual string AlgorithmName
		{
			get { return engine.UnderlyingCipher.AlgorithmName + "/RFC3211Wrap"; }
		}

        public virtual byte[] Wrap(
			byte[]	inBytes,
			int		inOff,
			int		inLen)
		{
			if (!forWrapping)
				throw new InvalidOperationException("not set for wrapping");
            if (inLen > 255 || inLen < 0)
                throw new ArgumentException("input must be from 0 to 255 bytes", "inLen");

            engine.Init(true, param);

			int blockSize = engine.GetBlockSize();
			byte[] cekBlock;

			if (inLen + 4 < blockSize * 2)
			{
				cekBlock = new byte[blockSize * 2];
			}
			else
			{
				cekBlock = new byte[(inLen + 4) % blockSize == 0 ? inLen + 4 : ((inLen + 4) / blockSize + 1) * blockSize];
			}

			cekBlock[0] = (byte)inLen;

			Array.Copy(inBytes, inOff, cekBlock, 4, inLen);

			rand.NextBytes(cekBlock, inLen + 4, cekBlock.Length - inLen - 4);

            cekBlock[1] = (byte)~cekBlock[4];
            cekBlock[2] = (byte)~cekBlock[4 + 1];
            cekBlock[3] = (byte)~cekBlock[4 + 2];

            for (int i = 0; i < cekBlock.Length; i += blockSize)
			{
				engine.ProcessBlock(cekBlock, i, cekBlock, i);
			}

			for (int i = 0; i < cekBlock.Length; i += blockSize)
			{
				engine.ProcessBlock(cekBlock, i, cekBlock, i);
			}

			return cekBlock;
		}

        public virtual byte[] Unwrap(
			byte[]	inBytes,
			int		inOff,
			int		inLen)
		{
			if (forWrapping)
			{
				throw new InvalidOperationException("not set for unwrapping");
			}

			int blockSize = engine.GetBlockSize();

			if (inLen < 2 * blockSize)
			{
				throw new InvalidCipherTextException("input too short");
			}

			byte[] cekBlock = new byte[inLen];
			byte[] iv = new byte[blockSize];

			Array.Copy(inBytes, inOff, cekBlock, 0, inLen);
			Array.Copy(inBytes, inOff, iv, 0, iv.Length);

			engine.Init(false, new ParametersWithIV(param.Parameters, iv));

			for (int i = blockSize; i < cekBlock.Length; i += blockSize)
			{
				engine.ProcessBlock(cekBlock, i, cekBlock, i);    
			}

			Array.Copy(cekBlock, cekBlock.Length - iv.Length, iv, 0, iv.Length);

			engine.Init(false, new ParametersWithIV(param.Parameters, iv));

			engine.ProcessBlock(cekBlock, 0, cekBlock, 0);

			engine.Init(false, param);

			for (int i = 0; i < cekBlock.Length; i += blockSize)
			{
				engine.ProcessBlock(cekBlock, i, cekBlock, i);
			}

            bool invalidLength = (int)cekBlock[0] > (cekBlock.Length - 4);

            byte[] key;
            if (invalidLength)
            {
                key = new byte[cekBlock.Length - 4];
            }
            else
            {
                key = new byte[cekBlock[0]];
            }

            Array.Copy(cekBlock, 4, key, 0, key.Length);

			// Note: Using constant time comparison
			int nonEqual = 0;
			for (int i = 0; i != 3; i++)
			{
				byte check = (byte)~cekBlock[1 + i];
                nonEqual |= (check ^ cekBlock[4 + i]);
            }

            Array.Clear(cekBlock, 0, cekBlock.Length);

            if (nonEqual != 0 | invalidLength)
                throw new InvalidCipherTextException("wrapped key corrupted");

            return key;
		}
	}
}

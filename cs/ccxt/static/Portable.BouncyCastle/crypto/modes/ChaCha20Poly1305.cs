using System;

using Org.BouncyCastle.Crypto.Engines;
using Org.BouncyCastle.Crypto.Macs;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Modes
{
    public class ChaCha20Poly1305
        : IAeadCipher
    {
        private enum State
        {
            Uninitialized  = 0,
            EncInit        = 1,
            EncAad         = 2,
            EncData        = 3,
            EncFinal       = 4,
            DecInit        = 5,
            DecAad         = 6,
            DecData        = 7,
            DecFinal       = 8,
        }

        private const int BufSize = 64;
        private const int KeySize = 32;
        private const int NonceSize = 12;
        private const int MacSize = 16;
        private static readonly byte[] Zeroes = new byte[MacSize - 1];

        private const ulong AadLimit = ulong.MaxValue;
        private const ulong DataLimit = ((1UL << 32) - 1) * 64;

        private readonly ChaCha7539Engine mChacha20;
        private readonly IMac mPoly1305;

        private readonly byte[] mKey = new byte[KeySize];
        private readonly byte[] mNonce = new byte[NonceSize];
        private readonly byte[] mBuf = new byte[BufSize + MacSize];
        private readonly byte[] mMac = new byte[MacSize];

        private byte[] mInitialAad;

        private ulong mAadCount;
        private ulong mDataCount;
        private State mState = State.Uninitialized;
        private int mBufPos;

        public ChaCha20Poly1305()
            : this(new Poly1305())
        {
        }

        public ChaCha20Poly1305(IMac poly1305)
        {
            if (null == poly1305)
                throw new ArgumentNullException("poly1305");
            if (MacSize != poly1305.GetMacSize())
                throw new ArgumentException("must be a 128-bit MAC", "poly1305");

            this.mChacha20 = new ChaCha7539Engine();
            this.mPoly1305 = poly1305;
        }

        public virtual string AlgorithmName
        {
            get { return "ChaCha20Poly1305"; }
        }

        public virtual void Init(bool forEncryption, ICipherParameters parameters)
        {
            KeyParameter initKeyParam;
            byte[] initNonce;
            ICipherParameters chacha20Params;

            if (parameters is AeadParameters)
            {
                AeadParameters aeadParams = (AeadParameters)parameters;

                int macSizeBits = aeadParams.MacSize;
                if ((MacSize * 8) != macSizeBits)
                    throw new ArgumentException("Invalid value for MAC size: " + macSizeBits);

                initKeyParam = aeadParams.Key;
                initNonce = aeadParams.GetNonce();
                chacha20Params = new ParametersWithIV(initKeyParam, initNonce);

                this.mInitialAad = aeadParams.GetAssociatedText();
            }
            else if (parameters is ParametersWithIV)
            {
                ParametersWithIV ivParams = (ParametersWithIV)parameters;

                initKeyParam = (KeyParameter)ivParams.Parameters;
                initNonce = ivParams.GetIV();
                chacha20Params = ivParams;

                this.mInitialAad = null;
            }
            else
            {
                throw new ArgumentException("invalid parameters passed to ChaCha20Poly1305", "parameters");
            }

            // Validate key
            if (null == initKeyParam)
            {
                if (State.Uninitialized == mState)
                    throw new ArgumentException("Key must be specified in initial init");
            }
            else
            {
                if (KeySize != initKeyParam.GetKey().Length)
                    throw new ArgumentException("Key must be 256 bits");
            }

            // Validate nonce
            if (null == initNonce || NonceSize != initNonce.Length)
                throw new ArgumentException("Nonce must be 96 bits");

            // Check for encryption with reused nonce
            if (State.Uninitialized != mState && forEncryption && Arrays.AreEqual(mNonce, initNonce))
            {
                if (null == initKeyParam || Arrays.AreEqual(mKey, initKeyParam.GetKey()))
                    throw new ArgumentException("cannot reuse nonce for ChaCha20Poly1305 encryption");
            }

            if (null != initKeyParam)
            {
                Array.Copy(initKeyParam.GetKey(), 0, mKey, 0, KeySize);
            }

            Array.Copy(initNonce, 0, mNonce, 0, NonceSize);

            mChacha20.Init(true, chacha20Params);

            this.mState = forEncryption ? State.EncInit : State.DecInit;

            Reset(true, false);
        }

        public virtual int GetOutputSize(int len)
        {
            int total = System.Math.Max(0, len) + mBufPos;

            switch (mState)
            {
            case State.DecInit:
            case State.DecAad:
            case State.DecData:
                return System.Math.Max(0, total - MacSize);
            case State.EncInit:
            case State.EncAad:
            case State.EncData:
                return total + MacSize;
            default:
                throw new InvalidOperationException();
            }
        }

        public virtual int GetUpdateOutputSize(int len)
        {
            int total = System.Math.Max(0, len) + mBufPos;

            switch (mState)
            {
            case State.DecInit:
            case State.DecAad:
            case State.DecData:
                total = System.Math.Max(0, total - MacSize);
                break;
            case State.EncInit:
            case State.EncAad:
            case State.EncData:
                break;
            default:
                throw new InvalidOperationException();
            }

            return total - (total % BufSize);
        }

        public virtual void ProcessAadByte(byte input)
        {
            CheckAad();

            this.mAadCount = IncrementCount(mAadCount, 1, AadLimit);
            mPoly1305.Update(input);
        }

        public virtual void ProcessAadBytes(byte[] inBytes, int inOff, int len)
        {
            if (null == inBytes)
                throw new ArgumentNullException("inBytes");
            if (inOff < 0)
                throw new ArgumentException("cannot be negative", "inOff");
            if (len < 0)
                throw new ArgumentException("cannot be negative", "len");
            Check.DataLength(inBytes, inOff, len, "input buffer too short");

            CheckAad();

            if (len > 0)
            {
                this.mAadCount = IncrementCount(mAadCount, (uint)len, AadLimit);
                mPoly1305.BlockUpdate(inBytes, inOff, len);
            }
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public virtual void ProcessAadBytes(ReadOnlySpan<byte> input)
        {
            CheckAad();

            if (!input.IsEmpty)
            {
                this.mAadCount = IncrementCount(mAadCount, (uint)input.Length, AadLimit);
                mPoly1305.BlockUpdate(input);
            }
        }
#endif

        public virtual int ProcessByte(byte input, byte[] outBytes, int outOff)
        {
            CheckData();

            switch (mState)
            {
            case State.DecData:
            {
                mBuf[mBufPos] = input;
                if (++mBufPos == mBuf.Length)
                {
                    mPoly1305.BlockUpdate(mBuf, 0, BufSize);
#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
                    ProcessBlock(mBuf, outBytes.AsSpan(outOff));
#else
                    ProcessBlock(mBuf, 0, outBytes, outOff);
#endif
                    Array.Copy(mBuf, BufSize, mBuf, 0, MacSize);
                    this.mBufPos = MacSize;
                    return BufSize;
                }

                return 0;
            }
            case State.EncData:
            {
                mBuf[mBufPos] = input;
                if (++mBufPos == BufSize)
                {
#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
                    ProcessBlock(mBuf, outBytes.AsSpan(outOff));
#else
                    ProcessBlock(mBuf, 0, outBytes, outOff);
#endif
                    mPoly1305.BlockUpdate(outBytes, outOff, BufSize);
                    this.mBufPos = 0;
                    return BufSize;
                }

                return 0;
            }
            default:
                throw new InvalidOperationException();
            }
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public virtual int ProcessByte(byte input, Span<byte> output)
        {
            CheckData();

            switch (mState)
            {
            case State.DecData:
            {
                mBuf[mBufPos] = input;
                if (++mBufPos == mBuf.Length)
                {
                    mPoly1305.BlockUpdate(mBuf.AsSpan(0, BufSize));
                    ProcessBlock(mBuf, output);
                    Array.Copy(mBuf, BufSize, mBuf, 0, MacSize);
                    this.mBufPos = MacSize;
                    return BufSize;
                }

                return 0;
            }
            case State.EncData:
            {
                mBuf[mBufPos] = input;
                if (++mBufPos == BufSize)
                {
                    ProcessBlock(mBuf, output);
                    mPoly1305.BlockUpdate(output[..BufSize]);
                    this.mBufPos = 0;
                    return BufSize;
                }

                return 0;
            }
            default:
                throw new InvalidOperationException();
            }
        }
#endif

        public virtual int ProcessBytes(byte[] inBytes, int inOff, int len, byte[] outBytes, int outOff)
        {
            if (null == inBytes)
                throw new ArgumentNullException("inBytes");
            /*
             * Following bc-java, we allow null when no output is expected (e.g. based on a
             * GetUpdateOutputSize call).
             */
            if (null == outBytes)
            {
                //throw new ArgumentNullException("outBytes");
            }
            if (inOff < 0)
                throw new ArgumentException("cannot be negative", "inOff");
            if (len < 0)
                throw new ArgumentException("cannot be negative", "len");
            Check.DataLength(inBytes, inOff, len, "input buffer too short");
            if (outOff < 0)
                throw new ArgumentException("cannot be negative", "outOff");

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
            return ProcessBytes(inBytes.AsSpan(inOff, len), Spans.FromNullable(outBytes, outOff));
#else
            CheckData();

            int resultLen = 0;

            switch (mState)
            {
            case State.DecData:
            {
                int available = mBuf.Length - mBufPos;
                if (len < available)
                {
                    Array.Copy(inBytes, inOff, mBuf, mBufPos, len);
                    mBufPos += len;
                    break;
                }

                if (mBufPos >= BufSize)
                {
                    mPoly1305.BlockUpdate(mBuf, 0, BufSize);
                    ProcessBlock(mBuf, 0, outBytes, outOff);
                    Array.Copy(mBuf, BufSize, mBuf, 0, mBufPos -= BufSize);
                    resultLen = BufSize;

                    available += BufSize;
                    if (len < available)
                    {
                        Array.Copy(inBytes, inOff, mBuf, mBufPos, len);
                        mBufPos += len;
                        break;
                    }
                }

                int inLimit1 = inOff + len - mBuf.Length;
                int inLimit2 = inLimit1 - BufSize;

                available = BufSize - mBufPos;
                Array.Copy(inBytes, inOff, mBuf, mBufPos, available);
                mPoly1305.BlockUpdate(mBuf, 0, BufSize);
                ProcessBlock(mBuf, 0, outBytes, outOff + resultLen);
                inOff += available;
                resultLen += BufSize;

                while (inOff <= inLimit2)
                {
                    mPoly1305.BlockUpdate(inBytes, inOff, BufSize * 2);
                    ProcessBlocks2(inBytes, inOff, outBytes, outOff + resultLen);
                    inOff += BufSize * 2;
                    resultLen += BufSize * 2;
                }

                if (inOff <= inLimit1)
                {
                    mPoly1305.BlockUpdate(inBytes, inOff, BufSize);
                    ProcessBlock(inBytes, inOff, outBytes, outOff + resultLen);
                    inOff += BufSize;
                    resultLen += BufSize;
                }

                mBufPos = mBuf.Length + inLimit1 - inOff;
                Array.Copy(inBytes, inOff, mBuf, 0, mBufPos);
                break;
            }
            case State.EncData:
            {
                int available = BufSize - mBufPos;
                if (len < available)
                {
                    Array.Copy(inBytes, inOff, mBuf, mBufPos, len);
                    mBufPos += len;
                    break;
                }

                int inLimit1 = inOff + len - BufSize;
                int inLimit2 = inLimit1 - BufSize;

                if (mBufPos > 0)
                {
                    Array.Copy(inBytes, inOff, mBuf, mBufPos, available);
                    ProcessBlock(mBuf, 0, outBytes, outOff);
                    inOff += available;
                    resultLen = BufSize;
                }

                while (inOff <= inLimit2)
                {
                    ProcessBlocks2(inBytes, inOff, outBytes, outOff + resultLen);
                    inOff += BufSize * 2;
                    resultLen += BufSize * 2;
                }

                if (inOff <= inLimit1)
                {
                    ProcessBlock(inBytes, inOff, outBytes, outOff + resultLen);
                    inOff += BufSize;
                    resultLen += BufSize;
                }

                mPoly1305.BlockUpdate(outBytes, outOff, resultLen);

                mBufPos = BufSize + inLimit1 - inOff;
                Array.Copy(inBytes, inOff, mBuf, 0, mBufPos);
                break;
            }
            default:
                throw new InvalidOperationException();
            }

            return resultLen;
#endif
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public virtual int ProcessBytes(ReadOnlySpan<byte> input, Span<byte> output)
        {
            CheckData();

            int resultLen = 0;

            switch (mState)
            {
            case State.DecData:
            {
                int available = mBuf.Length - mBufPos;
                if (input.Length < available)
                {
                    input.CopyTo(mBuf.AsSpan(mBufPos));
                    mBufPos += input.Length;
                    break;
                }

                if (mBufPos >= BufSize)
                {
                    mPoly1305.BlockUpdate(mBuf.AsSpan(0, BufSize));
                    ProcessBlock(mBuf, output);
                    Array.Copy(mBuf, BufSize, mBuf, 0, mBufPos -= BufSize);
                    resultLen = BufSize;

                    available += BufSize;
                    if (input.Length < available)
                    {
                        input.CopyTo(mBuf.AsSpan(mBufPos));
                        mBufPos += input.Length;
                        break;
                    }
                }

                int inLimit1 = mBuf.Length;
                int inLimit2 = inLimit1 + BufSize;

                available = BufSize - mBufPos;
                input[..available].CopyTo(mBuf.AsSpan(mBufPos));
                mPoly1305.BlockUpdate(mBuf.AsSpan(0, BufSize));
                ProcessBlock(mBuf, output[resultLen..]);
                input = input[available..];
                resultLen += BufSize;

                while (input.Length >= inLimit2)
                {
                    mPoly1305.BlockUpdate(input[..(BufSize * 2)]);
                    ProcessBlocks2(input, output[resultLen..]);
                    input = input[(BufSize * 2)..];
                    resultLen += BufSize * 2;
                }

                if (input.Length >= inLimit1)
                {
                    mPoly1305.BlockUpdate(input[..BufSize]);
                    ProcessBlock(input, output[resultLen..]);
                    input = input[BufSize..];
                    resultLen += BufSize;
                }

                mBufPos = input.Length;
                input.CopyTo(mBuf);
                break;
            }
            case State.EncData:
            {
                int available = BufSize - mBufPos;
                if (input.Length < available)
                {
                    input.CopyTo(mBuf.AsSpan(mBufPos));
                    mBufPos += input.Length;
                    break;
                }

                if (mBufPos > 0)
                {
                    input[..available].CopyTo(mBuf.AsSpan(mBufPos));
                    ProcessBlock(mBuf, output);
                    input = input[available..];
                    resultLen = BufSize;
                }

                while (input.Length >= BufSize * 2)
                {
                    ProcessBlocks2(input, output[resultLen..]);
                    input = input[(BufSize * 2)..];
                    resultLen += BufSize * 2;
                }

                if (input.Length >= BufSize)
                {
                    ProcessBlock(input, output[resultLen..]);
                    input = input[BufSize..];
                    resultLen += BufSize;
                }

                mPoly1305.BlockUpdate(output[..resultLen]);

                mBufPos = input.Length;
                input.CopyTo(mBuf);
                break;
            }
            default:
                throw new InvalidOperationException();
            }

            return resultLen;
        }
#endif

        public virtual int DoFinal(byte[] outBytes, int outOff)
        {
            if (null == outBytes)
                throw new ArgumentNullException("outBytes");
            if (outOff < 0)
                throw new ArgumentException("cannot be negative", "outOff");

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
            return DoFinal(outBytes.AsSpan(outOff));
#else
            CheckData();

            Array.Clear(mMac, 0, MacSize);

            int resultLen = 0;

            switch (mState)
            {
            case State.DecData:
            {
                if (mBufPos < MacSize)
                    throw new InvalidCipherTextException("data too short");

                resultLen = mBufPos - MacSize;

                Check.OutputLength(outBytes, outOff, resultLen, "output buffer too short");

                if (resultLen > 0)
                {
                    mPoly1305.BlockUpdate(mBuf, 0, resultLen);
                    ProcessData(mBuf, 0, resultLen, outBytes, outOff);
                }

                FinishData(State.DecFinal);

                if (!Arrays.ConstantTimeAreEqual(MacSize, mMac, 0, mBuf, resultLen))
                    throw new InvalidCipherTextException("mac check in ChaCha20Poly1305 failed");

                break;
            }
            case State.EncData:
            {
                resultLen = mBufPos + MacSize;

                Check.OutputLength(outBytes, outOff, resultLen, "output buffer too short");

                if (mBufPos > 0)
                {
                    ProcessData(mBuf, 0, mBufPos, outBytes, outOff);
                    mPoly1305.BlockUpdate(outBytes, outOff, mBufPos);
                }

                FinishData(State.EncFinal);

                Array.Copy(mMac, 0, outBytes, outOff + mBufPos, MacSize);
                break;
            }
            default:
                throw new InvalidOperationException();
            }

            Reset(false, true);

            return resultLen;
#endif
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public virtual int DoFinal(Span<byte> output)
        {
            CheckData();

            Array.Clear(mMac, 0, MacSize);

            int resultLen = 0;

            switch (mState)
            {
            case State.DecData:
            {
                if (mBufPos < MacSize)
                    throw new InvalidCipherTextException("data too short");

                resultLen = mBufPos - MacSize;

                Check.OutputLength(output, resultLen, "output buffer too short");

                if (resultLen > 0)
                {
                    mPoly1305.BlockUpdate(mBuf, 0, resultLen);
                    ProcessData(mBuf.AsSpan(0, resultLen), output);
                }

                FinishData(State.DecFinal);

                if (!Arrays.ConstantTimeAreEqual(MacSize, mMac, 0, mBuf, resultLen))
                    throw new InvalidCipherTextException("mac check in ChaCha20Poly1305 failed");

                break;
            }
            case State.EncData:
            {
                resultLen = mBufPos + MacSize;

                Check.OutputLength(output, resultLen, "output buffer too short");

                if (mBufPos > 0)
                {
                    ProcessData(mBuf.AsSpan(0, mBufPos), output);
                    mPoly1305.BlockUpdate(output[..mBufPos]);
                }

                FinishData(State.EncFinal);

                mMac.AsSpan(0, MacSize).CopyTo(output[mBufPos..]);
                break;
            }
            default:
                throw new InvalidOperationException();
            }

            Reset(false, true);

            return resultLen;
        }
#endif

        public virtual byte[] GetMac()
        {
            return Arrays.Clone(mMac);
        }

        public virtual void Reset()
        {
            Reset(true, true);
        }

        private void CheckAad()
        {
            switch (mState)
            {
            case State.DecInit:
                this.mState = State.DecAad;
                break;
            case State.EncInit:
                this.mState = State.EncAad;
                break;
            case State.DecAad:
            case State.EncAad:
                break;
            case State.EncFinal:
                throw new InvalidOperationException("ChaCha20Poly1305 cannot be reused for encryption");
            default:
                throw new InvalidOperationException();
            }
        }

        private void CheckData()
        {
            switch (mState)
            {
            case State.DecInit:
            case State.DecAad:
                FinishAad(State.DecData);
                break;
            case State.EncInit:
            case State.EncAad:
                FinishAad(State.EncData);
                break;
            case State.DecData:
            case State.EncData:
                break;
            case State.EncFinal:
                throw new InvalidOperationException("ChaCha20Poly1305 cannot be reused for encryption");
            default:
                throw new InvalidOperationException();
            }
        }

        private void FinishAad(State nextState)
        {
            PadMac(mAadCount);

            this.mState = nextState;
        }

        private void FinishData(State nextState)
        {
            PadMac(mDataCount);

            byte[] lengths = new byte[16];
            Pack.UInt64_To_LE(mAadCount, lengths, 0);
            Pack.UInt64_To_LE(mDataCount, lengths, 8);
            mPoly1305.BlockUpdate(lengths, 0, 16);

            mPoly1305.DoFinal(mMac, 0);

            this.mState = nextState;
        }

        private ulong IncrementCount(ulong count, uint increment, ulong limit)
        {
            if (count > (limit - increment))
                throw new InvalidOperationException ("Limit exceeded");

            return count + increment;
        }

        private void InitMac()
        {
            byte[] firstBlock = new byte[64];
            try
            {
                mChacha20.ProcessBytes(firstBlock, 0, 64, firstBlock, 0);
                mPoly1305.Init(new KeyParameter(firstBlock, 0, 32));
            }
            finally
            {
                Array.Clear(firstBlock, 0, 64);
            }
        }

        private void PadMac(ulong count)
        {
            int partial = (int)count & (MacSize - 1);
            if (0 != partial)
            {
                mPoly1305.BlockUpdate(Zeroes, 0, MacSize - partial);
            }
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        private void ProcessBlock(ReadOnlySpan<byte> input, Span<byte> output)
        {
            Check.OutputLength(output, 64, "output buffer too short");

            mChacha20.ProcessBlock(input, output);

            this.mDataCount = IncrementCount(mDataCount, 64U, DataLimit);
        }

        private void ProcessBlocks2(ReadOnlySpan<byte> input, Span<byte> output)
        {
            Check.OutputLength(output, 128, "output buffer too short");

            mChacha20.ProcessBlocks2(input, output);

            this.mDataCount = IncrementCount(mDataCount, 128U, DataLimit);
        }

        private void ProcessData(ReadOnlySpan<byte> input, Span<byte> output)
        {
            Check.OutputLength(output, input.Length, "output buffer too short");

            mChacha20.ProcessBytes(input, output);

            this.mDataCount = IncrementCount(mDataCount, (uint)input.Length, DataLimit);
        }
#else
        private void ProcessBlock(byte[] inBytes, int inOff, byte[] outBytes, int outOff)
        {
            Check.OutputLength(outBytes, outOff, 64, "output buffer too short");

            mChacha20.ProcessBlock(inBytes, inOff, outBytes, outOff);

            this.mDataCount = IncrementCount(mDataCount, 64U, DataLimit);
        }

        private void ProcessBlocks2(byte[] inBytes, int inOff, byte[] outBytes, int outOff)
        {
            Check.OutputLength(outBytes, outOff, 128, "output buffer too short");

            mChacha20.ProcessBlocks2(inBytes, inOff, outBytes, outOff);

            this.mDataCount = IncrementCount(mDataCount, 128U, DataLimit);
        }

        private void ProcessData(byte[] inBytes, int inOff, int inLen, byte[] outBytes, int outOff)
        {
            Check.OutputLength(outBytes, outOff, inLen, "output buffer too short");

            mChacha20.ProcessBytes(inBytes, inOff, inLen, outBytes, outOff);

            this.mDataCount = IncrementCount(mDataCount, (uint)inLen, DataLimit);
        }
#endif

        private void Reset(bool clearMac, bool resetCipher)
        {
            Array.Clear(mBuf, 0, mBuf.Length);

            if (clearMac)
            {
                Array.Clear(mMac, 0, mMac.Length);
            }

            this.mAadCount = 0UL;
            this.mDataCount = 0UL;
            this.mBufPos = 0;

            switch (mState)
            {
            case State.DecInit:
            case State.EncInit:
                break;
            case State.DecAad:
            case State.DecData:
            case State.DecFinal:
                this.mState = State.DecInit;
                break;
            case State.EncAad:
            case State.EncData:
            case State.EncFinal:
                this.mState = State.EncFinal;
                return;
            default:
                throw new InvalidOperationException();
            }

            if (resetCipher)
            {
                mChacha20.Reset();
            }

            InitMac();

            if (null != mInitialAad)
            {
                ProcessAadBytes(mInitialAad, 0, mInitialAad.Length);
            }
        }
    }
}

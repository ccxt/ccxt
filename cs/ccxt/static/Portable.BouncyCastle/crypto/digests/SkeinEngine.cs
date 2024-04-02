using System;
using System.Collections.Generic;

using Org.BouncyCastle.Crypto.Engines;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Crypto.Utilities;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.Collections;

namespace Org.BouncyCastle.Crypto.Digests
{

    /// <summary>
    /// Implementation of the Skein family of parameterised hash functions in 256, 512 and 1024 bit block
    /// sizes, based on the <see cref="Org.BouncyCastle.Crypto.Engines.ThreefishEngine">Threefish</see> tweakable block cipher.
    /// </summary>
    /// <remarks>
    /// This is the 1.3 version of Skein defined in the Skein hash function submission to the NIST SHA-3
    /// competition in October 2010.
    /// <p/>
    /// Skein was designed by Niels Ferguson - Stefan Lucks - Bruce Schneier - Doug Whiting - Mihir
    /// Bellare - Tadayoshi Kohno - Jon Callas - Jesse Walker.
    /// <p/>
    /// This implementation is the basis for <see cref="Org.BouncyCastle.Crypto.Digests.SkeinDigest"/> and <see cref="Org.BouncyCastle.Crypto.Macs.SkeinMac"/>, implementing the
    /// parameter based configuration system that allows Skein to be adapted to multiple applications. <br/>
    /// Initialising the engine with <see cref="Org.BouncyCastle.Crypto.Parameters.SkeinParameters"/> allows standard and arbitrary parameters to
    /// be applied during the Skein hash function.
    /// <p/>
    /// Implemented:
    /// <ul>
    /// <li>256, 512 and 1024 bit internal states.</li>
    /// <li>Full 96 bit input length.</li>
    /// <li>Parameters defined in the Skein specification, and arbitrary other pre and post message
    /// parameters.</li>
    /// <li>Arbitrary output size in 1 byte intervals.</li>
    /// </ul>
    /// <p/>
    /// Not implemented:
    /// <ul>
    /// <li>Sub-byte length input (bit padding).</li>
    /// <li>Tree hashing.</li>
    /// </ul>
    /// </remarks>
    /// <seealso cref="Org.BouncyCastle.Crypto.Parameters.SkeinParameters"/>
    public class SkeinEngine
        : IMemoable
    {
        /// <summary>
        /// 256 bit block size - Skein-256
        /// </summary>
        public const int SKEIN_256 = ThreefishEngine.BLOCKSIZE_256;
        /// <summary>
        /// 512 bit block size - Skein-512
        /// </summary>
        public const int SKEIN_512 = ThreefishEngine.BLOCKSIZE_512;
        /// <summary>
        /// 1024 bit block size - Skein-1024
        /// </summary>
        public const int SKEIN_1024 = ThreefishEngine.BLOCKSIZE_1024;

        // Minimal at present, but more complex when tree hashing is implemented
        private class Configuration
        {
            private byte[] bytes = new byte[32];

            public Configuration(long outputSizeBits)
            {
                // 0..3 = ASCII SHA3
                bytes[0] = (byte)'S';
                bytes[1] = (byte)'H';
                bytes[2] = (byte)'A';
                bytes[3] = (byte)'3';

                // 4..5 = version number in LSB order
                bytes[4] = 1;
                bytes[5] = 0;

                // 8..15 = output length
                Pack.UInt64_To_LE((ulong)outputSizeBits, bytes, 8);
            }

            public byte[] Bytes
            {
                get { return bytes; }
            }

        }

        public class Parameter
        {
            private int type;
            private byte[] value;

            public Parameter(int type, byte[] value)
            {
                this.type = type;
                this.value = value;
            }

            public int Type
            {
                get { return type; }
            }

            public byte[] Value
            {
                get { return value; }
            }

        }

        /**
         * The parameter type for the Skein key.
         */
        private const int PARAM_TYPE_KEY = 0;

        /**
         * The parameter type for the Skein configuration block.
         */
        private const int PARAM_TYPE_CONFIG = 4;

        /**
         * The parameter type for the message.
         */
        private const int PARAM_TYPE_MESSAGE = 48;

        /**
         * The parameter type for the output transformation.
         */
        private const int PARAM_TYPE_OUTPUT = 63;

        /**
         * Precalculated UBI(CFG) states for common state/output combinations without key or other
         * pre-message params.
         */
        private static readonly IDictionary<int, ulong[]> InitialStates = new Dictionary<int, ulong[]>();

        static SkeinEngine()
        {
            // From Appendix C of the Skein 1.3 NIST submission
            InitialState(SKEIN_256, 128, new ulong[]{
                0xe1111906964d7260UL,
                0x883daaa77c8d811cUL,
                0x10080df491960f7aUL,
                0xccf7dde5b45bc1c2UL});

            InitialState(SKEIN_256, 160, new ulong[]{
                0x1420231472825e98UL,
                0x2ac4e9a25a77e590UL,
                0xd47a58568838d63eUL,
                0x2dd2e4968586ab7dUL});

            InitialState(SKEIN_256, 224, new ulong[]{
                0xc6098a8c9ae5ea0bUL,
                0x876d568608c5191cUL,
                0x99cb88d7d7f53884UL,
                0x384bddb1aeddb5deUL});

            InitialState(SKEIN_256, 256, new ulong[]{
                0xfc9da860d048b449UL,
                0x2fca66479fa7d833UL,
                0xb33bc3896656840fUL,
                0x6a54e920fde8da69UL});

            InitialState(SKEIN_512, 128, new ulong[]{
                0xa8bc7bf36fbf9f52UL,
                0x1e9872cebd1af0aaUL,
                0x309b1790b32190d3UL,
                0xbcfbb8543f94805cUL,
                0x0da61bcd6e31b11bUL,
                0x1a18ebead46a32e3UL,
                0xa2cc5b18ce84aa82UL,
                0x6982ab289d46982dUL});

            InitialState(SKEIN_512, 160, new ulong[]{
                0x28b81a2ae013bd91UL,
                0xc2f11668b5bdf78fUL,
                0x1760d8f3f6a56f12UL,
                0x4fb747588239904fUL,
                0x21ede07f7eaf5056UL,
                0xd908922e63ed70b8UL,
                0xb8ec76ffeccb52faUL,
                0x01a47bb8a3f27a6eUL});

            InitialState(SKEIN_512, 224, new ulong[]{
                0xccd0616248677224UL,
                0xcba65cf3a92339efUL,
                0x8ccd69d652ff4b64UL,
                0x398aed7b3ab890b4UL,
                0x0f59d1b1457d2bd0UL,
                0x6776fe6575d4eb3dUL,
                0x99fbc70e997413e9UL,
                0x9e2cfccfe1c41ef7UL});

            InitialState(SKEIN_512, 384, new ulong[]{
                0xa3f6c6bf3a75ef5fUL,
                0xb0fef9ccfd84faa4UL,
                0x9d77dd663d770cfeUL,
                0xd798cbf3b468fddaUL,
                0x1bc4a6668a0e4465UL,
                0x7ed7d434e5807407UL,
                0x548fc1acd4ec44d6UL,
                0x266e17546aa18ff8UL});

            InitialState(SKEIN_512, 512, new ulong[]{
                0x4903adff749c51ceUL,
                0x0d95de399746df03UL,
                0x8fd1934127c79bceUL,
                0x9a255629ff352cb1UL,
                0x5db62599df6ca7b0UL,
                0xeabe394ca9d5c3f4UL,
                0x991112c71a75b523UL,
                0xae18a40b660fcc33UL});
        }

        private static void InitialState(int blockSize, int outputSize, ulong[] state)
        {
            InitialStates.Add(VariantIdentifier(blockSize / 8, outputSize / 8), state);
        }

        private static int VariantIdentifier(int blockSizeBytes, int outputSizeBytes)
        {
            return (outputSizeBytes << 16) | blockSizeBytes;
        }

        private class UbiTweak
        {
            /**
             * Point at which position might overflow long, so switch to add with carry logic
             */
            private const ulong LOW_RANGE = ulong.MaxValue - uint.MaxValue;

            /**
             * Bit 127 = final
             */
            private const ulong T1_FINAL = 1UL << 63;

            /**
             * Bit 126 = first
             */
            private const ulong T1_FIRST = 1UL << 62;

            /**
             * UBI uses a 128 bit tweak
             */
            private ulong[] tweak = new ulong[2];

            /**
             * Whether 64 bit position exceeded
             */
            private bool extendedPosition;

            public UbiTweak()
            {
                Reset();
            }

            public void Reset(UbiTweak tweak)
            {
                this.tweak = Arrays.Clone(tweak.tweak, this.tweak);
                this.extendedPosition = tweak.extendedPosition;
            }

            public void Reset()
            {
                tweak[0] = 0;
                tweak[1] = 0;
                extendedPosition = false;
                First = true;
            }

            public uint Type 
            {
                get 
                {
                    return (uint)((tweak[1] >> 56) & 0x3FUL);
                }

                set 
                {
                    // Bits 120..125 = type
                    tweak[1] = (tweak[1] & 0xFFFFFFC000000000UL) | ((value & 0x3FUL) << 56);
                }
            }

            public bool First
            {
                get
                {
                    return ((tweak[1] & T1_FIRST) != 0);
                }
                set
                {
                    if (value)
                    {
                        tweak[1] |= T1_FIRST;
                    }
                    else
                    {
                        tweak[1] &= ~T1_FIRST;
                    }
                }
            }

            public bool Final
            {
                get
                {
                    return ((tweak[1] & T1_FINAL) != 0);
                }
                set
                {
                    if (value)
                    {
                        tweak[1] |= T1_FINAL;
                    }
                    else
                    {
                        tweak[1] &= ~T1_FINAL;
                    }
                }
            }

            /**
             * Advances the position in the tweak by the specified value.
             */
            public void AdvancePosition(int advance)
            {
                // Bits 0..95 = position
                if (extendedPosition)
                {
                    ulong[] parts = new ulong[3];
                    parts[0] = tweak[0] & 0xFFFFFFFFUL;
                    parts[1] = (tweak[0] >> 32) & 0xFFFFFFFFUL;
                    parts[2] = tweak[1] & 0xFFFFFFFFUL;

                    ulong carry = (ulong)advance;
                    for (int i = 0; i < parts.Length; i++)
                    {
                        carry += parts[i];
                        parts[i] = carry;
                        carry >>= 32;
                    }
                    tweak[0] = ((parts[1] & 0xFFFFFFFFUL) << 32) | (parts[0] & 0xFFFFFFFFUL);
                    tweak[1] = (tweak[1] & 0xFFFFFFFF00000000UL) | (parts[2] & 0xFFFFFFFFUL);
                }
                else
                {
                    ulong position = tweak[0];
                    position += (uint)advance;
                    tweak[0] = position;
                    if (position > LOW_RANGE)
                    {
                        extendedPosition = true;
                    }
                }
            }

            public ulong[] GetWords()
            {
                return tweak;
            }

            public override string ToString()
            {
                return Type + " first: " + First + ", final: " + Final;
            }

        }

        /**
         * The Unique Block Iteration chaining mode.
         */
        // TODO: This might be better as methods...
        private class UBI
        {
            private readonly UbiTweak tweak = new UbiTweak();

            private readonly SkeinEngine engine;

            /**
             * Buffer for the current block of message data
             */
            private byte[] currentBlock;

            /**
             * Offset into the current message block
             */
            private int currentOffset;

            /**
             * Buffer for message words for feedback into encrypted block
             */
            private ulong[] message;

            public UBI(SkeinEngine engine, int blockSize)
            {
                this.engine = engine;
                currentBlock = new byte[blockSize];
                message = new ulong[currentBlock.Length / 8];
            }

            public void Reset(UBI ubi)
            {
                currentBlock = Arrays.Clone(ubi.currentBlock, currentBlock);
                currentOffset = ubi.currentOffset;
                message = Arrays.Clone(ubi.message, this.message);
                tweak.Reset(ubi.tweak);
            }

            public void Reset(int type)
            {
                tweak.Reset();
                tweak.Type = (uint)type;
                currentOffset = 0;
            }

            public void Update(byte[] value, int offset, int len, ulong[] output)
            {
                /*
                 * Buffer complete blocks for the underlying Threefish cipher, only flushing when there
                 * are subsequent bytes (last block must be processed in doFinal() with final=true set).
                 */
                int copied = 0;
                while (len > copied)
                {
                    if (currentOffset == currentBlock.Length)
                    {
                        ProcessBlock(output);
                        tweak.First = false;
                        currentOffset = 0;
                    }

                    int toCopy = System.Math.Min(len - copied, currentBlock.Length - currentOffset);
                    Array.Copy(value, offset + copied, currentBlock, currentOffset, toCopy);
                    copied += toCopy;
                    currentOffset += toCopy;
                    tweak.AdvancePosition(toCopy);
                }
            }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
            public void Update(ReadOnlySpan<byte> input, ulong[] output)
            {
                /*
                 * Buffer complete blocks for the underlying Threefish cipher, only flushing when there
                 * are subsequent bytes (last block must be processed in doFinal() with final=true set).
                 */
                int copied = 0, len = input.Length;
                while (len > copied)
                {
                    if (currentOffset == currentBlock.Length)
                    {
                        ProcessBlock(output);
                        tweak.First = false;
                        currentOffset = 0;
                    }

                    int toCopy = System.Math.Min(len - copied, currentBlock.Length - currentOffset);
                    input.Slice(copied, toCopy).CopyTo(currentBlock.AsSpan(currentOffset));
                    copied += toCopy;
                    currentOffset += toCopy;
                    tweak.AdvancePosition(toCopy);
                }
            }
#endif

            private void ProcessBlock(ulong[] output)
            {
                engine.threefish.Init(true, engine.chain, tweak.GetWords());
                Pack.LE_To_UInt64(currentBlock, 0, message);

                engine.threefish.ProcessBlock(message, output);

                for (int i = 0; i < output.Length; i++)
                {
                    output[i] ^= message[i];
                }
            }

            public void DoFinal(ulong[] output)
            {
                // Pad remainder of current block with zeroes
                for (int i = currentOffset; i < currentBlock.Length; i++)
                {
                    currentBlock[i] = 0;
                }

                tweak.Final = true;
                ProcessBlock(output);
            }
        }

        /**
         * Underlying Threefish tweakable block cipher
         */
        private readonly ThreefishEngine threefish;

        /**
         * Size of the digest output, in bytes
         */
        private readonly int outputSizeBytes;

        /**
         * The current chaining/state value
         */
        private ulong[] chain;

        /**
         * The initial state value
         */
        private ulong[] initialState;

        /**
         * The (optional) key parameter
         */
        private byte[] key;

        /**
         * Parameters to apply prior to the message
         */
        private Parameter[] preMessageParameters;

        /**
         * Parameters to apply after the message, but prior to output
         */
        private Parameter[] postMessageParameters;

        /**
         * The current UBI operation
         */
        private readonly UBI ubi;

        /**
         * Buffer for single byte update method
         */
        private readonly byte[] singleByte = new byte[1];

        /// <summary>
        /// Constructs a Skein digest with an internal state size and output size.
        /// </summary>
        /// <param name="blockSizeBits">the internal state size in bits - one of <see cref="SKEIN_256"/> <see cref="SKEIN_512"/> or
        ///                       <see cref="SKEIN_1024"/>.</param>
        /// <param name="outputSizeBits">the output/digest size to produce in bits, which must be an integral number of
        ///                      bytes.</param>
        public SkeinEngine(int blockSizeBits, int outputSizeBits)
        {
            if (outputSizeBits % 8 != 0)
            {
                throw new ArgumentException("Output size must be a multiple of 8 bits. :" + outputSizeBits);
            }
            // TODO: Prevent digest sizes > block size?
            this.outputSizeBytes = outputSizeBits / 8;

            this.threefish = new ThreefishEngine(blockSizeBits);
            this.ubi = new UBI(this,threefish.GetBlockSize());
        }

        /// <summary>
        /// Creates a SkeinEngine as an exact copy of an existing instance.
        /// </summary>
        public SkeinEngine(SkeinEngine engine)
            : this(engine.BlockSize * 8, engine.OutputSize * 8)
        {
            CopyIn(engine);
        }

        private void CopyIn(SkeinEngine engine)
        {
            this.ubi.Reset(engine.ubi);
            this.chain = Arrays.Clone(engine.chain, this.chain);
            this.initialState = Arrays.Clone(engine.initialState, this.initialState);
            this.key = Arrays.Clone(engine.key, this.key);
            this.preMessageParameters = Clone(engine.preMessageParameters, this.preMessageParameters);
            this.postMessageParameters = Clone(engine.postMessageParameters, this.postMessageParameters);
        }

        private static Parameter[] Clone(Parameter[] data, Parameter[] existing)
        {
            if (data == null)
            {
                return null;
            }
            if ((existing == null) || (existing.Length != data.Length))
            {
                existing = new Parameter[data.Length];
            }
            Array.Copy(data, 0, existing, 0, existing.Length);
            return existing;
        }

        public IMemoable Copy()
        {
            return new SkeinEngine(this);
        }

        public void Reset(IMemoable other)
        {
            SkeinEngine s = (SkeinEngine)other;
            if ((BlockSize != s.BlockSize) || (outputSizeBytes != s.outputSizeBytes))
            {
                throw new MemoableResetException("Incompatible parameters in provided SkeinEngine.");
            }
            CopyIn(s);
        }

        public int OutputSize
        {
            get { return outputSizeBytes; }
        }

        public int BlockSize
        {
            get { return threefish.GetBlockSize (); }
        }

        /// <summary>
        /// Initialises the Skein engine with the provided parameters. See <see cref="Org.BouncyCastle.Crypto.Parameters.SkeinParameters"/> for
        /// details on the parameterisation of the Skein hash function.
        /// </summary>
        /// <param name="parameters">the parameters to apply to this engine, or <code>null</code> to use no parameters.</param>
        public void Init(SkeinParameters parameters)
        {
            this.chain = null;
            this.key = null;
            this.preMessageParameters = null;
            this.postMessageParameters = null;

            if (parameters != null)
            {
                byte[] key = parameters.GetKey();
                if (key.Length < 16)
                {
                    throw new ArgumentException("Skein key must be at least 128 bits.");
                }
                InitParams(parameters.GetParameters());
            }
            CreateInitialState();

            // Initialise message block
            UbiInit(PARAM_TYPE_MESSAGE);
        }

        private void InitParams(IDictionary<int, byte[]> parameters)
        {
            //IEnumerator keys = parameters.Keys.GetEnumerator();
            var pre = new List<Parameter>();
            var post = new List<Parameter>();

            //while (keys.MoveNext())
            foreach (var parameter in parameters)
            {
                int type = parameter.Key;
                byte[] value = parameter.Value;

                if (type == PARAM_TYPE_KEY)
                {
                    this.key = value;
                }
                else if (type < PARAM_TYPE_MESSAGE)
                {
                    pre.Add(new Parameter(type, value));
                }
                else
                {
                    post.Add(new Parameter(type, value));
                }
            }
            preMessageParameters = new Parameter[pre.Count];
            pre.CopyTo(preMessageParameters, 0);
            Array.Sort(preMessageParameters);

            postMessageParameters = new Parameter[post.Count];
            post.CopyTo(postMessageParameters, 0);
            Array.Sort(postMessageParameters);
        }

        /**
         * Calculate the initial (pre message block) chaining state.
         */
        private void CreateInitialState()
        {
            var precalc = CollectionUtilities.GetValueOrNull(InitialStates, VariantIdentifier(BlockSize, OutputSize));
            if ((key == null) && (precalc != null))
            {
                // Precalculated UBI(CFG)
                chain = Arrays.Clone(precalc);
            }
            else
            {
                // Blank initial state
                chain = new ulong[BlockSize / 8];

                // Process key block
                if (key != null)
                {
                    UbiComplete(SkeinParameters.PARAM_TYPE_KEY, key);
                }

                // Process configuration block
                UbiComplete(PARAM_TYPE_CONFIG, new Configuration(outputSizeBytes * 8).Bytes);
            }

            // Process additional pre-message parameters
            if (preMessageParameters != null)
            {
                for (int i = 0; i < preMessageParameters.Length; i++)
                {
                    Parameter param = preMessageParameters[i];
                    UbiComplete(param.Type, param.Value);
                }
            }
            initialState = Arrays.Clone(chain);
        }

        /// <summary>
        /// Reset the engine to the initial state (with the key and any pre-message parameters , ready to
        /// accept message input.
        /// </summary>
        public void Reset()
        {
            Array.Copy(initialState, 0, chain, 0, chain.Length);

            UbiInit(PARAM_TYPE_MESSAGE);
        }

        private void UbiComplete(int type, byte[] value)
        {
            UbiInit(type);
            this.ubi.Update(value, 0, value.Length, chain);
            UbiFinal();
        }

        private void UbiInit(int type)
        {
            this.ubi.Reset(type);
        }

        private void UbiFinal()
        {
            ubi.DoFinal(chain);
        }

        private void CheckInitialised()
        {
            if (this.ubi == null)
            {
                throw new ArgumentException("Skein engine is not initialised.");
            }
        }

        public void Update(byte inByte)
        {
            singleByte[0] = inByte;
            BlockUpdate(singleByte, 0, 1);
        }

        public void BlockUpdate(byte[] inBytes, int inOff, int len)
        {
            CheckInitialised();
            ubi.Update(inBytes, inOff, len, chain);
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public void BlockUpdate(ReadOnlySpan<byte> input)
        {
            CheckInitialised();
            ubi.Update(input, chain);
        }
#endif

        public int DoFinal(byte[] outBytes, int outOff)
        {
            CheckInitialised();
            if (outBytes.Length < (outOff + outputSizeBytes))
            {
                throw new DataLengthException("Output buffer is too short to hold output");
            }

            // Finalise message block
            UbiFinal();

            // Process additional post-message parameters
            if (postMessageParameters != null)
            {
                for (int i = 0; i < postMessageParameters.Length; i++)
                {
                    Parameter param = postMessageParameters[i];
                    UbiComplete(param.Type, param.Value);
                }
            }

            // Perform the output transform
            int blockSize = BlockSize;
            int blocksRequired = ((outputSizeBytes + blockSize - 1) / blockSize);
            for (int i = 0; i < blocksRequired; i++)
            {
                int toWrite = System.Math.Min(blockSize, outputSizeBytes - (i * blockSize));
                Output((ulong)i, outBytes, outOff + (i * blockSize), toWrite);
            }

            Reset();

            return outputSizeBytes;
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public int DoFinal(Span<byte> output)
        {
            CheckInitialised();
            if (output.Length < outputSizeBytes)
                throw new DataLengthException("Output span is too short to hold output");

            // Finalise message block
            UbiFinal();

            // Process additional post-message parameters
            if (postMessageParameters != null)
            {
                for (int i = 0; i < postMessageParameters.Length; i++)
                {
                    Parameter param = postMessageParameters[i];
                    UbiComplete(param.Type, param.Value);
                }
            }

            // Perform the output transform
            int blockSize = BlockSize;
            int blocksRequired = (outputSizeBytes + blockSize - 1) / blockSize;
            for (int i = 0; i < blocksRequired; i++)
            {
                int toWrite = System.Math.Min(blockSize, outputSizeBytes - (i * blockSize));
                //Output((ulong)i, outBytes, outOff + (i * blockSize), toWrite);
                Output((ulong)i, output[(i * blockSize)..], toWrite);
            }

            Reset();

            return outputSizeBytes;
        }
#endif

        private void Output(ulong outputSequence, byte[] outBytes, int outOff, int outputBytes)
        {
            byte[] currentBytes = new byte[8];
            Pack.UInt64_To_LE(outputSequence, currentBytes, 0);

            // Output is a sequence of UBI invocations all of which use and preserve the pre-output state
            ulong[] outputWords = new ulong[chain.Length];
            UbiInit(PARAM_TYPE_OUTPUT);
            this.ubi.Update(currentBytes, 0, currentBytes.Length, outputWords);
            ubi.DoFinal(outputWords);

            int wordsRequired = (outputBytes + 8 - 1) / 8;
            for (int i = 0; i < wordsRequired; i++)
            {
                int toWrite = System.Math.Min(8, outputBytes - (i * 8));
                if (toWrite == 8)
                {
                    Pack.UInt64_To_LE(outputWords[i], outBytes, outOff + (i * 8));
                }
                else
                {
                    Pack.UInt64_To_LE(outputWords[i], currentBytes, 0);
                    Array.Copy(currentBytes, 0, outBytes, outOff + (i * 8), toWrite);
                }
            }
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        private void Output(ulong outputSequence, Span<byte> output, int outputBytes)
        {
            Span<byte> currentBytes = stackalloc byte[8];
            Pack.UInt64_To_LE(outputSequence, currentBytes);

            // Output is a sequence of UBI invocations all of which use and preserve the pre-output state
            ulong[] outputWords = new ulong[chain.Length];
            UbiInit(PARAM_TYPE_OUTPUT);
            this.ubi.Update(currentBytes, outputWords);
            ubi.DoFinal(outputWords);

            int wordsRequired = (outputBytes + 8 - 1) / 8;
            for (int i = 0; i < wordsRequired; i++)
            {
                int toWrite = System.Math.Min(8, outputBytes - (i * 8));
                if (toWrite == 8)
                {
                    Pack.UInt64_To_LE(outputWords[i], output[(i * 8)..]);
                }
                else
                {
                    Pack.UInt64_To_LE(outputWords[i], currentBytes);
                    currentBytes[..toWrite].CopyTo(output[(i * 8)..]);
                }
            }
        }
#endif
    }
}

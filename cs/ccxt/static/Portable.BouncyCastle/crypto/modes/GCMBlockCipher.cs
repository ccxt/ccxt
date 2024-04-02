// using System;
// #if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
// using System.Runtime.CompilerServices;
// #endif
// #if NETCOREAPP3_0_OR_GREATER
// using System.Runtime.Intrinsics;
// using System.Runtime.Intrinsics.X86;
// #endif

// using Org.BouncyCastle.Crypto.Modes.Gcm;
// using Org.BouncyCastle.Crypto.Parameters;
// using Org.BouncyCastle.Crypto.Utilities;
// using Org.BouncyCastle.Utilities;

// namespace Org.BouncyCastle.Crypto.Modes
// {
//     /// <summary>
//     /// Implements the Galois/Counter mode (GCM) detailed in
//     /// NIST Special Publication 800-38D.
//     /// </summary>
//     public sealed class GcmBlockCipher
//         : IAeadBlockCipher
//     {
//         private static IGcmMultiplier CreateGcmMultiplier()
//         {
// #if NETCOREAPP3_0_OR_GREATER
//             // TODO Prefer more tightly coupled test
//             if (System.Runtime.Intrinsics.X86.Pclmulqdq.IsSupported)
//             {
//                 return new BasicGcmMultiplier();
//             }
// #endif

//             return new Tables4kGcmMultiplier();
//         }

//         private const int BlockSize = 16;

//         private readonly IBlockCipher	cipher;
//         private readonly IGcmMultiplier	multiplier;
//         private IGcmExponentiator exp;

//         // These fields are set by Init and not modified by processing
//         private bool        forEncryption;
//         private bool        initialised;
//         private int         macSize;
//         private byte[]      lastKey;
//         private byte[]      nonce;
//         private byte[]      initialAssociatedText;
//         private byte[]      H;
//         private byte[]      J0;

//         // These fields are modified during processing
//         private byte[]		bufBlock;
//         private byte[]		macBlock;
//         private byte[]      S, S_at, S_atPre;
//         private byte[]      counter;
//         private uint        counter32;
//         private uint        blocksRemaining;
//         private int         bufOff;
//         private ulong		totalLength;
//         private byte[]      atBlock;
//         private int         atBlockPos;
//         private ulong       atLength;
//         private ulong       atLengthPre;

//         public GcmBlockCipher(
//             IBlockCipher c)
//             : this(c, null)
//         {
//         }

//         public GcmBlockCipher(
//             IBlockCipher	c,
//             IGcmMultiplier	m)
//         {
//             if (c.GetBlockSize() != BlockSize)
//                 throw new ArgumentException("cipher required with a block size of " + BlockSize + ".");

//             if (m == null)
//             {
//                 m = CreateGcmMultiplier();
//             }

//             this.cipher = c;
//             this.multiplier = m;
//         }

//         public string AlgorithmName => cipher.AlgorithmName + "/GCM";

//         public IBlockCipher UnderlyingCipher => cipher;

//         public int GetBlockSize()
//         {
//             return BlockSize;
//         }

//         /// <remarks>
//         /// MAC sizes from 32 bits to 128 bits (must be a multiple of 8) are supported. The default is 128 bits.
//         /// Sizes less than 96 are not recommended, but are supported for specialized applications.
//         /// </remarks>
//         public void Init(bool forEncryption, ICipherParameters parameters)
//         {
//             this.forEncryption = forEncryption;
//             this.macBlock = null;
//             this.initialised = true;

//             KeyParameter keyParam;
//             byte[] newNonce = null;

//             if (parameters is AeadParameters)
//             {
//                 AeadParameters param = (AeadParameters)parameters;

//                 newNonce = param.GetNonce();
//                 initialAssociatedText = param.GetAssociatedText();

//                 int macSizeBits = param.MacSize;
//                 if (macSizeBits < 32 || macSizeBits > 128 || macSizeBits % 8 != 0)
//                 {
//                     throw new ArgumentException("Invalid value for MAC size: " + macSizeBits);
//                 }

//                 macSize = macSizeBits / 8; 
//                 keyParam = param.Key;
//             }
//             else if (parameters is ParametersWithIV)
//             {
//                 ParametersWithIV param = (ParametersWithIV)parameters;

//                 newNonce = param.GetIV();
//                 initialAssociatedText = null;
//                 macSize = 16; 
//                 keyParam = (KeyParameter)param.Parameters;
//             }
//             else
//             {
//                 throw new ArgumentException("invalid parameters passed to GCM");
//             }

//             int bufLength = forEncryption ? BlockSize : (BlockSize + macSize);
//             this.bufBlock = new byte[bufLength];

//             if (newNonce == null || newNonce.Length < 1)
//             {
//                 throw new ArgumentException("IV must be at least 1 byte");
//             }

//             if (forEncryption)
//             {
//                 if (nonce != null && Arrays.AreEqual(nonce, newNonce))
//                 {
//                     if (keyParam == null)
//                     {
//                         throw new ArgumentException("cannot reuse nonce for GCM encryption");
//                     }
//                     if (lastKey != null && Arrays.AreEqual(lastKey, keyParam.GetKey()))
//                     {
//                         throw new ArgumentException("cannot reuse nonce for GCM encryption");
//                     }
//                 }
//             }

//             nonce = newNonce;
//             if (keyParam != null)
//             {
//                 lastKey = keyParam.GetKey();
//             }

//             // TODO Restrict macSize to 16 if nonce length not 12?

//             // Cipher always used in forward mode
//             // if keyParam is null we're reusing the last key.
//             if (keyParam != null)
//             {
//                 cipher.Init(true, keyParam);

//                 this.H = new byte[BlockSize];
//                 cipher.ProcessBlock(H, 0, H, 0);

//                 // if keyParam is null we're reusing the last key and the multiplier doesn't need re-init
//                 multiplier.Init(H);
//                 exp = null;
//             }
//             else if (this.H == null)
//             {
//                 throw new ArgumentException("Key must be specified in initial init");
//             }

//             this.J0 = new byte[BlockSize];

//             if (nonce.Length == 12)
//             {
//                 Array.Copy(nonce, 0, J0, 0, nonce.Length);
//                 this.J0[BlockSize - 1] = 0x01;
//             }
//             else
//             {
//                 gHASH(J0, nonce, nonce.Length);
//                 byte[] X = new byte[BlockSize];
//                 Pack.UInt64_To_BE((ulong)nonce.Length * 8UL, X, 8);
//                 gHASHBlock(J0, X);
//             }

//             this.S = new byte[BlockSize];
//             this.S_at = new byte[BlockSize];
//             this.S_atPre = new byte[BlockSize];
//             this.atBlock = new byte[BlockSize];
//             this.atBlockPos = 0;
//             this.atLength = 0;
//             this.atLengthPre = 0;
//             this.counter = Arrays.Clone(J0);
//             this.counter32 = Pack.BE_To_UInt32(counter, 12);
//             this.blocksRemaining = uint.MaxValue - 1; // page 8, len(P) <= 2^39 - 256, 1 block used by tag
//             this.bufOff = 0;
//             this.totalLength = 0;

//             if (initialAssociatedText != null)
//             {
//                 ProcessAadBytes(initialAssociatedText, 0, initialAssociatedText.Length);
//             }
//         }

//         public byte[] GetMac()
//         {
//             return macBlock == null
//                 ?   new byte[macSize]
//                 :   Arrays.Clone(macBlock);
//         }

//         public int GetOutputSize(int len)
//         {
//             int totalData = len + bufOff;

//             if (forEncryption)
//             {
//                 return totalData + macSize;
//             }

//             return totalData < macSize ? 0 : totalData - macSize;
//         }

//         public int GetUpdateOutputSize(int len)
//         {
//             int totalData = len + bufOff;
//             if (!forEncryption)
//             {
//                 if (totalData < macSize)
//                 {
//                     return 0;
//                 }
//                 totalData -= macSize;
//             }
//             return totalData - totalData % BlockSize;
//         }

//         public void ProcessAadByte(byte input)
//         {
//             CheckStatus();

//             atBlock[atBlockPos] = input;
//             if (++atBlockPos == BlockSize)
//             {
//                 // Hash each block as it fills
//                 gHASHBlock(S_at, atBlock);
//                 atBlockPos = 0;
//                 atLength += BlockSize;
//             }
//         }

//         public void ProcessAadBytes(byte[] inBytes, int inOff, int len)
//         {
// #if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
//             ProcessAadBytes(inBytes.AsSpan(inOff, len));
// #else
//             CheckStatus();

//             if (atBlockPos > 0)
//             {
//                 int available = BlockSize - atBlockPos;
//                 if (len < available)
//                 {
//                     Array.Copy(inBytes, inOff, atBlock, atBlockPos, len);
//                     atBlockPos += len;
//                     return;
//                 }

//                 Array.Copy(inBytes, inOff, atBlock, atBlockPos, available);
//                 gHASHBlock(S_at, atBlock);
//                 atLength += BlockSize;
//                 inOff += available;
//                 len -= available;
//                 //atBlockPos = 0;
//             }

//             int inLimit = inOff + len - BlockSize;

//             while (inOff <= inLimit)
//             {
//                 gHASHBlock(S_at, inBytes, inOff);
//                 atLength += BlockSize;
//                 inOff += BlockSize;
//             }

//             atBlockPos = BlockSize + inLimit - inOff;
//             Array.Copy(inBytes, inOff, atBlock, 0, atBlockPos);
// #endif
//         }

// #if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
//         public void ProcessAadBytes(ReadOnlySpan<byte> input)
//         {
//             CheckStatus();

//             if (atBlockPos > 0)
//             {
//                 int available = BlockSize - atBlockPos;
//                 if (input.Length < available)
//                 {
//                     input.CopyTo(atBlock.AsSpan(atBlockPos));
//                     atBlockPos += input.Length;
//                     return;
//                 }

//                 input[..available].CopyTo(atBlock.AsSpan(atBlockPos));
//                 gHASHBlock(S_at, atBlock);
//                 atLength += BlockSize;
//                 input = input[available..];
//                 //atBlockPos = 0;
//             }

//             while (input.Length >= BlockSize)
//             {
//                 gHASHBlock(S_at, input);
//                 atLength += BlockSize;
//                 input = input[BlockSize..];
//             }

//             input.CopyTo(atBlock);
//             atBlockPos = input.Length;
//         }
// #endif

//         private void InitCipher()
//         {
//             if (atLength > 0)
//             {
//                 Array.Copy(S_at, 0, S_atPre, 0, BlockSize);
//                 atLengthPre = atLength;
//             }

//             // Finish hash for partial AAD block
//             if (atBlockPos > 0)
//             {
//                 gHASHPartial(S_atPre, atBlock, 0, atBlockPos);
//                 atLengthPre += (uint)atBlockPos;
//             }

//             if (atLengthPre > 0)
//             {
//                 Array.Copy(S_atPre, 0, S, 0, BlockSize);
//             }
//         }

//         public int ProcessByte(byte	input, byte[] output, int outOff)
//         {
//             CheckStatus();

//             bufBlock[bufOff] = input;
//             if (++bufOff == bufBlock.Length)
//             {
//                 if (forEncryption)
//                 {
// #if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
//                     EncryptBlock(bufBlock, output.AsSpan(outOff));
// #else
//                     EncryptBlock(bufBlock, 0, output, outOff);
// #endif
//                     bufOff = 0;
//                 }
//                 else
//                 {
// #if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
//                     DecryptBlock(bufBlock, output.AsSpan(outOff));
// #else
//                     DecryptBlock(bufBlock, 0, output, outOff);
// #endif
//                     Array.Copy(bufBlock, BlockSize, bufBlock, 0, macSize);
//                     bufOff = macSize;
//                 }
//                 return BlockSize;
//             }
//             return 0;
//         }

// #if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
//         public int ProcessByte(byte input, Span<byte> output)
//         {
//             CheckStatus();

//             bufBlock[bufOff] = input;
//             if (++bufOff == bufBlock.Length)
//             {
//                 if (forEncryption)
//                 {
//                     EncryptBlock(bufBlock, output);
//                     bufOff = 0;
//                 }
//                 else
//                 {
//                     DecryptBlock(bufBlock, output);
//                     Array.Copy(bufBlock, BlockSize, bufBlock, 0, macSize);
//                     bufOff = macSize;
//                 }
//                 return BlockSize;
//             }
//             return 0;
//         }
// #endif

//         public int ProcessBytes(byte[] input, int inOff, int len, byte[] output, int outOff)
//         {
//             CheckStatus();

//             Check.DataLength(input, inOff, len, "input buffer too short");

// #if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
//             return ProcessBytes(input.AsSpan(inOff, len), Spans.FromNullable(output, outOff));
// #else
//             int resultLen = 0;

//             if (forEncryption)
//             {
//                 if (bufOff > 0)
//                 {
//                     int available = BlockSize - bufOff;
//                     if (len < available)
//                     {
//                         Array.Copy(input, inOff, bufBlock, bufOff, len);
//                         bufOff += len;
//                         return 0;
//                     }

//                     Array.Copy(input, inOff, bufBlock, bufOff, available);
//                     EncryptBlock(bufBlock, 0, output, outOff);
//                     inOff += available;
//                     len -= available;
//                     resultLen = BlockSize;
//                     //bufOff = 0;
//                 }

//                 int inLimit1 = inOff + len - BlockSize;
//                 int inLimit2 = inLimit1 - BlockSize;

//                 while (inOff <= inLimit2)
//                 {
//                     EncryptBlocks2(input, inOff, output, outOff + resultLen);
//                     inOff += BlockSize * 2;
//                     resultLen += BlockSize * 2;
//                 }

//                 if (inOff <= inLimit1)
//                 {
//                     EncryptBlock(input, inOff, output, outOff + resultLen);
//                     inOff += BlockSize;
//                     resultLen += BlockSize;
//                 }

//                 bufOff = BlockSize + inLimit1 - inOff;
//                 Array.Copy(input, inOff, bufBlock, 0, bufOff);
//             }
//             else
//             {
//                 int available = bufBlock.Length - bufOff;
//                 if (len < available)
//                 {
//                     Array.Copy(input, inOff, bufBlock, bufOff, len);
//                     bufOff += len;
//                     return 0;
//                 }

//                 if (bufOff >= BlockSize)
//                 {
//                     DecryptBlock(bufBlock, 0, output, outOff);
//                     Array.Copy(bufBlock, BlockSize, bufBlock, 0, bufOff -= BlockSize);
//                     resultLen = BlockSize;

//                     available += BlockSize;
//                     if (len < available)
//                     {
//                         Array.Copy(input, inOff, bufBlock, bufOff, len);
//                         bufOff += len;
//                         return resultLen;
//                     }
//                 }

//                 int inLimit1 = inOff + len - bufBlock.Length;
//                 int inLimit2 = inLimit1 - BlockSize;

//                 available = BlockSize - bufOff;
//                 Array.Copy(input, inOff, bufBlock, bufOff, available);
//                 DecryptBlock(bufBlock, 0, output, outOff + resultLen);
//                 inOff += available;
//                 resultLen += BlockSize;
//                 //bufOff = 0;

//                 while (inOff <= inLimit2)
//                 {
//                     DecryptBlocks2(input, inOff, output, outOff + resultLen);
//                     inOff += BlockSize * 2;
//                     resultLen += BlockSize * 2;
//                 }

//                 if (inOff <= inLimit1)
//                 {
//                     DecryptBlock(input, inOff, output, outOff + resultLen);
//                     inOff += BlockSize;
//                     resultLen += BlockSize;
//                 }

//                 bufOff = bufBlock.Length + inLimit1 - inOff;
//                 Array.Copy(input, inOff, bufBlock, 0, bufOff);
//             }

//             return resultLen;
// #endif
//         }

// #if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
//         public int ProcessBytes(ReadOnlySpan<byte> input, Span<byte> output)
//         {
//             CheckStatus();

//             int resultLen = 0;

//             if (forEncryption)
//             {
//                 if (bufOff > 0)
//                 {
//                     int available = BlockSize - bufOff;
//                     if (input.Length < available)
//                     {
//                         input.CopyTo(bufBlock.AsSpan(bufOff));
//                         bufOff += input.Length;
//                         return 0;
//                     }

//                     input[..available].CopyTo(bufBlock.AsSpan(bufOff));
//                     EncryptBlock(bufBlock, output);
//                     input = input[available..];
//                     resultLen = BlockSize;
//                     //bufOff = 0;
//                 }

//                 while (input.Length >= BlockSize * 2)
//                 {
//                     EncryptBlocks2(input, output[resultLen..]);
//                     input = input[(BlockSize * 2)..];
//                     resultLen += BlockSize * 2;
//                 }

//                 if (input.Length >= BlockSize)
//                 {
//                     EncryptBlock(input, output[resultLen..]);
//                     input = input[BlockSize..];
//                     resultLen += BlockSize;
//                 }

//                 bufOff = input.Length;
//                 input.CopyTo(bufBlock);
//             }
//             else
//             {
//                 int available = bufBlock.Length - bufOff;
//                 if (input.Length < available)
//                 {
//                     input.CopyTo(bufBlock.AsSpan(bufOff));
//                     bufOff += input.Length;
//                     return 0;
//                 }

//                 if (bufOff >= BlockSize)
//                 {
//                     DecryptBlock(bufBlock, output);
//                     Array.Copy(bufBlock, BlockSize, bufBlock, 0, bufOff -= BlockSize);
//                     resultLen = BlockSize;

//                     available += BlockSize;
//                     if (input.Length < available)
//                     {
//                         input.CopyTo(bufBlock.AsSpan(bufOff));
//                         bufOff += input.Length;
//                         return resultLen;
//                     }
//                 }

//                 int inLimit1 = bufBlock.Length;
//                 int inLimit2 = inLimit1 + BlockSize;

//                 available = BlockSize - bufOff;
//                 input[..available].CopyTo(bufBlock.AsSpan(bufOff));
//                 DecryptBlock(bufBlock, output[resultLen..]);
//                 input = input[available..];
//                 resultLen += BlockSize;
//                 //bufOff = 0;

//                 while (input.Length >= inLimit2)
//                 {
//                     DecryptBlocks2(input, output[resultLen..]);
//                     input = input[(BlockSize * 2)..];
//                     resultLen += BlockSize * 2;
//                 }

//                 if (input.Length >= inLimit1)
//                 {
//                     DecryptBlock(input, output[resultLen..]);
//                     input = input[BlockSize..];
//                     resultLen += BlockSize;
//                 }

//                 bufOff = input.Length;
//                 input.CopyTo(bufBlock);
//             }

//             return resultLen;
//         }
// #endif

//         public int DoFinal(byte[] output, int outOff)
//         {
// #if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
//             return DoFinal(output.AsSpan(outOff));
// #else
//             CheckStatus();

//             if (totalLength == 0)
//             {
//                 InitCipher();
//             }

//             int extra = bufOff;

//             if (forEncryption)
//             {
//                 Check.OutputLength(output, outOff, extra + macSize, "output buffer too short");
//             }
//             else
//             {
//                 if (extra < macSize)
//                     throw new InvalidCipherTextException("data too short");

//                 extra -= macSize;

//                 Check.OutputLength(output, outOff, extra, "output buffer too short");
//             }

//             if (extra > 0)
//             {
//                 ProcessPartial(bufBlock, 0, extra, output, outOff);
//             }

//             atLength += (uint)atBlockPos;

//             if (atLength > atLengthPre)
//             {
//                 /*
//                  *  Some AAD was sent after the cipher started. We determine the difference b/w the hash value
//                  *  we actually used when the cipher started (S_atPre) and the final hash value calculated (S_at).
//                  *  Then we carry this difference forward by multiplying by H^c, where c is the number of (full or
//                  *  partial) cipher-text blocks produced, and adjust the current hash.
//                  */

//                 // Finish hash for partial AAD block
//                 if (atBlockPos > 0)
//                 {
//                     gHASHPartial(S_at, atBlock, 0, atBlockPos);
//                 }

//                 // Find the difference between the AAD hashes
//                 if (atLengthPre > 0)
//                 {
//                     GcmUtilities.Xor(S_at, S_atPre);
//                 }

//                 // Number of cipher-text blocks produced
//                 long c = (long)(((totalLength * 8) + 127) >> 7);

//                 // Calculate the adjustment factor
//                 byte[] H_c = new byte[16];
//                 if (exp == null)
//                 {
//                     exp = new BasicGcmExponentiator();
//                     exp.Init(H);
//                 }
//                 exp.ExponentiateX(c, H_c);

//                 // Carry the difference forward
//                 GcmUtilities.Multiply(S_at, H_c);

//                 // Adjust the current hash
//                 GcmUtilities.Xor(S, S_at);
//             }

//             // Final gHASH
//             byte[] X = new byte[BlockSize];
//             Pack.UInt64_To_BE(atLength * 8UL, X, 0);
//             Pack.UInt64_To_BE(totalLength * 8UL, X, 8);

//             gHASHBlock(S, X);

//             // T = MSBt(GCTRk(J0,S))
//             byte[] tag = new byte[BlockSize];
//             cipher.ProcessBlock(J0, 0, tag, 0);
//             GcmUtilities.Xor(tag, S);

//             int resultLen = extra;

//             // We place into macBlock our calculated value for T
//             this.macBlock = new byte[macSize];
//             Array.Copy(tag, 0, macBlock, 0, macSize);

//             if (forEncryption)
//             {
//                 // Append T to the message
//                 Array.Copy(macBlock, 0, output, outOff + bufOff, macSize);
//                 resultLen += macSize;
//             }
//             else
//             {
//                 // Retrieve the T value from the message and compare to calculated one
//                 byte[] msgMac = new byte[macSize];
//                 Array.Copy(bufBlock, extra, msgMac, 0, macSize);
//                 if (!Arrays.ConstantTimeAreEqual(this.macBlock, msgMac))
//                     throw new InvalidCipherTextException("mac check in GCM failed");
//             }

//             Reset(false);

//             return resultLen;
// #endif
//         }

// #if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
//         public int DoFinal(Span<byte> output)
//         {
//             CheckStatus();

//             if (totalLength == 0)
//             {
//                 InitCipher();
//             }

//             int extra = bufOff;

//             if (forEncryption)
//             {
//                 Check.OutputLength(output, extra + macSize, "output buffer too short");
//             }
//             else
//             {
//                 if (extra < macSize)
//                     throw new InvalidCipherTextException("data too short");

//                 extra -= macSize;

//                 Check.OutputLength(output, extra, "output buffer too short");
//             }

//             if (extra > 0)
//             {
//                 ProcessPartial(bufBlock.AsSpan(0, extra), output);
//             }

//             atLength += (uint)atBlockPos;

//             if (atLength > atLengthPre)
//             {
//                 /*
//                  *  Some AAD was sent after the cipher started. We determine the difference b/w the hash value
//                  *  we actually used when the cipher started (S_atPre) and the final hash value calculated (S_at).
//                  *  Then we carry this difference forward by multiplying by H^c, where c is the number of (full or
//                  *  partial) cipher-text blocks produced, and adjust the current hash.
//                  */

//                 // Finish hash for partial AAD block
//                 if (atBlockPos > 0)
//                 {
//                     gHASHPartial(S_at, atBlock, 0, atBlockPos);
//                 }

//                 // Find the difference between the AAD hashes
//                 if (atLengthPre > 0)
//                 {
//                     GcmUtilities.Xor(S_at, S_atPre);
//                 }

//                 // Number of cipher-text blocks produced
//                 long c = (long)(((totalLength * 8) + 127) >> 7);

//                 // Calculate the adjustment factor
//                 byte[] H_c = new byte[16];
//                 if (exp == null)
//                 {
//                     exp = new BasicGcmExponentiator();
//                     exp.Init(H);
//                 }
//                 exp.ExponentiateX(c, H_c);

//                 // Carry the difference forward
//                 GcmUtilities.Multiply(S_at, H_c);

//                 // Adjust the current hash
//                 GcmUtilities.Xor(S, S_at);
//             }

//             // Final gHASH
//             Span<byte> X = stackalloc byte[BlockSize];
//             Pack.UInt64_To_BE(atLength * 8UL, X);
//             Pack.UInt64_To_BE(totalLength * 8UL, X[8..]);

//             gHASHBlock(S, X);

//             // T = MSBt(GCTRk(J0,S))
//             Span<byte> tag = stackalloc byte[BlockSize];
//             cipher.ProcessBlock(J0, tag);
//             GcmUtilities.Xor(tag, S);

//             int resultLen = extra;

//             // We place into macBlock our calculated value for T
//             this.macBlock = new byte[macSize];
//             tag[..macSize].CopyTo(macBlock);

//             if (forEncryption)
//             {
//                 // Append T to the message
//                 macBlock.CopyTo(output[bufOff..]);
//                 resultLen += macSize;
//             }
//             else
//             {
//                 // Retrieve the T value from the message and compare to calculated one
//                 Span<byte> msgMac = stackalloc byte[macSize];
//                 bufBlock.AsSpan(extra, macSize).CopyTo(msgMac);
//                 if (!Arrays.ConstantTimeAreEqual(this.macBlock, msgMac))
//                     throw new InvalidCipherTextException("mac check in GCM failed");
//             }

//             Reset(false);

//             return resultLen;
//         }
// #endif

//         public void Reset()
//         {
//             Reset(true);
//         }

//         private void Reset(bool clearMac)
//         {
//             // note: we do not reset the nonce.

//             S = new byte[BlockSize];
//             S_at = new byte[BlockSize];
//             S_atPre = new byte[BlockSize];
//             atBlock = new byte[BlockSize];
//             atBlockPos = 0;
//             atLength = 0;
//             atLengthPre = 0;
//             counter = Arrays.Clone(J0);
//             counter32 = Pack.BE_To_UInt32(counter, 12);
//             blocksRemaining = uint.MaxValue - 1;
//             bufOff = 0;
//             totalLength = 0;

//             if (bufBlock != null)
//             {
//                 Arrays.Fill(bufBlock, 0);
//             }

//             if (clearMac)
//             {
//                 macBlock = null;
//             }

//             if (forEncryption)
//             {
//                 initialised = false;
//             }
//             else
//             {
//                 if (initialAssociatedText != null)
//                 {
//                     ProcessAadBytes(initialAssociatedText, 0, initialAssociatedText.Length);
//                 }
//             }
//         }

// #if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
//         // [MethodImpl(MethodImplOptions.AggressiveOptimization)]
//         private void DecryptBlock(ReadOnlySpan<byte> input, Span<byte> output)
//         {
//             Check.OutputLength(output, BlockSize, "output buffer too short");

//             if (totalLength == 0)
//             {
//                 InitCipher();
//             }

//             Span<byte> ctrBlock = stackalloc byte[BlockSize];

//             GetNextCtrBlock(ctrBlock);
// #if NETCOREAPP3_0_OR_GREATER
//             if (Sse2.IsSupported && Unsafe.SizeOf<Vector128<byte>>() == BlockSize)
//             {
//                 var t0 = Unsafe.ReadUnaligned<Vector128<byte>>(ref Unsafe.AsRef(input[0]));
//                 var t1 = Unsafe.ReadUnaligned<Vector128<byte>>(ref ctrBlock[0]);
//                 var t2 = Unsafe.ReadUnaligned<Vector128<byte>>(ref S[0]);

//                 t1 = Sse2.Xor(t1, t0);
//                 t2 = Sse2.Xor(t2, t0);

//                 Unsafe.WriteUnaligned(ref output[0], t1);
//                 Unsafe.WriteUnaligned(ref S[0], t2);
//             }
//             else
// #endif
//             {
//                 for (int i = 0; i < BlockSize; i += 4)
//                 {
//                     byte c0 = input[i + 0];
//                     byte c1 = input[i + 1];
//                     byte c2 = input[i + 2];
//                     byte c3 = input[i + 3];

//                     S[i + 0] ^= c0;
//                     S[i + 1] ^= c1;
//                     S[i + 2] ^= c2;
//                     S[i + 3] ^= c3;

//                     output[i + 0] = (byte)(c0 ^ ctrBlock[i + 0]);
//                     output[i + 1] = (byte)(c1 ^ ctrBlock[i + 1]);
//                     output[i + 2] = (byte)(c2 ^ ctrBlock[i + 2]);
//                     output[i + 3] = (byte)(c3 ^ ctrBlock[i + 3]);
//                 }
//             }
//             multiplier.MultiplyH(S);

//             totalLength += BlockSize;
//         }

//         [MethodImpl(MethodImplOptions.AggressiveOptimization)]
//         private void DecryptBlocks2(ReadOnlySpan<byte> input, Span<byte> output)
//         {
//             Check.OutputLength(output, BlockSize * 2, "output buffer too short");

//             if (totalLength == 0)
//             {
//                 InitCipher();
//             }

//             Span<byte> ctrBlock = stackalloc byte[BlockSize];

//             GetNextCtrBlock(ctrBlock);
// #if NETCOREAPP3_0_OR_GREATER
//             if (Sse2.IsSupported && Unsafe.SizeOf<Vector128<byte>>() == BlockSize)
//             {
//                 var t0 = Unsafe.ReadUnaligned<Vector128<byte>>(ref Unsafe.AsRef(input[0]));
//                 var t1 = Unsafe.ReadUnaligned<Vector128<byte>>(ref ctrBlock[0]);
//                 var t2 = Unsafe.ReadUnaligned<Vector128<byte>>(ref S[0]);

//                 t1 = Sse2.Xor(t1, t0);
//                 t2 = Sse2.Xor(t2, t0);

//                 Unsafe.WriteUnaligned(ref output[0], t1);
//                 Unsafe.WriteUnaligned(ref S[0], t2);
//             }
//             else
// #endif
//             {
//                 for (int i = 0; i < BlockSize; i += 4)
//                 {
//                     byte c0 = input[i + 0];
//                     byte c1 = input[i + 1];
//                     byte c2 = input[i + 2];
//                     byte c3 = input[i + 3];

//                     S[i + 0] ^= c0;
//                     S[i + 1] ^= c1;
//                     S[i + 2] ^= c2;
//                     S[i + 3] ^= c3;

//                     output[i + 0] = (byte)(c0 ^ ctrBlock[i + 0]);
//                     output[i + 1] = (byte)(c1 ^ ctrBlock[i + 1]);
//                     output[i + 2] = (byte)(c2 ^ ctrBlock[i + 2]);
//                     output[i + 3] = (byte)(c3 ^ ctrBlock[i + 3]);
//                 }
//             }
//             multiplier.MultiplyH(S);

//             input = input[BlockSize..];
//             output = output[BlockSize..];

//             GetNextCtrBlock(ctrBlock);
// #if NETCOREAPP3_0_OR_GREATER
//             if (Sse2.IsSupported && Unsafe.SizeOf<Vector128<byte>>() == BlockSize)
//             {
//                 var t0 = Unsafe.ReadUnaligned<Vector128<byte>>(ref Unsafe.AsRef(input[0]));
//                 var t1 = Unsafe.ReadUnaligned<Vector128<byte>>(ref ctrBlock[0]);
//                 var t2 = Unsafe.ReadUnaligned<Vector128<byte>>(ref S[0]);

//                 t1 = Sse2.Xor(t1, t0);
//                 t2 = Sse2.Xor(t2, t0);

//                 Unsafe.WriteUnaligned(ref output[0], t1);
//                 Unsafe.WriteUnaligned(ref S[0], t2);
//             }
//             else
// #endif
//             {
//                 for (int i = 0; i < BlockSize; i += 4)
//                 {
//                     byte c0 = input[i + 0];
//                     byte c1 = input[i + 1];
//                     byte c2 = input[i + 2];
//                     byte c3 = input[i + 3];

//                     S[i + 0] ^= c0;
//                     S[i + 1] ^= c1;
//                     S[i + 2] ^= c2;
//                     S[i + 3] ^= c3;

//                     output[i + 0] = (byte)(c0 ^ ctrBlock[i + 0]);
//                     output[i + 1] = (byte)(c1 ^ ctrBlock[i + 1]);
//                     output[i + 2] = (byte)(c2 ^ ctrBlock[i + 2]);
//                     output[i + 3] = (byte)(c3 ^ ctrBlock[i + 3]);
//                 }
//             }
//             multiplier.MultiplyH(S);

//             totalLength += BlockSize * 2;
//         }

//         [MethodImpl(MethodImplOptions.AggressiveOptimization)]
//         private void EncryptBlock(ReadOnlySpan<byte> input, Span<byte> output)
//         {
//             Check.OutputLength(output, BlockSize, "output buffer too short");

//             if (totalLength == 0)
//             {
//                 InitCipher();
//             }

//             Span<byte> ctrBlock = stackalloc byte[BlockSize];

//             GetNextCtrBlock(ctrBlock);
// #if NETCOREAPP3_0_OR_GREATER
//             if (Sse2.IsSupported && Unsafe.SizeOf<Vector128<byte>>() == BlockSize)
//             {
//                 var t0 = Unsafe.ReadUnaligned<Vector128<byte>>(ref Unsafe.AsRef(input[0]));
//                 var t1 = Unsafe.ReadUnaligned<Vector128<byte>>(ref ctrBlock[0]);
//                 var t2 = Unsafe.ReadUnaligned<Vector128<byte>>(ref S[0]);

//                 t1 = Sse2.Xor(t1, t0);
//                 t2 = Sse2.Xor(t2, t1);

//                 Unsafe.WriteUnaligned(ref output[0], t1);
//                 Unsafe.WriteUnaligned(ref S[0], t2);
//             }
//             else
// #endif
//             {
//                 for (int i = 0; i < BlockSize; i += 4)
//                 {
//                     byte c0 = (byte)(ctrBlock[i + 0] ^ input[i + 0]);
//                     byte c1 = (byte)(ctrBlock[i + 1] ^ input[i + 1]);
//                     byte c2 = (byte)(ctrBlock[i + 2] ^ input[i + 2]);
//                     byte c3 = (byte)(ctrBlock[i + 3] ^ input[i + 3]);

//                     S[i + 0] ^= c0;
//                     S[i + 1] ^= c1;
//                     S[i + 2] ^= c2;
//                     S[i + 3] ^= c3;

//                     output[i + 0] = c0;
//                     output[i + 1] = c1;
//                     output[i + 2] = c2;
//                     output[i + 3] = c3;
//                 }
//             }
//             multiplier.MultiplyH(S);

//             totalLength += BlockSize;
//         }

//         // [MethodImpl(MethodImplOptions.AggressiveOptimization)]
//         private void EncryptBlocks2(ReadOnlySpan<byte> input, Span<byte> output)
//         {
//             Check.OutputLength(output, BlockSize * 2, "Output buffer too short");

//             if (totalLength == 0)
//             {
//                 InitCipher();
//             }

//             Span<byte> ctrBlock = stackalloc byte[BlockSize];

//             GetNextCtrBlock(ctrBlock);
// #if NETCOREAPP3_0_OR_GREATER
//             if (Sse2.IsSupported && Unsafe.SizeOf<Vector128<byte>>() == BlockSize)
//             {
//                 var t0 = Unsafe.ReadUnaligned<Vector128<byte>>(ref Unsafe.AsRef(input[0]));
//                 var t1 = Unsafe.ReadUnaligned<Vector128<byte>>(ref ctrBlock[0]);
//                 var t2 = Unsafe.ReadUnaligned<Vector128<byte>>(ref S[0]);

//                 t1 = Sse2.Xor(t1, t0);
//                 t2 = Sse2.Xor(t2, t1);

//                 Unsafe.WriteUnaligned(ref output[0], t1);
//                 Unsafe.WriteUnaligned(ref S[0], t2);
//             }
//             else
// #endif
//             {
//                 for (int i = 0; i < BlockSize; i += 4)
//                 {
//                     byte c0 = (byte)(ctrBlock[i + 0] ^ input[i + 0]);
//                     byte c1 = (byte)(ctrBlock[i + 1] ^ input[i + 1]);
//                     byte c2 = (byte)(ctrBlock[i + 2] ^ input[i + 2]);
//                     byte c3 = (byte)(ctrBlock[i + 3] ^ input[i + 3]);

//                     S[i + 0] ^= c0;
//                     S[i + 1] ^= c1;
//                     S[i + 2] ^= c2;
//                     S[i + 3] ^= c3;

//                     output[i + 0] = c0;
//                     output[i + 1] = c1;
//                     output[i + 2] = c2;
//                     output[i + 3] = c3;
//                 }
//             }
//             multiplier.MultiplyH(S);

//             input = input[BlockSize..];
//             output = output[BlockSize..];

//             GetNextCtrBlock(ctrBlock);
// #if NETCOREAPP3_0_OR_GREATER
//             if (Sse2.IsSupported && Unsafe.SizeOf<Vector128<byte>>() == BlockSize)
//             {
//                 var t0 = Unsafe.ReadUnaligned<Vector128<byte>>(ref Unsafe.AsRef(input[0]));
//                 var t1 = Unsafe.ReadUnaligned<Vector128<byte>>(ref ctrBlock[0]);
//                 var t2 = Unsafe.ReadUnaligned<Vector128<byte>>(ref S[0]);

//                 t1 = Sse2.Xor(t1, t0);
//                 t2 = Sse2.Xor(t2, t1);

//                 Unsafe.WriteUnaligned(ref output[0], t1);
//                 Unsafe.WriteUnaligned(ref S[0], t2);
//             }
//             else
// #endif
//             {
//                 for (int i = 0; i < BlockSize; i += 4)
//                 {
//                     byte c0 = (byte)(ctrBlock[i + 0] ^ input[i + 0]);
//                     byte c1 = (byte)(ctrBlock[i + 1] ^ input[i + 1]);
//                     byte c2 = (byte)(ctrBlock[i + 2] ^ input[i + 2]);
//                     byte c3 = (byte)(ctrBlock[i + 3] ^ input[i + 3]);

//                     S[i + 0] ^= c0;
//                     S[i + 1] ^= c1;
//                     S[i + 2] ^= c2;
//                     S[i + 3] ^= c3;

//                     output[i + 0] = c0;
//                     output[i + 1] = c1;
//                     output[i + 2] = c2;
//                     output[i + 3] = c3;
//                 }
//             }
//             multiplier.MultiplyH(S);

//             totalLength += BlockSize * 2;
//         }

//         [MethodImpl(MethodImplOptions.AggressiveInlining)]
//         private void GetNextCtrBlock(Span<byte> block)
//         {
//             if (blocksRemaining == 0)
//                 throw new InvalidOperationException("Attempt to process too many blocks");

//             blocksRemaining--;

//             Pack.UInt32_To_BE(++counter32, counter, 12);

//             cipher.ProcessBlock(counter, block);
//         }

//         private void ProcessPartial(Span<byte> partialBlock, Span<byte> output)
//         {
//             Span<byte> ctrBlock = stackalloc byte[BlockSize];
//             GetNextCtrBlock(ctrBlock);

//             if (forEncryption)
//             {
//                 GcmUtilities.Xor(partialBlock, ctrBlock, partialBlock.Length);
//                 gHASHPartial(S, partialBlock);
//             }
//             else
//             {
//                 gHASHPartial(S, partialBlock);
//                 GcmUtilities.Xor(partialBlock, ctrBlock, partialBlock.Length);
//             }

//             partialBlock.CopyTo(output);
//             totalLength += (uint)partialBlock.Length;
//         }
// #else
//         private void DecryptBlock(byte[] inBuf, int inOff, byte[] outBuf, int outOff)
//         {
//             Check.OutputLength(outBuf, outOff, BlockSize, "Output buffer too short");

//             if (totalLength == 0)
//             {
//                 InitCipher();
//             }

//             byte[] ctrBlock = new byte[BlockSize];

//             GetNextCtrBlock(ctrBlock);
//             {
//                 for (int i = 0; i < BlockSize; i += 4)
//                 {
//                     byte c0 = inBuf[inOff + i + 0];
//                     byte c1 = inBuf[inOff + i + 1];
//                     byte c2 = inBuf[inOff + i + 2];
//                     byte c3 = inBuf[inOff + i + 3];

//                     S[i + 0] ^= c0;
//                     S[i + 1] ^= c1;
//                     S[i + 2] ^= c2;
//                     S[i + 3] ^= c3;

//                     outBuf[outOff + i + 0] = (byte)(c0 ^ ctrBlock[i + 0]);
//                     outBuf[outOff + i + 1] = (byte)(c1 ^ ctrBlock[i + 1]);
//                     outBuf[outOff + i + 2] = (byte)(c2 ^ ctrBlock[i + 2]);
//                     outBuf[outOff + i + 3] = (byte)(c3 ^ ctrBlock[i + 3]);
//                 }
//             }
//             multiplier.MultiplyH(S);

//             totalLength += BlockSize;
//         }

//         private void DecryptBlocks2(byte[] inBuf, int inOff, byte[] outBuf, int outOff)
//         {
//             Check.OutputLength(outBuf, outOff, BlockSize * 2, "Output buffer too short");

//             if (totalLength == 0)
//             {
//                 InitCipher();
//             }

//             byte[] ctrBlock = new byte[BlockSize];

//             GetNextCtrBlock(ctrBlock);
//             {
//                 for (int i = 0; i < BlockSize; i += 4)
//                 {
//                     byte c0 = inBuf[inOff + i + 0];
//                     byte c1 = inBuf[inOff + i + 1];
//                     byte c2 = inBuf[inOff + i + 2];
//                     byte c3 = inBuf[inOff + i + 3];

//                     S[i + 0] ^= c0;
//                     S[i + 1] ^= c1;
//                     S[i + 2] ^= c2;
//                     S[i + 3] ^= c3;

//                     outBuf[outOff + i + 0] = (byte)(c0 ^ ctrBlock[i + 0]);
//                     outBuf[outOff + i + 1] = (byte)(c1 ^ ctrBlock[i + 1]);
//                     outBuf[outOff + i + 2] = (byte)(c2 ^ ctrBlock[i + 2]);
//                     outBuf[outOff + i + 3] = (byte)(c3 ^ ctrBlock[i + 3]);
//                 }
//             }
//             multiplier.MultiplyH(S);

//             inOff += BlockSize;
//             outOff += BlockSize;

//             GetNextCtrBlock(ctrBlock);
//             {
//                 for (int i = 0; i < BlockSize; i += 4)
//                 {
//                     byte c0 = inBuf[inOff + i + 0];
//                     byte c1 = inBuf[inOff + i + 1];
//                     byte c2 = inBuf[inOff + i + 2];
//                     byte c3 = inBuf[inOff + i + 3];

//                     S[i + 0] ^= c0;
//                     S[i + 1] ^= c1;
//                     S[i + 2] ^= c2;
//                     S[i + 3] ^= c3;

//                     outBuf[outOff + i + 0] = (byte)(c0 ^ ctrBlock[i + 0]);
//                     outBuf[outOff + i + 1] = (byte)(c1 ^ ctrBlock[i + 1]);
//                     outBuf[outOff + i + 2] = (byte)(c2 ^ ctrBlock[i + 2]);
//                     outBuf[outOff + i + 3] = (byte)(c3 ^ ctrBlock[i + 3]);
//                 }
//             }
//             multiplier.MultiplyH(S);

//             totalLength += BlockSize * 2;
//         }

//         private void EncryptBlock(byte[] inBuf, int inOff, byte[] outBuf, int outOff)
//         {
//             Check.OutputLength(outBuf, outOff, BlockSize, "Output buffer too short");

//             if (totalLength == 0)
//             {
//                 InitCipher();
//             }

//             byte[] ctrBlock = new byte[BlockSize];

//             GetNextCtrBlock(ctrBlock);
//             {
//                 for (int i = 0; i < BlockSize; i += 4)
//                 {
//                     byte c0 = (byte)(ctrBlock[i + 0] ^ inBuf[inOff + i + 0]);
//                     byte c1 = (byte)(ctrBlock[i + 1] ^ inBuf[inOff + i + 1]);
//                     byte c2 = (byte)(ctrBlock[i + 2] ^ inBuf[inOff + i + 2]);
//                     byte c3 = (byte)(ctrBlock[i + 3] ^ inBuf[inOff + i + 3]);

//                     S[i + 0] ^= c0;
//                     S[i + 1] ^= c1;
//                     S[i + 2] ^= c2;
//                     S[i + 3] ^= c3;

//                     outBuf[outOff + i + 0] = c0;
//                     outBuf[outOff + i + 1] = c1;
//                     outBuf[outOff + i + 2] = c2;
//                     outBuf[outOff + i + 3] = c3;
//                 }
//             }
//             multiplier.MultiplyH(S);

//             totalLength += BlockSize;
//         }

//         private void EncryptBlocks2(byte[] inBuf, int inOff, byte[] outBuf, int outOff)
//         {
//             Check.OutputLength(outBuf, outOff, BlockSize * 2, "Output buffer too short");

//             if (totalLength == 0)
//             {
//                 InitCipher();
//             }

//             byte[] ctrBlock = new byte[BlockSize];

//             GetNextCtrBlock(ctrBlock);
//             {
//                 for (int i = 0; i < BlockSize; i += 4)
//                 {
//                     byte c0 = (byte)(ctrBlock[i + 0] ^ inBuf[inOff + i + 0]);
//                     byte c1 = (byte)(ctrBlock[i + 1] ^ inBuf[inOff + i + 1]);
//                     byte c2 = (byte)(ctrBlock[i + 2] ^ inBuf[inOff + i + 2]);
//                     byte c3 = (byte)(ctrBlock[i + 3] ^ inBuf[inOff + i + 3]);

//                     S[i + 0] ^= c0;
//                     S[i + 1] ^= c1;
//                     S[i + 2] ^= c2;
//                     S[i + 3] ^= c3;

//                     outBuf[outOff + i + 0] = c0;
//                     outBuf[outOff + i + 1] = c1;
//                     outBuf[outOff + i + 2] = c2;
//                     outBuf[outOff + i + 3] = c3;
//                 }
//             }
//             multiplier.MultiplyH(S);

//             inOff += BlockSize;
//             outOff += BlockSize;

//             GetNextCtrBlock(ctrBlock);
//             {
//                 for (int i = 0; i < BlockSize; i += 4)
//                 {
//                     byte c0 = (byte)(ctrBlock[i + 0] ^ inBuf[inOff + i + 0]);
//                     byte c1 = (byte)(ctrBlock[i + 1] ^ inBuf[inOff + i + 1]);
//                     byte c2 = (byte)(ctrBlock[i + 2] ^ inBuf[inOff + i + 2]);
//                     byte c3 = (byte)(ctrBlock[i + 3] ^ inBuf[inOff + i + 3]);

//                     S[i + 0] ^= c0;
//                     S[i + 1] ^= c1;
//                     S[i + 2] ^= c2;
//                     S[i + 3] ^= c3;

//                     outBuf[outOff + i + 0] = c0;
//                     outBuf[outOff + i + 1] = c1;
//                     outBuf[outOff + i + 2] = c2;
//                     outBuf[outOff + i + 3] = c3;
//                 }
//             }
//             multiplier.MultiplyH(S);

//             totalLength += BlockSize * 2;
//         }

//         private void GetNextCtrBlock(byte[] block)
//         {
//             if (blocksRemaining == 0)
//                 throw new InvalidOperationException("Attempt to process too many blocks");

//             blocksRemaining--;

//             Pack.UInt32_To_BE(++counter32, counter, 12);

//             cipher.ProcessBlock(counter, 0, block, 0);
//         }

//         private void ProcessPartial(byte[] buf, int off, int len, byte[] output, int outOff)
//         {
//             byte[] ctrBlock = new byte[BlockSize];
//             GetNextCtrBlock(ctrBlock);

//             if (forEncryption)
//             {
//                 GcmUtilities.Xor(buf, off, ctrBlock, 0, len);
//                 gHASHPartial(S, buf, off, len);
//             }
//             else
//             {
//                 gHASHPartial(S, buf, off, len);
//                 GcmUtilities.Xor(buf, off, ctrBlock, 0, len);
//             }

//             Array.Copy(buf, off, output, outOff, len);
//             totalLength += (uint)len;
//         }
// #endif

//         private void gHASH(byte[] Y, byte[] b, int len)
//         {
//             for (int pos = 0; pos < len; pos += BlockSize)
//             {
//                 int num = System.Math.Min(len - pos, BlockSize);
//                 gHASHPartial(Y, b, pos, num);
//             }
//         }

// #if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
//         [MethodImpl(MethodImplOptions.AggressiveInlining)]
//         private void gHASHBlock(byte[] Y, ReadOnlySpan<byte> b)
//         {
//             GcmUtilities.Xor(Y, b);
//             multiplier.MultiplyH(Y);
//         }

//         [MethodImpl(MethodImplOptions.AggressiveInlining)]
//         private void gHASHPartial(byte[] Y, ReadOnlySpan<byte> b)
//         {
//             GcmUtilities.Xor(Y, b, b.Length);
//             multiplier.MultiplyH(Y);
//         }
// #else
//         private void gHASHBlock(byte[] Y, byte[] b)
//         {
//             GcmUtilities.Xor(Y, b);
//             multiplier.MultiplyH(Y);
//         }

//         private void gHASHBlock(byte[] Y, byte[] b, int off)
//         {
//             GcmUtilities.Xor(Y, b, off);
//             multiplier.MultiplyH(Y);
//         }
// #endif

//         private void gHASHPartial(byte[] Y, byte[] b, int off, int len)
//         {
//             GcmUtilities.Xor(Y, b, off, len);
//             multiplier.MultiplyH(Y);
//         }

//         private void CheckStatus()
//         {
//             if (!initialised)
//             {
//                 if (forEncryption)
//                 {
//                     throw new InvalidOperationException("GCM cipher cannot be reused for encryption");
//                 }
//                 throw new InvalidOperationException("GCM cipher needs to be initialised");
//             }
//         }
//     }
// }

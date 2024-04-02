using System;

using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Engines
{
    /**
    * support class for constructing intergrated encryption ciphers
    * for doing basic message exchanges on top of key agreement ciphers
    */
    public class IesEngine
    {
        private readonly IBasicAgreement     agree;
        private readonly IDerivationFunction kdf;
        private readonly IMac                mac;
        private readonly BufferedBlockCipher cipher;
        private readonly byte[]              macBuf;

        private bool				forEncryption;
        private ICipherParameters	privParam, pubParam;
        private IesParameters		param;

        /**
        * set up for use with stream mode, where the key derivation function
        * is used to provide a stream of bytes to xor with the message.
        *
        * @param agree the key agreement used as the basis for the encryption
        * @param kdf the key derivation function used for byte generation
        * @param mac the message authentication code generator for the message
        */
        public IesEngine(
            IBasicAgreement     agree,
            IDerivationFunction kdf,
            IMac                mac)
        {
            this.agree = agree;
            this.kdf = kdf;
            this.mac = mac;
            this.macBuf = new byte[mac.GetMacSize()];
//            this.cipher = null;
        }

        /**
        * set up for use in conjunction with a block cipher to handle the
        * message.
        *
        * @param agree the key agreement used as the basis for the encryption
        * @param kdf the key derivation function used for byte generation
        * @param mac the message authentication code generator for the message
        * @param cipher the cipher to used for encrypting the message
        */
        public IesEngine(
            IBasicAgreement     agree,
            IDerivationFunction kdf,
            IMac                mac,
            BufferedBlockCipher cipher)
        {
            this.agree = agree;
            this.kdf = kdf;
            this.mac = mac;
            this.macBuf = new byte[mac.GetMacSize()];
            this.cipher = cipher;
        }

        /**
        * Initialise the encryptor.
        *
        * @param forEncryption whether or not this is encryption/decryption.
        * @param privParam our private key parameters
        * @param pubParam the recipient's/sender's public key parameters
        * @param param encoding and derivation parameters.
        */
        public virtual void Init(
            bool                     forEncryption,
            ICipherParameters            privParameters,
            ICipherParameters            pubParameters,
            ICipherParameters            iesParameters)
        {
            this.forEncryption = forEncryption;
            this.privParam = privParameters;
            this.pubParam = pubParameters;
            this.param = (IesParameters)iesParameters;
        }

        private byte[] DecryptBlock(
            byte[]  in_enc,
            int     inOff,
            int     inLen,
            byte[]  z)
        {
            byte[]          M = null;
            KeyParameter    macKey = null;
            KdfParameters   kParam = new KdfParameters(z, param.GetDerivationV());
            int             macKeySize = param.MacKeySize;

            kdf.Init(kParam);

            // Ensure that the length of the input is greater than the MAC in bytes
            if (inLen < mac.GetMacSize())
                throw new InvalidCipherTextException("Length of input must be greater than the MAC");

            inLen -= mac.GetMacSize();

            if (cipher == null)     // stream mode
            {
                byte[] Buffer = GenerateKdfBytes(kParam, inLen + (macKeySize / 8));

                M = new byte[inLen];

                for (int i = 0; i != inLen; i++)
                {
                    M[i] = (byte)(in_enc[inOff + i] ^ Buffer[i]);
                }

                macKey = new KeyParameter(Buffer, inLen, (macKeySize / 8));
            }
            else
            {
                int cipherKeySize = ((IesWithCipherParameters)param).CipherKeySize;
                byte[] Buffer = GenerateKdfBytes(kParam, (cipherKeySize / 8) + (macKeySize / 8));

                cipher.Init(false, new KeyParameter(Buffer, 0, (cipherKeySize / 8)));

                M = cipher.DoFinal(in_enc, inOff, inLen);

                macKey = new KeyParameter(Buffer, (cipherKeySize / 8), (macKeySize / 8));
            }

            byte[] macIV = param.GetEncodingV();

            mac.Init(macKey);
            mac.BlockUpdate(in_enc, inOff, inLen);
            mac.BlockUpdate(macIV, 0, macIV.Length);
            mac.DoFinal(macBuf, 0);

            inOff += inLen;

            byte[] T1 = Arrays.CopyOfRange(in_enc, inOff, inOff + macBuf.Length);

            if (!Arrays.ConstantTimeAreEqual(T1, macBuf))
                throw (new InvalidCipherTextException("Invalid MAC."));

            return M;
        }

        private byte[] EncryptBlock(
            byte[]  input,
            int     inOff,
            int     inLen,
            byte[]  z)
        {
            byte[]          C = null;
            KeyParameter    macKey = null;
            KdfParameters   kParam = new KdfParameters(z, param.GetDerivationV());
            int             c_text_length = 0;
            int             macKeySize = param.MacKeySize;

            if (cipher == null)     // stream mode
            {
                byte[] Buffer = GenerateKdfBytes(kParam, inLen + (macKeySize / 8));

                C = new byte[inLen + mac.GetMacSize()];
                c_text_length = inLen;

                for (int i = 0; i != inLen; i++)
                {
                    C[i] = (byte)(input[inOff + i] ^ Buffer[i]);
                }

                macKey = new KeyParameter(Buffer, inLen, (macKeySize / 8));
            }
            else
            {
                int cipherKeySize = ((IesWithCipherParameters)param).CipherKeySize;
                byte[] Buffer = GenerateKdfBytes(kParam, (cipherKeySize / 8) + (macKeySize / 8));

                cipher.Init(true, new KeyParameter(Buffer, 0, (cipherKeySize / 8)));

                c_text_length = cipher.GetOutputSize(inLen);
                byte[] tmp = new byte[c_text_length];

                int len = cipher.ProcessBytes(input, inOff, inLen, tmp, 0);
                len += cipher.DoFinal(tmp, len);

                C = new byte[len + mac.GetMacSize()];
                c_text_length = len;

                Array.Copy(tmp, 0, C, 0, len);

                macKey = new KeyParameter(Buffer, (cipherKeySize / 8), (macKeySize / 8));
            }

            byte[] macIV = param.GetEncodingV();

            mac.Init(macKey);
            mac.BlockUpdate(C, 0, c_text_length);
            mac.BlockUpdate(macIV, 0, macIV.Length);
            //
            // return the message and it's MAC
            //
            mac.DoFinal(C, c_text_length);
            return C;
        }

        private byte[] GenerateKdfBytes(
            KdfParameters	kParam,
            int				length)
        {
            byte[] buf = new byte[length];

            kdf.Init(kParam);

            kdf.GenerateBytes(buf, 0, buf.Length);

            return buf;
        }

        public virtual byte[] ProcessBlock(
            byte[]  input,
            int     inOff,
            int     inLen)
        {
            agree.Init(privParam);

            BigInteger z = agree.CalculateAgreement(pubParam);

            byte[] zBytes = BigIntegers.AsUnsignedByteArray(agree.GetFieldSize(), z);

            try
            {
                return forEncryption
                    ?	EncryptBlock(input, inOff, inLen, zBytes)
                    :	DecryptBlock(input, inOff, inLen, zBytes);
            }
            finally
            {
                Array.Clear(zBytes, 0, zBytes.Length);
            }
        }
    }
}

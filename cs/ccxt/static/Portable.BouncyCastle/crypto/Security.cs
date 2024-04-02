using System;
using System.Text;

using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Digests;
using Org.BouncyCastle.Crypto.Engines;
using Org.BouncyCastle.Crypto.Generators;
using Org.BouncyCastle.Crypto.Modes;
using Org.BouncyCastle.Crypto.Paddings;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities.Encoders;

namespace crypto
{
    public class Security
    {
        // USAGE
        //var key = Security.GenerateText(32);
        //var iv = Security.GenerateText(16);
        //var encrypted = Security.Encrypt("MY SECRET", key, iv);
        //var decrypted = Security.Decrypt(encrypted, key, iv);

        /// <summary>
        /// Return a salted hash based on PBKDF2 for the UTF-8 encoding of the argument text.
        /// </summary>
        /// <param name="text">Provided key text</param>
        /// <param name="salt">Base64 encoded string representing the salt</param>
        /// <returns></returns>
        public static string ComputeHash(string text, string salt)
        {
            byte[] data = Encoding.UTF8.GetBytes(text);
            Sha512Digest sha = new Sha512Digest();
            Pkcs5S2ParametersGenerator gen = new Pkcs5S2ParametersGenerator(sha);

            gen.Init(data, Base64.Decode(salt), 2048);

            return Base64.ToBase64String(((KeyParameter)gen.GenerateDerivedParameters("AES", sha.GetDigestSize() * 8)).GetKey());
        }

        public static string Decrypt(string cipherText, string key, string iv)
        {
            IBufferedCipher cipher = CreateCipher(false, key, iv);
            byte[] textAsBytes = cipher.DoFinal(Base64.Decode(cipherText));

            return Encoding.UTF8.GetString(textAsBytes, 0, textAsBytes.Length);
        }

        public static string Encrypt(string plainText, string key, string iv)
        {
            IBufferedCipher cipher = CreateCipher(true, key, iv);

            return Base64.ToBase64String(cipher.DoFinal(Encoding.UTF8.GetBytes(plainText)));
        }

        public static string GenerateText(int size)
        {
            byte[] textAsBytes = new byte[size];
            SecureRandom secureRandom = SecureRandom.GetInstance("SHA256PRNG", true);

            secureRandom.NextBytes(textAsBytes);
            return Base64.ToBase64String(textAsBytes);
        }

        private static IBufferedCipher CreateCipher(bool isEncryption, string key, string iv)
        {
            IBufferedCipher cipher = new PaddedBufferedBlockCipher(new CbcBlockCipher(new RijndaelEngine()), new ISO10126d2Padding());
            KeyParameter keyParam = new KeyParameter(Base64.Decode(key));
            ICipherParameters cipherParams = (null == iv || iv.Length < 1)
                ? (ICipherParameters)keyParam
                : new ParametersWithIV(keyParam, Base64.Decode(iv));
            cipher.Init(isEncryption, cipherParams);
            return cipher;
        }
    }
}

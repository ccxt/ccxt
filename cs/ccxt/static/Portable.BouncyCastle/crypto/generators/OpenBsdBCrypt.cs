using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Generators
{
    /**
     * Password hashing scheme BCrypt,
     * designed by Niels Provos and David Mazières, using the
     * String format and the Base64 encoding
     * of the reference implementation on OpenBSD
     */
    public class OpenBsdBCrypt
    {
        private static readonly byte[] EncodingTable = // the Bcrypts encoding table for OpenBSD
        {
            (byte)'.', (byte)'/', (byte)'A', (byte)'B', (byte)'C', (byte)'D',
            (byte)'E', (byte)'F', (byte)'G', (byte)'H', (byte)'I', (byte)'J',
            (byte)'K', (byte)'L', (byte)'M', (byte)'N', (byte)'O', (byte)'P',
            (byte)'Q', (byte)'R', (byte)'S', (byte)'T', (byte)'U', (byte)'V',
            (byte)'W', (byte)'X', (byte)'Y', (byte)'Z', (byte)'a', (byte)'b',
            (byte)'c', (byte)'d', (byte)'e', (byte)'f', (byte)'g', (byte)'h',
            (byte)'i', (byte)'j', (byte)'k', (byte)'l', (byte)'m', (byte)'n',
            (byte)'o', (byte)'p', (byte)'q', (byte)'r', (byte)'s', (byte)'t',
            (byte)'u', (byte)'v', (byte)'w', (byte)'x', (byte)'y', (byte)'z',
            (byte)'0', (byte)'1', (byte)'2', (byte)'3', (byte)'4', (byte)'5',
            (byte)'6', (byte)'7', (byte)'8', (byte)'9'
        };

        /*
         * set up the decoding table.
         */
        private static readonly byte[] DecodingTable = new byte[128];
        private static readonly string DefaultVersion = "2y";
        private static readonly HashSet<string> AllowedVersions = new HashSet<string>();

        static OpenBsdBCrypt()
        {
            // Presently just the Bcrypt versions.
            AllowedVersions.Add("2a");
            AllowedVersions.Add("2y");
            AllowedVersions.Add("2b");

            for (int i = 0; i < DecodingTable.Length; i++)
            {
                DecodingTable[i] = (byte)0xff;
            }

            for (int i = 0; i < EncodingTable.Length; i++)
            {
                DecodingTable[EncodingTable[i]] = (byte)i;
            }
        }

        public OpenBsdBCrypt()
        {
        }

        /**
         * Creates a 60 character Bcrypt String, including
         * version, cost factor, salt and hash, separated by '$'
         *
         * @param version  the version, 2y,2b or 2a. (2a is not backwards compatible.)
         * @param cost     the cost factor, treated as an exponent of 2
         * @param salt     a 16 byte salt
         * @param password the password
         * @return a 60 character Bcrypt String
         */
        private static string CreateBcryptString(string version, byte[] password, byte[] salt, int cost)
        {
            if (!AllowedVersions.Contains(version))
                throw new ArgumentException("Version " + version + " is not accepted by this implementation.", "version");

            StringBuilder sb = new StringBuilder(60);
            sb.Append('$');
            sb.Append(version);
            sb.Append('$');
            sb.Append(cost < 10 ? ("0" + cost) : cost.ToString());
            sb.Append('$');
            sb.Append(EncodeData(salt));

            byte[] key = BCrypt.Generate(password, salt, cost);

            sb.Append(EncodeData(key));

            return sb.ToString();
        }

        /**
         * Creates a 60 character Bcrypt String, including
         * version, cost factor, salt and hash, separated by '$' using version
         * '2y'.
         *
         * @param cost     the cost factor, treated as an exponent of 2
         * @param salt     a 16 byte salt
         * @param password the password
         * @return a 60 character Bcrypt String
         */
        public static string Generate(char[] password, byte[] salt, int cost)
        {
            return Generate(DefaultVersion, password, salt, cost);
        }

        /**
         * Creates a 60 character Bcrypt String, including
         * version, cost factor, salt and hash, separated by '$'
         *
         * @param version  the version, may be 2b, 2y or 2a. (2a is not backwards compatible.)
         * @param cost     the cost factor, treated as an exponent of 2
         * @param salt     a 16 byte salt
         * @param password the password
         * @return a 60 character Bcrypt String
         */
        public static string Generate(string version, char[] password, byte[] salt, int cost)
        {
            if (!AllowedVersions.Contains(version))
                throw new ArgumentException("Version " + version + " is not accepted by this implementation.", "version");
            if (password == null)
                throw new ArgumentNullException("password");
            if (salt == null)
                throw new ArgumentNullException("salt");
            if (salt.Length != 16)
                throw new DataLengthException("16 byte salt required: " + salt.Length);

            if (cost < 4 || cost > 31) // Minimum rounds: 16, maximum 2^31
                throw new ArgumentException("Invalid cost factor.", "cost");

            byte[] psw = Strings.ToUtf8ByteArray(password);

            // 0 termination:

            byte[] tmp = new byte[psw.Length >= 72 ? 72 : psw.Length + 1];
            int copyLen = System.Math.Min(psw.Length, tmp.Length);
            Array.Copy(psw, 0, tmp, 0, copyLen);

            Array.Clear(psw, 0, psw.Length);

            string rv = CreateBcryptString(version, tmp, salt, cost);

            Array.Clear(tmp, 0, tmp.Length);

            return rv;
        }

        /**
         * Checks if a password corresponds to a 60 character Bcrypt String
         *
         * @param bcryptString a 60 character Bcrypt String, including
         *                     version, cost factor, salt and hash,
         *                     separated by '$'
         * @param password     the password as an array of chars
         * @return true if the password corresponds to the
         * Bcrypt String, otherwise false
         */
        public static bool CheckPassword(string bcryptString, char[] password)
        {
            // validate bcryptString:
            if (bcryptString.Length != 60)
                throw new DataLengthException("Bcrypt String length: " + bcryptString.Length + ", 60 required.");
            if (bcryptString[0] != '$' || bcryptString[3] != '$' || bcryptString[6] != '$')
                throw new ArgumentException("Invalid Bcrypt String format.", "bcryptString");

            string version = bcryptString.Substring(1, 2);
            if (!AllowedVersions.Contains(version))
                throw new ArgumentException("Bcrypt version '" + version + "' is not supported by this implementation", "bcryptString");

            int cost;
            try
            {
                cost = int.Parse(bcryptString.Substring(4, 2));
            }
            catch (Exception nfe)
            {
                throw new ArgumentException("Invalid cost factor: " + bcryptString.Substring(4, 2), "bcryptString", nfe);
            }
            if (cost < 4 || cost > 31)
                throw new ArgumentException("Invalid cost factor: " + cost + ", 4 < cost < 31 expected.");

            // check password:
            if (password == null)
                throw new ArgumentNullException("Missing password.");

            int start = bcryptString.LastIndexOf('$') + 1, end = bcryptString.Length - 31;
            byte[] salt = DecodeSaltString(bcryptString.Substring(start, end - start));

            string newBcryptString = Generate(version, password, salt, cost);

            return bcryptString.Equals(newBcryptString);
        }

        /*
         * encode the input data producing a Bcrypt base 64 string.
         *
         * @param 	a byte representation of the salt or the password
         * @return 	the Bcrypt base64 string
         */
        private static string EncodeData(byte[] data)
        {
            if (data.Length != 24 && data.Length != 16) // 192 bit key or 128 bit salt expected
                throw new DataLengthException("Invalid length: " + data.Length + ", 24 for key or 16 for salt expected");

            bool salt = false;
            if (data.Length == 16)//salt
            {
                salt = true;
                byte[] tmp = new byte[18];// zero padding
                Array.Copy(data, 0, tmp, 0, data.Length);
                data = tmp;
            }
            else // key
            {
                data[data.Length - 1] = (byte)0;
            }

            MemoryStream mOut = new MemoryStream();
            int len = data.Length;

            uint a1, a2, a3;
            int i;
            for (i = 0; i < len; i += 3)
            {
                a1 = data[i];
                a2 = data[i + 1];
                a3 = data[i + 2];

                mOut.WriteByte(EncodingTable[(a1 >> 2) & 0x3f]);
                mOut.WriteByte(EncodingTable[((a1 << 4) | (a2 >> 4)) & 0x3f]);
                mOut.WriteByte(EncodingTable[((a2 << 2) | (a3 >> 6)) & 0x3f]);
                mOut.WriteByte(EncodingTable[a3 & 0x3f]);
            }

            string result = Strings.FromByteArray(mOut.ToArray());
            int resultLen = salt
                ? 22  // truncate padding
                : result.Length - 1;

            return result.Substring(0, resultLen);
        }


        /*
         * decodes the bcrypt base 64 encoded SaltString
         *
         * @param 		a 22 character Bcrypt base 64 encoded String 
         * @return 		the 16 byte salt
         * @exception 	DataLengthException if the length 
         * 				of parameter is not 22
         * @exception 	InvalidArgumentException if the parameter
         * 				contains a value other than from Bcrypts base 64 encoding table
         */
        private static byte[] DecodeSaltString(string saltString)
        {
            char[] saltChars = saltString.ToCharArray();

            MemoryStream mOut = new MemoryStream(16);
            byte b1, b2, b3, b4;

            if (saltChars.Length != 22)// bcrypt salt must be 22 (16 bytes)
                throw new DataLengthException("Invalid base64 salt length: " + saltChars.Length + " , 22 required.");

            // check string for invalid characters:
            for (int i = 0; i < saltChars.Length; i++)
            {
                int value = saltChars[i];
                if (value > 122 || value < 46 || (value > 57 && value < 65))
                    throw new ArgumentException("Salt string contains invalid character: " + value, "saltString");
            }

            // Padding: add two '\u0000'
            char[] tmp = new char[22 + 2];
            Array.Copy(saltChars, 0, tmp, 0, saltChars.Length);
            saltChars = tmp;

            int len = saltChars.Length;

            for (int i = 0; i < len; i += 4)
            {
                b1 = DecodingTable[saltChars[i]];
                b2 = DecodingTable[saltChars[i + 1]];
                b3 = DecodingTable[saltChars[i + 2]];
                b4 = DecodingTable[saltChars[i + 3]];

                mOut.WriteByte((byte)((b1 << 2) | (b2 >> 4)));
                mOut.WriteByte((byte)((b2 << 4) | (b3 >> 2)));
                mOut.WriteByte((byte)((b3 << 6) | b4));
            }

            byte[] saltBytes = mOut.ToArray();

            // truncate:
            byte[] tmpSalt = new byte[16];
            Array.Copy(saltBytes, 0, tmpSalt, 0, tmpSalt.Length);
            saltBytes = tmpSalt;

            return saltBytes;
        }
    }
}

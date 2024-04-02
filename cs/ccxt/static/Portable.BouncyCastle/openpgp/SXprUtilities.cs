using System;
using System.IO;

using Org.BouncyCastle.Utilities.IO;

namespace Org.BouncyCastle.Bcpg.OpenPgp
{
    /**
     * Utility functions for looking a S-expression keys. This class will move when it finds a better home!
     * <p>
     * Format documented here:
     * http://git.gnupg.org/cgi-bin/gitweb.cgi?p=gnupg.git;a=blob;f=agent/keyformat.txt;h=42c4b1f06faf1bbe71ffadc2fee0fad6bec91a97;hb=refs/heads/master
     * </p>
     */
    public sealed class SXprUtilities
    {
        private SXprUtilities()
        {
        }

        private static int ReadLength(Stream input, int ch)
        {
            int len = ch - '0';

            while ((ch = input.ReadByte()) >= 0 && ch != ':')
            {
                len = len * 10 + ch - '0';
            }

            return len;
        }

        internal static string ReadString(Stream input, int ch)
        {
            int len = ReadLength(input, ch);

            char[] chars = new char[len];

            for (int i = 0; i != chars.Length; i++)
            {
                chars[i] = (char)input.ReadByte();
            }

            return new string(chars);
        }

        internal static byte[] ReadBytes(Stream input, int ch)
        {
            int len = ReadLength(input, ch);

            byte[] data = new byte[len];

            Streams.ReadFully(input, data);

            return data;
        }

        internal static S2k ParseS2k(Stream input)
        {
            SkipOpenParenthesis(input);

            string alg = ReadString(input, input.ReadByte());
            byte[] iv = ReadBytes(input, input.ReadByte());
            long iterationCount = long.Parse(ReadString(input, input.ReadByte()));

            SkipCloseParenthesis(input);

            // we have to return the actual iteration count provided.
            return new MyS2k(HashAlgorithmTag.Sha1, iv, iterationCount);
        }

        internal static void SkipOpenParenthesis(Stream input)
        {
            int ch = input.ReadByte();
            if (ch != '(')
                throw new IOException("unknown character encountered");
        }

        internal static void SkipCloseParenthesis(Stream input)
        {
            int ch = input.ReadByte();
            if (ch != ')')
                throw new IOException("unknown character encountered");
        }

        private class MyS2k : S2k
        {
            private readonly long mIterationCount64;

            internal MyS2k(HashAlgorithmTag algorithm, byte[] iv, long iterationCount64)
                : base(algorithm, iv, (int)iterationCount64)
            {
                this.mIterationCount64 = iterationCount64;
            }

            public override long IterationCount
            {
                get { return mIterationCount64; }
            }
        }
    }
}

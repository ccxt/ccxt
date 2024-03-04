using System;
using Cryptography.ECDSA.Internal.Sha256;

namespace Cryptography.ECDSA
{
    public class Sha256Manager
    {
        private readonly Sha256T _sha;

        public Sha256Manager()
        {
            _sha = new Sha256T();
            Hash.Initialize(_sha);
        }


        public void Write(byte[] data)
        {
            Hash.Write(_sha, data, (UInt32)data.Length);
        }

        public void Write(byte[] data, int len)
        {
            Hash.Write(_sha, data, (UInt32)len);
        }

        public byte[] FinalizeAndGetResult()
        {
            byte[] outputSer = new byte[32];
            Hash.Finalize(_sha, outputSer);
            return outputSer;
        }


        
        public static byte[] GetHash(byte[] data)
        {
            Sha256T sha = new Sha256T();
            Hash.Initialize(sha);
            Hash.Write(sha, data, (UInt32)data.Length);
            byte[] outputSer = new byte[32];
            Hash.Finalize(sha, outputSer);
            return outputSer;
        }
    }
}

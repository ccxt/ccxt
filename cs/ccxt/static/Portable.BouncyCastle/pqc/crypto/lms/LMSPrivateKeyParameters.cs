using System;
using System.Collections.Generic;
using System.IO;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Pqc.Crypto.Lms;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.IO;

using static Org.BouncyCastle.Pqc.Crypto.Lms.LMS;

namespace Org.BouncyCastle.Pqc.Crypto.Lms
{
    public class LMSPrivateKeyParameters
        : LMSKeyParameters, ILMSContextBasedSigner
    {
        private static CacheKey T1 = new CacheKey(1);
        private static CacheKey[] internedKeys = new CacheKey[129];

        static LMSPrivateKeyParameters()
        {
            internedKeys[1] = T1;
            for (int i = 2; i < internedKeys.Length; i++)
            {
                internedKeys[i] = new CacheKey(i);
            }
        }

        private byte[] I;
        private LMSigParameters parameters;
        private LMOtsParameters otsParameters;
        private int maxQ;
        private byte[] masterSecret;
        private Dictionary<CacheKey, byte[]> tCache;
        private int maxCacheR;
        private IDigest tDigest;

        private int q;

        //
        // These are not final because they can be generated.
        // They also do not need to be persisted.
        //
        private LMSPublicKeyParameters publicKey;


        public LMSPrivateKeyParameters(LMSigParameters lmsParameter, LMOtsParameters otsParameters, int q, byte[] I, int maxQ, byte[] masterSecret)
            : base(true)
        {
            this.parameters = lmsParameter;
            this.otsParameters = otsParameters;
            this.q = q;
            this.I = Arrays.Clone(I);
            this.maxQ = maxQ;
            this.masterSecret = Arrays.Clone(masterSecret);
            this.maxCacheR = 1 << (parameters.GetH() + 1);
            this.tCache = new Dictionary<CacheKey, byte[]>();
            this.tDigest = DigestUtilities.GetDigest(lmsParameter.GetDigestOid());
        }

        private LMSPrivateKeyParameters(LMSPrivateKeyParameters parent, int q, int maxQ)
            : base(true)
        {
            this.parameters = parent.parameters;
            this.otsParameters = parent.otsParameters;
            this.q = q;
            this.I = parent.I;
            this.maxQ = maxQ;
            this.masterSecret = parent.masterSecret;
            this.maxCacheR = 1 << parameters.GetH();
            this.tCache = parent.tCache;
            this.tDigest = DigestUtilities.GetDigest(parameters.GetDigestOid());
            this.publicKey = parent.publicKey;
        }

        public static LMSPrivateKeyParameters GetInstance(byte[] privEnc, byte[] pubEnc)
        {
            LMSPrivateKeyParameters pKey = GetInstance(privEnc);
        
            pKey.publicKey = LMSPublicKeyParameters.GetInstance(pubEnc);

            return pKey;
        }

        public static LMSPrivateKeyParameters GetInstance(Object src)
        {
            if (src is LMSPrivateKeyParameters)
            {
                return (LMSPrivateKeyParameters)src;
            }
            //TODO
            else if (src is BinaryReader)
            {
                BinaryReader dIn = (BinaryReader)src;
            
                /*
                .u32str(0) // version
                .u32str(parameters.getType()) // type
                .u32str(otsParameters.getType()) // ots type
                .bytes(I) // I at 16 bytes
                .u32str(q) // q
                .u32str(maxQ) // maximum q
                .u32str(masterSecret.length) // length of master secret.
                .bytes(masterSecret) // the master secret
                .build();
                 */
            
            
                if (dIn.ReadInt32() != 0) // todo check endienness
                {
                    throw new Exception("expected version 0 lms private key");
                }
                
                // todo check endienness
                byte[] data = ((BinaryReader) src).ReadBytes(4);
                Array.Reverse(data);
                int paramType = BitConverter.ToInt32(data, 0);
                LMSigParameters parameter = LMSigParameters.GetParametersForType(paramType);
                
                data = ((BinaryReader) src).ReadBytes(4);
                Array.Reverse(data);
                paramType = BitConverter.ToInt32(data, 0);
                
                LMOtsParameters otsParameter = LMOtsParameters.GetParametersForType(paramType);
                byte[] I = new byte[16];
                dIn.Read(I, 0, I.Length);
            
                
                data = ((BinaryReader) src).ReadBytes(4);
                Array.Reverse(data);
                int q =  BitConverter.ToInt32(data, 0);
                
                data = ((BinaryReader) src).ReadBytes(4);
                Array.Reverse(data);
                int maxQ = BitConverter.ToInt32(data, 0);
                
                data = ((BinaryReader) src).ReadBytes(4);
                Array.Reverse(data);
                int l = BitConverter.ToInt32(data, 0);
                
                
                if (l < 0)
                {
                    throw new Exception("secret length less than zero");
                }
                if (l > dIn.BaseStream.Length)
                {
                    throw new IOException("secret length exceeded " + dIn.BaseStream.Length);
                }
                byte[] masterSecret = new byte[l];
                dIn.Read(masterSecret, 0, masterSecret.Length);
            
                return new LMSPrivateKeyParameters(parameter, otsParameter, q, I, maxQ, masterSecret);
            
            }
            else if (src is byte[])
            {
                BinaryReader input = null;
                try // 1.5 / 1.6 compatibility
                {
                    input = new BinaryReader(new MemoryStream((byte[])src, false));
                    return GetInstance(input);
                }
                finally
                {
                    if (input != null)
                    {
                        input.Close();
                    }
                }
            }
            else if (src is MemoryStream)
            {
                return GetInstance(Streams.ReadAll((Stream)src));
            }

            throw new ArgumentException($"cannot parse {src}");
        }


        internal LMOtsPrivateKey GetCurrentOtsKey()
        {
            lock (this)
            {
                if (q >= maxQ)
                {
                    throw new Exception("ots private keys expired");
                }
                return new LMOtsPrivateKey(otsParameters, I, q, masterSecret);
            }
        }

        /**
         * Return the key index (the q value).
         *
         * @return private key index number.
         */
        public int GetIndex()
        {
            lock (this)
                return q;
        }

        internal void IncIndex()
        {
            lock (this) 
                q++;
        }

        public LMSContext GenerateLmsContext()
        {
            // Step 1.
            LMSigParameters lmsParameter = this.GetSigParameters();

            // Step 2
            int h = lmsParameter.GetH();
            int q = GetIndex();
            LMOtsPrivateKey otsPk = GetNextOtsPrivateKey();

            int i = 0;
            int r = (1 << h) + q;
            byte[][] path = new byte[h][];

            while (i < h)
            {
                int tmp = (r / (1 << i)) ^ 1;

                path[i] = this.FindT(tmp);
                i++;
            }

            return otsPk.GetSignatureContext(this.GetSigParameters(), path);
        }

        public byte[] GenerateSignature(LMSContext context)
        {
            try
            {
                return GenerateSign(context).GetEncoded();
            }
            catch (IOException e)
            {
                throw new Exception($"unable to encode signature: {e.Message}", e);
            }
        }

        LMOtsPrivateKey GetNextOtsPrivateKey()
        {
            lock (this)
            {
                if (q >= maxQ)
                {
                    throw new Exception("ots private key exhausted");
                }
                LMOtsPrivateKey otsPrivateKey = new LMOtsPrivateKey(otsParameters, I, q, masterSecret);
                IncIndex();
                return otsPrivateKey;
            }
        }


        /**
         * Return a key that can be used usageCount times.
         * <p>
         * Note: this will use the range [index...index + usageCount) for the current key.
         * </p>
         *
         * @param usageCount the number of usages the key should have.
         * @return a key based on the current key that can be used usageCount times.
         */
        public LMSPrivateKeyParameters ExtractKeyShard(int usageCount)
        {
            lock (this)
            {
                if (q + usageCount >= maxQ)
                {
                    throw new ArgumentException("usageCount exceeds usages remaining");
                }
                LMSPrivateKeyParameters keyParameters = new LMSPrivateKeyParameters(this, q, q + usageCount);
                q += usageCount;

                return keyParameters;
            }
        }

        public LMSigParameters GetSigParameters()
        {
            return parameters;
        }

        public LMOtsParameters GetOtsParameters()
        {
            return otsParameters;
        }

        public byte[] GetI()
        {
            return Arrays.Clone(I);
        }

        public byte[] GetMasterSecret()
        {
            return Arrays.Clone(masterSecret);
        }

        public long GetUsagesRemaining()
        {
            return maxQ - q;
        }

        public LMSPublicKeyParameters GetPublicKey()
        {
            lock (this)
            {
                if (publicKey == null)
                {
                    publicKey = new LMSPublicKeyParameters(parameters, otsParameters, this.FindT(T1), I);
                }
                return publicKey;
            }
        }

        byte[] FindT(int r)
        {
            if (r < maxCacheR)
            {
                return FindT(r < internedKeys.Length ? internedKeys[r] : new CacheKey(r));
            }

            return CalcT(r);
        }

        private byte[] FindT(CacheKey key)
        {
            lock (tCache)
            {
                byte[] t;
                if (!tCache.TryGetValue(key, out t))
                {
                    t = CalcT(key.index);
                    tCache[key] = t;
                }

                return t;
            }
        }

        private byte[] CalcT(int r)
        {
            int h = this.GetSigParameters().GetH();

            int twoToh = 1 << h;

            byte[] T;

            // r is a base 1 index.

            if (r >= twoToh)
            {
                LmsUtils.ByteArray(this.GetI(), tDigest);
                LmsUtils.U32Str(r, tDigest);
                LmsUtils.U16Str(D_LEAF, tDigest);
                //
                // These can be pre generated at the time of key generation and held within the private key.
                // However it will cost memory to have them stick around.
                //
                byte[] K = LM_OTS.lms_ots_generatePublicKey(this.GetOtsParameters(), this.GetI(), (r - twoToh), this.GetMasterSecret());

                LmsUtils.ByteArray(K, tDigest);
                T = new byte[tDigest.GetDigestSize()];
                tDigest.DoFinal(T, 0);
                return T;
            }

            byte[] t2r = FindT(2 * r);
            byte[] t2rPlus1 = FindT((2 * r + 1));

            LmsUtils.ByteArray(this.GetI(), tDigest);
            LmsUtils.U32Str(r, tDigest);
            LmsUtils.U16Str(D_INTR, tDigest);
            LmsUtils.ByteArray(t2r, tDigest);
            LmsUtils.ByteArray(t2rPlus1, tDigest);
            T = new byte[tDigest.GetDigestSize()];
            tDigest.DoFinal(T, 0);

            return T;
        }

        public override bool Equals(Object o)
        {
            if (this == o)
            {
                return true;
            }
            if (o == null || GetType() != o.GetType())
            {
                return false;
            }

            LMSPrivateKeyParameters that = (LMSPrivateKeyParameters)o;

            if (q != that.q)
            {
                return false;
            }
            if (maxQ != that.maxQ)
            {
                return false;
            }
            if (!Arrays.AreEqual(I, that.I))
            {
                return false;
            }
            if (parameters != null ? !parameters.Equals(that.parameters) : that.parameters != null)
            {
                return false;
            }
            if (otsParameters != null ? !otsParameters.Equals(that.otsParameters) : that.otsParameters != null)
            {
                return false;
            }
            if (!Arrays.AreEqual(masterSecret, that.masterSecret))
            {
                return false;
            }

            //
            // Only compare public keys if they both exist.
            // Otherwise we would trigger the creation of one or both of them
            //
            if (publicKey != null && that.publicKey != null)
            {
                return publicKey.Equals(that.publicKey);
            }

            return true;
        }

        public override int GetHashCode()
        {
            int result = q;
            result = 31 * result + Arrays.GetHashCode(I);
            result = 31 * result + (parameters != null ? parameters.GetHashCode() : 0);
            result = 31 * result + (otsParameters != null ? otsParameters.GetHashCode() : 0);
            result = 31 * result + maxQ;
            result = 31 * result + Arrays.GetHashCode(masterSecret);
            result = 31 * result + (publicKey != null ? publicKey.GetHashCode() : 0);
            return result;
        }

        public override byte[] GetEncoded()
        {
            //
            // NB there is no formal specification for the encoding of private keys.
            // It is implementation dependent.
            //
            // Format:
            //     version u32
            //     type u32
            //     otstype u32
            //     I u8x16
            //     q u32
            //     maxQ u32
            //     master secret Length u32
            //     master secret u8[]
            //

            return Composer.Compose()
                .U32Str(0) // version
                .U32Str(parameters.GetType()) // type
                .U32Str(otsParameters.GetType()) // ots type
                .Bytes(I) // I at 16 bytes
                .U32Str(q) // q
                .U32Str(maxQ) // maximum q
                .U32Str(masterSecret.Length) // length of master secret.
                .Bytes(masterSecret) // the master secret
                .Build();
        }

        class CacheKey
        {
            internal int index;

            public CacheKey(int index)
            {
                this.index = index;
            }

            public override int GetHashCode()
            {
                return index;
            }

            public override bool Equals(Object o)
            {
                if (o is CacheKey)
                {
                    return ((CacheKey)o).index == this.index;
                }

                return false;
            }
        }
    }
}
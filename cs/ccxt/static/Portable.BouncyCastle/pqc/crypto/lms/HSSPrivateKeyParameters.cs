using System;
using System.Collections.Generic;
using System.IO;

using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.IO;

// using static Org.BouncyCastle.Pqc.Crypto.Lms.HSS.rangeTestKeys;

namespace Org.BouncyCastle.Pqc.Crypto.Lms
{
    public class HSSPrivateKeyParameters
        : LMSKeyParameters, ILMSContextBasedSigner
    {
        private int l;
        private bool isShard;
        private IList<LMSPrivateKeyParameters> keys;
        private IList<LMSSignature> sig;
        private long indexLimit;
        private long index = 0;

        private HSSPublicKeyParameters publicKey;

        public HSSPrivateKeyParameters(int l, IList<LMSPrivateKeyParameters> keys, IList<LMSSignature> sig, long index,
            long indexLimit)
    	    :base(true)
        {
            this.l = l;
            this.keys = new List<LMSPrivateKeyParameters>(keys);
            this.sig = new List<LMSSignature>(sig);
            this.index = index;
            this.indexLimit = indexLimit;
            this.isShard = false;

            //
            // Correct Intermediate LMS values will be constructed during reset to index.
            //
            ResetKeyToIndex();
        }

        private HSSPrivateKeyParameters(int l, IList<LMSPrivateKeyParameters> keys, IList<LMSSignature> sig, long index,
            long indexLimit, bool isShard)
    	    :base(true)
        {

            this.l = l;
            // this.keys =  new UnmodifiableListProxy(keys);
            // this.sig =  new UnmodifiableListProxy(sig);
            this.keys = new List<LMSPrivateKeyParameters>(keys);
            this.sig = new List<LMSSignature>(sig);
            this.index = index;
            this.indexLimit = indexLimit;
            this.isShard = isShard;
        }

        public static HSSPrivateKeyParameters GetInstance(byte[] privEnc, byte[] pubEnc)
        {
            HSSPrivateKeyParameters pKey = GetInstance(privEnc);

            pKey.publicKey = HSSPublicKeyParameters.GetInstance(pubEnc);

            return pKey;
        }

        public static HSSPrivateKeyParameters GetInstance(Object src)
        {
            if (src is HSSPrivateKeyParameters)
            {
                return (HSSPrivateKeyParameters)src;
            }
            else if (src is BinaryReader)
            {
                byte[] data = ((BinaryReader) src).ReadBytes(4);
                Array.Reverse(data);
                int version = BitConverter.ToInt32(data, 0);
                if (version != 0)
                {
                    throw new Exception("unknown version for hss private key");
                }
                data = ((BinaryReader) src).ReadBytes(4);
                Array.Reverse(data);
                int d = BitConverter.ToInt32(data, 0);
                
                data = ((BinaryReader) src).ReadBytes(8);
                Array.Reverse(data);
                long index = BitConverter.ToInt64(data, 0);
                
                data = ((BinaryReader) src).ReadBytes(8);
                Array.Reverse(data);
                long maxIndex = BitConverter.ToInt64(data, 0);;
                
                data = ((BinaryReader) src).ReadBytes(1);
                Array.Reverse(data);
                bool limited =  BitConverter.ToBoolean(data, 0);
                

                var keys = new List<LMSPrivateKeyParameters>();
                var signatures = new List<LMSSignature>();

                for (int t = 0; t < d; t++)
                {
                    keys.Add(LMSPrivateKeyParameters.GetInstance(src));
                }

                for (int t = 0; t < d - 1; t++)
                {
                    signatures.Add(LMSSignature.GetInstance(src));
                }

                return new HSSPrivateKeyParameters(d, keys, signatures, index, maxIndex, limited);
            }
            else if (src is byte[])
            {
                BinaryReader input = null;
                try // 1.5 / 1.6 compatibility
                {
                    input = new BinaryReader(new MemoryStream((byte[])src));
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

            throw new Exception($"cannot parse {src}");
        }

        public int L => l;

        public  long GetIndex()
        {
            lock (this)
                return index;
        }

        public LMSParameters[] GetLmsParameters()
        {
            lock (this)
            {
                int len = keys.Count;

                LMSParameters[] parms = new LMSParameters[len];

                for (int i = 0; i < len; i++)
                {
                    LMSPrivateKeyParameters lmsPrivateKey = (LMSPrivateKeyParameters) keys[i];

                    parms[i] = new LMSParameters(lmsPrivateKey.GetSigParameters(), lmsPrivateKey.GetOtsParameters());
                }

                return parms;
            }
        }

        internal void IncIndex()
        {
            lock (this)
            {
                index++;
            }
        }

        private static HSSPrivateKeyParameters MakeCopy(HSSPrivateKeyParameters privateKeyParameters)
        {
            try
            {
                return HSSPrivateKeyParameters.GetInstance(privateKeyParameters.GetEncoded());
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        protected void UpdateHierarchy(IList<LMSPrivateKeyParameters> newKeys, IList<LMSSignature> newSig)
        {
            lock (this)
            {
                keys = new List<LMSPrivateKeyParameters>(newKeys);
                sig = new List<LMSSignature>(newSig);
            }
        }

        public bool IsShard()
        {
            return isShard;
        }

        public long IndexLimit => indexLimit;

        public long GetUsagesRemaining()
        {
            return indexLimit - index;
        }

        LMSPrivateKeyParameters GetRootKey()
        {
            return keys[0] as LMSPrivateKeyParameters;
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
        public HSSPrivateKeyParameters ExtractKeyShard(int usageCount)
        {
            lock (this)
            {
                if (GetUsagesRemaining() < usageCount)
                    throw new ArgumentException("usageCount exceeds usages remaining in current leaf");

                long maxIndexForShard = index + usageCount;
                long shardStartIndex = index;

                //
                // Move this keys index along
                //
                index += usageCount;

                var keys = new List<LMSPrivateKeyParameters>(this.GetKeys());
                var sig = new List<LMSSignature>(this.GetSig());

                HSSPrivateKeyParameters shard = MakeCopy(new HSSPrivateKeyParameters(l, keys, sig, shardStartIndex,
                    maxIndexForShard, true));

                ResetKeyToIndex();

                return shard;
            }
        }


        public IList<LMSPrivateKeyParameters> GetKeys()
        {
            lock (this)
            {
                return keys;
            }
        }

        internal IList<LMSSignature>GetSig()
        {
            lock (this)
            {
                return sig;
            }
        }

        /**
         * Reset to index will ensure that all LMS keys are correct for a given HSS index value.
         * Normally LMS keys updated in sync with their parent HSS key but in cases of sharding
         * the normal monotonic updating does not apply and the state of the LMS keys needs to be
         * reset to match the current HSS index.
         */
        void ResetKeyToIndex()
        {
            // Extract the original keys
            var originalKeys = GetKeys();


            long[] qTreePath = new long[originalKeys.Count];
            long q = GetIndex();

            for (int t = originalKeys.Count - 1; t >= 0; t--)
            {
                LMSigParameters sigParameters = (originalKeys[t] as LMSPrivateKeyParameters).GetSigParameters();
                int mask = (1 << sigParameters.GetH()) - 1;
                qTreePath[t] = q & mask;
                q >>= sigParameters.GetH();
            }

            bool changed = false;
            
            
            // LMSPrivateKeyParameters[] keys =  originalKeys.ToArray(new LMSPrivateKeyParameters[originalKeys.Count]);//  new LMSPrivateKeyParameters[originalKeys.Size()];
            // LMSSignature[] sig = this.sig.toArray(new LMSSignature[this.sig.Count]);//   new LMSSignature[originalKeys.Size() - 1];
            //
            
            LMSPrivateKeyParameters originalRootKey = this.GetRootKey();


            //
            // We need to replace the root key to a new q value.
            //
            if (((LMSPrivateKeyParameters)keys[0]).GetIndex() - 1 != qTreePath[0])
            {
                keys[0] = LMS.GenerateKeys(
                    originalRootKey.GetSigParameters(),
                    originalRootKey.GetOtsParameters(),
                    (int)qTreePath[0], originalRootKey.GetI(), originalRootKey.GetMasterSecret());
                changed = true;
            }


            for (int i = 1; i < qTreePath.Length; i++)
            {

                LMSPrivateKeyParameters intermediateKey = keys[i - 1] as LMSPrivateKeyParameters;

                byte[] childI = new byte[16];
                byte[] childSeed = new byte[32];
                SeedDerive derive = new SeedDerive(
                    intermediateKey.GetI(),
                    intermediateKey.GetMasterSecret(),
                    DigestUtilities.GetDigest(intermediateKey.GetOtsParameters().GetDigestOid()));
                derive.SetQ((int)qTreePath[i - 1]);
                derive.SetJ(~1);

                derive.deriveSeed(childSeed, true);
                byte[] postImage = new byte[32];
                derive.deriveSeed(postImage, false);
                Array.Copy(postImage, 0, childI, 0, childI.Length);

                //
                // Q values in LMS keys post increment after they are used.
                // For intermediate keys they will always be out by one from the derived q value (qValues[i])
                // For the end key its value will match so no correction is required.
                //
                bool lmsQMatch =
                    (i < qTreePath.Length - 1) ? qTreePath[i] == ((LMSPrivateKeyParameters)keys[i]).GetIndex() - 1 : qTreePath[i] == ((LMSPrivateKeyParameters)keys[i]).GetIndex();

                //
                // Equality is I and seed being equal and the lmsQMath.
                // I and seed are derived from this nodes parent and will change if the parent q, I, seed changes.
                //
                bool seedEquals = Arrays.AreEqual(childI, ((LMSPrivateKeyParameters)keys[i]).GetI())
                    && Arrays.AreEqual(childSeed, ((LMSPrivateKeyParameters)keys[i]).GetMasterSecret());


                if (!seedEquals)
                {
                    //
                    // This means the parent has changed.
                    //
                    keys[i] = LMS.GenerateKeys(
                        ((LMSPrivateKeyParameters)originalKeys[i]).GetSigParameters(),
                        ((LMSPrivateKeyParameters)originalKeys[i]).GetOtsParameters(),
                        (int)qTreePath[i], childI, childSeed);

                    //
                    // Ensure post increment occurs on parent and the new public key is signed.
                    //
                    sig[i - 1] = LMS.GenerateSign((LMSPrivateKeyParameters)keys[i - 1], ((LMSPrivateKeyParameters)keys[i]).GetPublicKey().ToByteArray());
                    changed = true;
                }
                else if (!lmsQMatch)
                {

                    //
                    // Q is different so we can generate a new private key but it will have the same public
                    // key so we do not need to sign it again.
                    //
                    keys[i] = LMS.GenerateKeys(
                        ((LMSPrivateKeyParameters)originalKeys[i]).GetSigParameters(),
                        ((LMSPrivateKeyParameters)originalKeys[i]).GetOtsParameters(),
                        (int)qTreePath[i], childI, childSeed);
                    changed = true;
                }

            }


            if (changed)
            {
                // We mutate the HSS key here!
                UpdateHierarchy(keys, sig);
            }

        }

        public HSSPublicKeyParameters GetPublicKey()
        {
            lock (this)
                return new HSSPublicKeyParameters(l, GetRootKey().GetPublicKey());
        }

        internal void ReplaceConsumedKey(int d)
        {

            SeedDerive deriver = (keys[d - 1] as LMSPrivateKeyParameters).GetCurrentOtsKey().GetDerivationFunction();
            deriver.SetJ(~1);
            byte[] childRootSeed = new byte[32];
            deriver.deriveSeed(childRootSeed, true);
            byte[] postImage = new byte[32];
            deriver.deriveSeed(postImage, false);
            byte[] childI = new byte[16];
            Array.Copy(postImage, 0, childI, 0, childI.Length);

            var newKeys = new List<LMSPrivateKeyParameters>(keys);

            //
            // We need the parameters from the LMS key we are replacing.
            //
            LMSPrivateKeyParameters oldPk = keys[d] as LMSPrivateKeyParameters;


            newKeys[d] = LMS.GenerateKeys(oldPk.GetSigParameters(), oldPk.GetOtsParameters(), 0, childI, childRootSeed);

            var newSig = new List<LMSSignature>(sig);

            newSig[d - 1] = LMS.GenerateSign(newKeys[d - 1] as LMSPrivateKeyParameters,
                (newKeys[d] as LMSPrivateKeyParameters).GetPublicKey().ToByteArray());

            this.keys = new List<LMSPrivateKeyParameters>(newKeys);
            this.sig = new List<LMSSignature>(newSig);
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

            HSSPrivateKeyParameters that = (HSSPrivateKeyParameters)o;

            if (l != that.l)
            {
                return false;
            }
            if (isShard != that.isShard)
            {
                return false;
            }
            if (indexLimit != that.indexLimit)
            {
                return false;
            }
            if (index != that.index)
            {
                return false;
            }
            if (!CompareLists(keys, that.keys))
            {
                return false;
            }
            return CompareLists(sig, that.sig);
        }

        private bool CompareLists<T>(IList<T> arr1, IList<T> arr2)
        {
            for (int i=0; i<arr1.Count && i<arr2.Count; i++)
            {
                if (!Object.Equals(arr1[i], arr2[i]))
                {
                    return false;
                }
            }
            return true;
        }
        

        public override byte[] GetEncoded()
        {
            lock (this)
            {
                //
                // Private keys are implementation dependent.
                //

                Composer composer = Composer.Compose()
                    .U32Str(0) // Version.
                    .U32Str(l)
                    .U64Str(index)
                    .U64Str(indexLimit)
                    .GetBool(isShard); // Depth

                foreach (LMSPrivateKeyParameters key in keys)
                {
                    composer.Bytes(key);
                }

                foreach (LMSSignature s in sig)
                {
                    composer.Bytes(s);
                }

                return composer.Build();
            }
        }

        public override int GetHashCode()
        {
            int result = l;
            result = 31 * result + (isShard ? 1 : 0);
            result = 31 * result + keys.GetHashCode();
            result = 31 * result + sig.GetHashCode();
            result = 31 * result + (int)(indexLimit ^ (indexLimit >> 32));
            result = 31 * result + (int)(index ^ (index >> 32));
            return result;
        }

        protected Object Clone()
        {
            return MakeCopy(this);
        }

        public LMSContext GenerateLmsContext()
        {
            LMSSignedPubKey[] signed_pub_key;
            LMSPrivateKeyParameters nextKey;
            int L = this.L;

            lock (this)
            {
                HSS.RangeTestKeys(this);

                var keys = this.GetKeys();
                var sig = this.GetSig();

                nextKey = this.GetKeys()[(L - 1)] as LMSPrivateKeyParameters;

                // Step 2. Stand in for sig[L-1]
                int i = 0;
                signed_pub_key = new LMSSignedPubKey[L - 1];
                while (i < L - 1)
                {
                    signed_pub_key[i] = new LMSSignedPubKey(
                        sig[i] as LMSSignature,
                        (keys[i + 1] as LMSPrivateKeyParameters).GetPublicKey());
                    i = i + 1;
                }

                //
                // increment the index.
                //
                this.IncIndex();
            }

            return nextKey.GenerateLmsContext().WithSignedPublicKeys(signed_pub_key);
        }

        public byte[] GenerateSignature(LMSContext context)
        {
            try
            {
                return HSS.GenerateSignature(L, context).GetEncoded();
            }
            catch (IOException e)
            {
                throw new Exception($"unable to encode signature: {e.Message}", e);
            }
        }
    }
}
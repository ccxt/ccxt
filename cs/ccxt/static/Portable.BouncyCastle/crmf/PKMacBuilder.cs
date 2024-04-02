using System;
using System.IO;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Cmp;
using Org.BouncyCastle.Asn1.Iana;
using Org.BouncyCastle.Asn1.Oiw;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.IO;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crmf
{
    internal class PKMacStreamCalculator
        : IStreamCalculator
    {
        private readonly MacSink _stream;

        public PKMacStreamCalculator(IMac mac)
        {
            _stream = new MacSink(mac);
        }

        public Stream Stream
        {
            get { return _stream; }
        }

        public object GetResult()
        {
            return new DefaultPKMacResult(_stream.Mac);
        }
    }

    internal class PKMacFactory
        : IMacFactory
    {
        protected readonly PbmParameter parameters;
        private readonly byte[] key;

        public PKMacFactory(byte[] key, PbmParameter parameters)
        {
            this.key = Arrays.Clone(key);
            this.parameters = parameters;
        }

        public virtual object AlgorithmDetails
        {
            get { return new AlgorithmIdentifier(CmpObjectIdentifiers.passwordBasedMac, parameters); }
        }

        public virtual IStreamCalculator CreateCalculator()
        {
            IMac mac = MacUtilities.GetMac(parameters.Mac.Algorithm);
            mac.Init(new KeyParameter(key));
            return new PKMacStreamCalculator(mac);
        }
    }

    internal class DefaultPKMacResult
        : IBlockResult
    {
        private readonly IMac mac;

        public DefaultPKMacResult(IMac mac)
        {
            this.mac = mac;
        }

        public byte[] Collect()
        {
            byte[] res = new byte[mac.GetMacSize()];
            mac.DoFinal(res, 0);
            return res;
        }

        public int Collect(byte[] sig, int sigOff)
        {
            byte[] signature = Collect();
            signature.CopyTo(sig, sigOff);
            return signature.Length;
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public int Collect(Span<byte> destination)
        {
            byte[] result = Collect();
            result.CopyTo(destination);
            return result.Length;
        }
#endif
    }

    public class PKMacBuilder
    {
        private AlgorithmIdentifier owf;
        private AlgorithmIdentifier mac;
        private IPKMacPrimitivesProvider provider;
        private SecureRandom random;
        private PbmParameter parameters;
        private int iterationCount;
        private int saltLength = 20;
        private int maxIterations;

        /// <summary>
        /// Default, IterationCount = 1000, OIW=IdSha1, Mac=HmacSHA1
        /// </summary>
        public PKMacBuilder() :
            this(new AlgorithmIdentifier(OiwObjectIdentifiers.IdSha1), 1000, new AlgorithmIdentifier(IanaObjectIdentifiers.HmacSha1, DerNull.Instance), new DefaultPKMacPrimitivesProvider())
        {
        }

        /// <summary>
        /// Defaults with IPKMacPrimitivesProvider
        /// </summary>
        /// <param name="provider"></param>
        public PKMacBuilder(IPKMacPrimitivesProvider provider) :
            this(new AlgorithmIdentifier(OiwObjectIdentifiers.IdSha1), 1000, new AlgorithmIdentifier(IanaObjectIdentifiers.HmacSha1, DerNull.Instance), provider)
        {
        }

        /// <summary>
        /// Create.
        /// </summary>
        /// <param name="provider">The Mac provider</param>
        /// <param name="digestAlgorithmIdentifier">Digest Algorithm Id</param>
        /// <param name="macAlgorithmIdentifier">Mac Algorithm Id</param>
        public PKMacBuilder(IPKMacPrimitivesProvider provider, AlgorithmIdentifier digestAlgorithmIdentifier, AlgorithmIdentifier macAlgorithmIdentifier) :
            this(digestAlgorithmIdentifier, 1000, macAlgorithmIdentifier, provider)
        {
        }

        /// <summary>
        /// Create a PKMAC builder enforcing a ceiling on the maximum iteration count.
        /// </summary>
        /// <param name="provider">supporting calculator</param>
        /// <param name="maxIterations">max allowable value for iteration count.</param>
        public PKMacBuilder(IPKMacPrimitivesProvider provider, int maxIterations)
        {
            this.provider = provider;
            this.maxIterations = maxIterations;
        }

        private PKMacBuilder(AlgorithmIdentifier digestAlgorithmIdentifier, int iterationCount, AlgorithmIdentifier macAlgorithmIdentifier, IPKMacPrimitivesProvider provider)
        {
            this.iterationCount = iterationCount;
            this.mac = macAlgorithmIdentifier;
            this.owf = digestAlgorithmIdentifier;
            this.provider = provider;
        }

        /**
         * Set the salt length in octets.
         *
         * @param saltLength length in octets of the salt to be generated.
         * @return the generator
         */
        public PKMacBuilder SetSaltLength(int saltLength)
        {
            if (saltLength < 8)
                throw new ArgumentException("salt length must be at least 8 bytes");

            this.saltLength = saltLength;

            return this;
        }

        /// <summary>
        /// Set the iteration count.
        /// </summary>
        /// <param name="iterationCount">the iteration count.</param>
        /// <returns>this</returns>
        /// <exception cref="ArgumentException">if iteration count is less than 100</exception>
        public PKMacBuilder SetIterationCount(int iterationCount)
        {
            if (iterationCount < 100)
                throw new ArgumentException("iteration count must be at least 100");

            CheckIterationCountCeiling(iterationCount);

            this.iterationCount = iterationCount;

            return this;
        }

        /// <summary>
        /// Set PbmParameters
        /// </summary>
        /// <param name="parameters">The parameters.</param>
        /// <returns>this</returns>
        public PKMacBuilder SetParameters(PbmParameter parameters)
        {
            CheckIterationCountCeiling(parameters.IterationCount.IntValueExact);

            this.parameters = parameters;

            return this;
        }

        /// <summary>
        /// The Secure random
        /// </summary>
        /// <param name="random">The random.</param>
        /// <returns>this</returns>
        public PKMacBuilder SetSecureRandom(SecureRandom random)
        {
            this.random = random;

            return this;
        }

        /// <summary>
        /// Build an IMacFactory.
        /// </summary>
        /// <param name="password">The password.</param>
        /// <returns>IMacFactory</returns>
        public IMacFactory Build(char[] password)
        {
            if (parameters != null)
                return GenCalculator(parameters, password);

            byte[] salt = new byte[saltLength];

            if (random == null)
            {
                this.random = new SecureRandom();
            }

            random.NextBytes(salt);

            return GenCalculator(new PbmParameter(salt, owf, iterationCount, mac), password);
        }

        private void CheckIterationCountCeiling(int iterationCount)
        {
            if (maxIterations > 0 && iterationCount > maxIterations)
                throw new ArgumentException("iteration count exceeds limit (" + iterationCount + " > " + maxIterations + ")");
        }

        private IMacFactory GenCalculator(PbmParameter parameters, char[] password)
        {
            // From RFC 4211
            //
            //   1.  Generate a random salt value S
            //
            //   2.  Append the salt to the pw.  K = pw || salt.
            //
            //   3.  Hash the value of K.  K = HASH(K)
            //
            //   4.  Iter = Iter - 1.  If Iter is greater than zero.  Goto step 3.
            //
            //   5.  Compute an HMAC as documented in [HMAC].
            //
            //       MAC = HASH( K XOR opad, HASH( K XOR ipad, data) )
            //
            //       Where opad and ipad are defined in [HMAC].
            byte[] pw = Strings.ToUtf8ByteArray(password);
            byte[] salt = parameters.Salt.GetOctets();
            byte[] K = new byte[pw.Length + salt.Length];

            Array.Copy(pw, 0, K, 0, pw.Length);
            Array.Copy(salt, 0, K, pw.Length, salt.Length);

            IDigest digest = provider.CreateDigest(parameters.Owf);

            int iter = parameters.IterationCount.IntValueExact;

            digest.BlockUpdate(K, 0, K.Length);

            K = new byte[digest.GetDigestSize()];

            digest.DoFinal(K, 0);

            while (--iter > 0)
            {
                digest.BlockUpdate(K, 0, K.Length);

                digest.DoFinal(K, 0);
            }

            byte[] key = K;

            return new PKMacFactory(key, parameters);
        }
    }
}

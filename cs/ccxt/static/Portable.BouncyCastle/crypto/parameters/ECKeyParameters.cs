using System;
using System.Collections.Generic;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.X9;
using Org.BouncyCastle.Crypto.Generators;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Crypto.Parameters
{
    public abstract class ECKeyParameters
        : AsymmetricKeyParameter
    {
        // NB: Use a Dictionary so we can lookup the upper case version
        private static readonly Dictionary<string, string> Algorithms =
            new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            { "EC", "EC" },
            { "ECDSA", "ECDSA" },
            { "ECDH", "ECDH" },
            { "ECDHC", "ECDHC" },
            { "ECGOST3410", "ECGOST3410" },
            { "ECMQV", "ECMQV" },
        };

        private readonly string algorithm;
        private readonly ECDomainParameters parameters;
        private readonly DerObjectIdentifier publicKeyParamSet;

        protected ECKeyParameters(
            string				algorithm,
            bool				isPrivate,
            ECDomainParameters	parameters)
            : base(isPrivate)
        {
            if (algorithm == null)
                throw new ArgumentNullException("algorithm");
            if (parameters == null)
                throw new ArgumentNullException("parameters");

            this.algorithm = VerifyAlgorithmName(algorithm);
            this.parameters = parameters;
        }

        protected ECKeyParameters(
            string				algorithm,
            bool				isPrivate,
            DerObjectIdentifier	publicKeyParamSet)
            : base(isPrivate)
        {
            if (algorithm == null)
                throw new ArgumentNullException("algorithm");
            if (publicKeyParamSet == null)
                throw new ArgumentNullException("publicKeyParamSet");

            this.algorithm = VerifyAlgorithmName(algorithm);
            this.parameters = LookupParameters(publicKeyParamSet);
            this.publicKeyParamSet = publicKeyParamSet;
        }

        public string AlgorithmName
        {
            get { return algorithm; }
        }

        public ECDomainParameters Parameters
        {
            get { return parameters; }
        }

        public DerObjectIdentifier PublicKeyParamSet
        {
            get { return publicKeyParamSet; }
        }

        public override bool Equals(
            object obj)
        {
            if (obj == this)
                return true;

            ECDomainParameters other = obj as ECDomainParameters;

            if (other == null)
                return false;

            return Equals(other);
        }

        protected bool Equals(
            ECKeyParameters other)
        {
            return parameters.Equals(other.parameters) && base.Equals(other);
        }

        public override int GetHashCode()
        {
            return parameters.GetHashCode() ^ base.GetHashCode();
        }

        internal ECKeyGenerationParameters CreateKeyGenerationParameters(
            SecureRandom random)
        {
            if (publicKeyParamSet != null)
            {
                return new ECKeyGenerationParameters(publicKeyParamSet, random);
            }

            return new ECKeyGenerationParameters(parameters, random);
        }

        internal static string VerifyAlgorithmName(string algorithm)
        {
            if (!Algorithms.TryGetValue(algorithm, out var upper))
                throw new ArgumentException("unrecognised algorithm: " + algorithm, nameof(algorithm));

            return upper;
        }

        internal static ECDomainParameters LookupParameters(
            DerObjectIdentifier publicKeyParamSet)
        {
            if (publicKeyParamSet == null)
                throw new ArgumentNullException("publicKeyParamSet");

            X9ECParameters x9 = ECKeyPairGenerator.FindECCurveByOid(publicKeyParamSet);

            if (x9 == null)
                throw new ArgumentException("OID is not a valid public key parameter set", "publicKeyParamSet");

            return new ECDomainParameters(x9);
        }
    }
}

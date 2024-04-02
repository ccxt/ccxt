using Org.BouncyCastle.Pqc.Crypto.Ntru.Polynomials;

namespace Org.BouncyCastle.Pqc.Crypto.Ntru.ParameterSets
{
    internal abstract class NtruParameterSet
    {
        internal int N { get; }
        internal int LogQ { get; }
        internal int SeedBytes { get; }
        internal int PrfKeyBytes { get; }
        internal int SharedKeyBytes { get; }

        internal NtruParameterSet(int n, int logQ, int seedBytes, int prfKeyBytes, int sharedKeyBytes)
        {
            N = n;
            LogQ = logQ;
            SeedBytes = seedBytes;
            PrfKeyBytes = prfKeyBytes;
            SharedKeyBytes = sharedKeyBytes;
        }

        internal abstract Polynomial CreatePolynomial();

        internal int Q()
        {
            return 1 << LogQ;
        }

        internal int SampleIidBytes()
        {
            return N - 1;
        }

        internal int SampleFixedTypeBytes()
        {
            return (30 * (N - 1) + 7) / 8;
        }

        internal abstract int SampleFgBytes();

        internal abstract int SampleRmBytes();

        internal int PackDegree()
        {
            return N - 1;
        }

        internal int PackTrinaryBytes()
        {
            return (PackDegree() + 4) / 5;
        }

        internal int OwcpaMsgBytes()
        {
            return 2 * PackTrinaryBytes();
        }

        internal int OwcpaPublicKeyBytes()
        {
            return (LogQ * PackDegree() + 7) / 8;
        }

        internal int OwcpaSecretKeyBytes()
        {
            return 2 * PackTrinaryBytes() + OwcpaPublicKeyBytes();
        }

        internal int OwcpaBytes()
        {
            return (LogQ * PackDegree() + 7) / 8;
        }

        internal int NtruPublicKeyBytes()
        {
            return OwcpaPublicKeyBytes();
        }

        internal int NtruSecretKeyBytes()
        {
            return OwcpaSecretKeyBytes() + PrfKeyBytes;
        }

        internal int NtruCiphertextBytes()
        {
            return OwcpaBytes();
        }
    }
}
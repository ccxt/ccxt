namespace Org.BouncyCastle.Crypto
{
    public interface IEncapsulatedSecretExtractor
    {
        /// <summary>
        /// Generate an exchange pair based on the recipient public key.
        /// </summary>
        /// <param name="encapsulation"> the encapsulated secret.</param>
        byte[] ExtractSecret(byte[] encapsulation);

        /// <summary>
        /// The length in bytes of the encapsulation.
        /// </summary>
        int EncapsulationLength { get;  }
    }
}
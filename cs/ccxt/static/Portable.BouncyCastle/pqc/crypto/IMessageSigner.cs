using Org.BouncyCastle.Crypto;

namespace Org.BouncyCastle.Pqc.Crypto
{
    /**
     * Base interface for a PQC signing algorithm.
     */
    public interface IMessageSigner
    {
        /**
         * initialise the signer for signature generation or signature
         * verification.
         *
         * @param forSigning true if we are generating a signature, false
         *                   otherwise.
         * @param param      key parameters for signature generation.
         */
        void Init(bool forSigning, ICipherParameters param);

        /**
         * sign the passed in message (usually the output of a hash function).
         *
         * @param message the message to be signed.
         * @return the signature of the message
         */
        byte[] GenerateSignature(byte[] message);

        /**
         * verify the message message against the signature value.
         *
         * @param message the message that was supposed to have been signed.
         * @param signature the signature of the message
         */
        bool VerifySignature(byte[] message, byte[] signature);
    }

}
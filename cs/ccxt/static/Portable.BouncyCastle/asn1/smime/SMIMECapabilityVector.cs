using Org.BouncyCastle.Asn1;

namespace Org.BouncyCastle.Asn1.Smime
{
    /**
     * Handler for creating a vector S/MIME Capabilities
     */
    public class SmimeCapabilityVector
    {
        private readonly Asn1EncodableVector capabilities = new Asn1EncodableVector();

		public void AddCapability(
            DerObjectIdentifier capability)
        {
            capabilities.Add(new DerSequence(capability));
        }

		public void AddCapability(
            DerObjectIdentifier capability,
            int                 value)
        {
			capabilities.Add(new DerSequence(capability, new DerInteger(value)));
        }

		public void AddCapability(
            DerObjectIdentifier capability,
            Asn1Encodable		parameters)
        {
			capabilities.Add(new DerSequence(capability, parameters));
        }

		public Asn1EncodableVector ToAsn1EncodableVector()
        {
            return capabilities;
        }
    }
}

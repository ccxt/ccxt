using Nethereum.ABI.FunctionEncoding;

namespace Nethereum.ABI.Model
{
    public class ErrorABI
    {
        private readonly SignatureEncoder signatureEncoder;

        private string sha3Signature;

        public ErrorABI(string name)
        {
            Name = name;
            signatureEncoder = new SignatureEncoder();
        }

        public string Name { get; }
        public Parameter[] InputParameters { get; set; }

        public string Sha3Signature
        {
            get
            {
                if (sha3Signature != null) return sha3Signature;
                sha3Signature = signatureEncoder.GenerateSha3Signature(Name, InputParameters, 4);
                return sha3Signature;
            }
        }
    }
}

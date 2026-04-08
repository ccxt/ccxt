using Nethereum.ABI.FunctionEncoding;
using System.Linq;

namespace Nethereum.ABI.Model
{
    public class EventABI
    {
        private readonly SignatureEncoder signatureEncoder;
        private string sha3Signature;
        private int? numberOfIndexes;

        public EventABI(string name) : this(name, false)
        {
        }

        public EventABI(string name, bool isAnonymous)
        {
            Name = name;
            IsAnonymous = isAnonymous;
            signatureEncoder = new SignatureEncoder();
        }

        public string Name { get; }
        public bool IsAnonymous { get; set; }

        public Parameter[] InputParameters { get; set; }

        public string Sha3Signature
        {
            get
            {
                if (sha3Signature != null) return sha3Signature;
                sha3Signature = signatureEncoder.GenerateSha3Signature(Name, InputParameters);
                return sha3Signature;
            }
        }

        public int NumberOfIndexes
        {
            get
            {
                if(numberOfIndexes == null)
                {
                    numberOfIndexes = InputParameters.Count(x => x.Indexed == true);
                }
                return numberOfIndexes.Value;
            }
        }
    }
}
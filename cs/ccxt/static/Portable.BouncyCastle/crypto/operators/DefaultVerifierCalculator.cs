using System;
using System.IO;

using Org.BouncyCastle.Crypto.IO;

namespace Org.BouncyCastle.Crypto.Operators
{
    public class DefaultVerifierCalculator
        : IStreamCalculator
    {
        private readonly SignerSink mSignerSink;

        public DefaultVerifierCalculator(ISigner signer)
        {
            this.mSignerSink = new SignerSink(signer);
        }

        public Stream Stream
        {
            get { return mSignerSink; }
        }

        public object GetResult()
        {
            return new DefaultVerifierResult(mSignerSink.Signer);
        }
    }
}

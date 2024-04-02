using System;

namespace Org.BouncyCastle.Tls
{
    /// <summary>Processor interface for an SRP identity.</summary>
    public interface TlsSrpIdentity
    {
        byte[] GetSrpIdentity();

        byte[] GetSrpPassword();
    }
}

using System;
using System.IO;

namespace Org.BouncyCastle.Tls
{
    public interface TlsCloseable
    {
        /// <exception cref="IOException"/>
        void Close();
    }
}

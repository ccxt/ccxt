using System;
using System.IO;

namespace Org.BouncyCastle.Tls
{
    public interface DatagramReceiver
    {
        /// <exception cref="IOException"/>
        int GetReceiveLimit();

        /// <exception cref="IOException"/>
        int Receive(byte[] buf, int off, int len, int waitMillis);
    }
}

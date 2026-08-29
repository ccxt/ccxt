using System;

namespace Cryptography.ECDSA
{
    public class Callback : EventArgs
    {
        public Callback()
        {
        }

        public Callback(string message)
        {
            Message = message;
        }

        public string Message;
    }
}
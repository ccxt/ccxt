using System;

namespace Cryptography.ECDSA.Internal.Secp256K1
{
    internal class ContextStruct
    {
        public EcMultContext EcMultCtx;
        public EcmultGenContext EcMultGenCtx;
        public EventHandler<Callback> IllegalCallback;
        public EventHandler<Callback> ErrorCallback;

        public ContextStruct()
        {
            EcMultCtx = new EcMultContext();
            EcMultGenCtx = new EcmultGenContext();
        }
    };
}
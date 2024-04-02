using System;

namespace Org.BouncyCastle.Tls
{
    public abstract class RecordFormat
    {
        public const int TypeOffset = 0;
        public const int VersionOffset = 1;
        public const int LengthOffset = 3;
        public const int FragmentOffset = 5;
    }
}

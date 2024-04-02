using System;

using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Parameters
{
public sealed class FpeParameters
    : ICipherParameters
{
    private readonly KeyParameter key;
    private readonly int radix;
    private readonly byte[] tweak;
    private readonly bool useInverse;

    public FpeParameters(KeyParameter key, int radix, byte[] tweak): this(key, radix, tweak, false)
    {
        
    }

    public FpeParameters(KeyParameter key, int radix, byte[] tweak, bool useInverse)
    {
        this.key = key;
        this.radix = radix;
        this.tweak = Arrays.Clone(tweak);
        this.useInverse = useInverse;
    }

    public KeyParameter Key
    {
        get { return key; }
    }

    public int Radix
    {
        get { return radix; }
    }

    public bool UseInverseFunction
    {
        get { return useInverse; }
    }

    public byte[] GetTweak()
    {
        return Arrays.Clone(tweak);
    }
}
}

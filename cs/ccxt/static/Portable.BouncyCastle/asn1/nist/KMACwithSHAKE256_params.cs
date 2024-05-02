using Org.BouncyCastle.Utilities;
using System;

namespace Org.BouncyCastle.Asn1.Nist
{
    /// <summary>
    /// KMACwithSHAKE256-params ::= SEQUENCE {
    ///     kMACOutputLength     INTEGER DEFAULT 512, -- Output length in bits
    ///     customizationString  OCTET STRING DEFAULT ''H
    /// } 
    /// </summary>
public class KMacWithShake256Params : Asn1Encodable
{
    private static readonly byte[] EMPTY_STRING = new byte[0];
    private static readonly int DEF_LENGTH = 512;

    private readonly int outputLength;
    private readonly byte[] customizationString;

    public KMacWithShake256Params(int outputLength)
    {
        this.outputLength = outputLength;
        this.customizationString = EMPTY_STRING;
    }

    public KMacWithShake256Params(int outputLength, byte[] customizationString)
    {
        this.outputLength = outputLength;
        this.customizationString = Arrays.Clone(customizationString);
    }

    public static KMacWithShake256Params GetInstance(object o)
    {
        if (o is KMacWithShake256Params)
        {
            return (KMacWithShake256Params)o;
        }
        else if (o != null)
        {
            return new KMacWithShake256Params(Asn1Sequence.GetInstance(o));
        }

        return null;
    }

    private KMacWithShake256Params(Asn1Sequence seq)
    {
        if (seq.Count > 2)
            throw new InvalidOperationException("sequence size greater than 2");

        if (seq.Count == 2)
        {
            this.outputLength = DerInteger.GetInstance(seq[0]).IntValueExact;
            this.customizationString = Arrays.Clone(Asn1OctetString.GetInstance(seq[1]).GetOctets());
        }
        else if (seq.Count == 1)
        {
            if (seq[0] is DerInteger)
            {
                this.outputLength = DerInteger.GetInstance(seq[0]).IntValueExact;
                this.customizationString = EMPTY_STRING;
            }
            else
            {
                this.outputLength = DEF_LENGTH;
                this.customizationString = Arrays.Clone(Asn1OctetString.GetInstance(seq[0]).GetOctets());
            }
        }
        else
        {
            this.outputLength = DEF_LENGTH;
            this.customizationString = EMPTY_STRING;
        }
    }

    public int OutputLength
    {
        get { return outputLength; }
    }

    public byte[] CustomizationString
    {
        get { return Arrays.Clone(customizationString); }
    }

    public override Asn1Object ToAsn1Object()
    {
        Asn1EncodableVector v = new Asn1EncodableVector();
        if (outputLength != DEF_LENGTH)
        {
            v.Add(new DerInteger(outputLength));
        }

        if (customizationString.Length != 0)
        {
            v.Add(new DerOctetString(CustomizationString));
        }

        return new DerSequence(v);
    }
}
}

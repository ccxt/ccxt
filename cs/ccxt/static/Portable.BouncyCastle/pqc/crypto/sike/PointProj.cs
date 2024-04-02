namespace Org.BouncyCastle.Pqc.Crypto.Sike
{
internal class PointProj
{
    internal PointProj(uint nwords_field)
    {
        X = Utils.InitArray(2, nwords_field);
        Z = Utils.InitArray(2, nwords_field);
    }
    public ulong[][] X;
    public ulong[][] Z;
}

}
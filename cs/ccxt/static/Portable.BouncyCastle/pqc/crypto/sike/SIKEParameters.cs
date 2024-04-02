namespace Org.BouncyCastle.Pqc.Crypto.Sike
{
public class SIKEParameters
{

    public static SIKEParameters sikep434 = new SIKEParameters(434, false,"sikep434");
    public static SIKEParameters sikep503 = new SIKEParameters(503, false,"sikep503");
    public static SIKEParameters sikep610 = new SIKEParameters(610, false,"sikep610");
    public static SIKEParameters sikep751 = new SIKEParameters(751, false,"sikep751");

    public static SIKEParameters sikep434_compressed = new SIKEParameters(434, true,"sikep434_compressed");
    public static SIKEParameters sikep503_compressed = new SIKEParameters(503, true,"sikep503_compressed");
    public static SIKEParameters sikep610_compressed = new SIKEParameters(610, true,"sikep610_compressed");
    public static SIKEParameters sikep751_compressed = new SIKEParameters(751, true,"sikep751_compressed");

    private string name;
    private SIKEEngine engine;
    public SIKEParameters(int ver, bool isCompressed, string name)
    {
        this.name = name;
        this.engine = new SIKEEngine(ver, isCompressed, null);
    }

    internal SIKEEngine GetEngine()
    {
        return engine;
    }

        public string Name => name;
        public int DefaultKeySize => (int)this.engine.GetDefaultSessionKeySize();
    }

}
using Main;
namespace Main;

partial class bitcoincom : fmfwio
{
    public override object describe()
    {
        return this.deepExtend(base.describe(), new Dictionary<string, object>() {
            { "id", "bitcoincom" },
            { "alias", true },
        });
    }
}

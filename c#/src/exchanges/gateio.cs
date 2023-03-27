using Main;
namespace Main;

partial class gateio : gate
{
    public override object describe()
    {
        return this.deepExtend(base.describe(), new Dictionary<string, object>() {
            { "id", "gateio" },
            { "alias", true },
        });
    }
}

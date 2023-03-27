using Main;
namespace Main;

partial class huobipro : huobi
{
    public override object describe()
    {
        // this is an alias for backward-compatibility
        // to be removed soon
        return this.deepExtend(base.describe(), new Dictionary<string, object>() {
            { "id", "huobipro" },
            { "alias", true },
            { "name", "Huobi Pro" },
        });
    }
}

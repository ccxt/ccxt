using Main;
namespace Main;

partial class okex : okx
{
    public override object describe()
    {
        return this.deepExtend(base.describe(), new Dictionary<string, object>() {
            { "id", "okex" },
            { "alias", true },
        });
    }
}

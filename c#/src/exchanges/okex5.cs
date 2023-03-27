using Main;
namespace Main;

partial class okex5 : okex
{
    public override object describe()
    {
        return this.deepExtend(base.describe(), new Dictionary<string, object>() {
            { "id", "okex5" },
            { "alias", true },
        });
    }
}

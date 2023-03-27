using Main;
namespace Main;

partial class bitbay : zonda
{
    public override object describe()
    {
        return this.deepExtend(base.describe(), new Dictionary<string, object>() {
            { "id", "bitbay" },
            { "alias", true },
        });
    }
}

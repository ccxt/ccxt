using Main;
namespace Main;

partial class bequant : hitbtc
{
    public override object describe()
    {
        return this.deepExtend(base.describe(), new Dictionary<string, object>() {
            { "id", "bequant" },
            { "name", "Bequant" },
            { "countries", new List<object>() {"MT"} },
            { "pro", true },
            { "urls", new Dictionary<string, object>() {
                { "logo", "https://user-images.githubusercontent.com/1294454/55248342-a75dfe00-525a-11e9-8aa2-05e9dca943c6.jpg" },
                { "api", new Dictionary<string, object>() {
                    { "public", "https://api.bequant.io" },
                    { "private", "https://api.bequant.io" },
                } },
                { "www", "https://bequant.io" },
                { "doc", new List<object>() {"https://api.bequant.io/"} },
                { "fees", new List<object>() {"https://bequant.io/fees-and-limits"} },
                { "referral", "https://bequant.io" },
            } },
        });
    }
}

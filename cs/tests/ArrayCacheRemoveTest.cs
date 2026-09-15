using ccxt.pro;
namespace Tests;
public partial class BaseTest {
static object RemovalRow(string symbol,string side,int quantity)=>new Dictionary<string,object>{{"symbol",symbol},{"side",side},{"contracts",quantity}};
static void RemovalCheck(bool ok){if(!ok)throw new Exception("symbol removal assertion");}
private void testRemoveSymbolPollingScopes(){foreach(bool global in new[]{false,true})foreach(bool scoped in new[]{false,true}){
var c=new ArrayCacheBySymbolBySide();var a=RemovalRow("ETH","long",4);var b=RemovalRow("ETH","short",5);c.append(a);c.append(RemovalRow("LTC","long",2));c.append(b);
if(global)RemovalCheck(Convert.ToInt32(c.getLimit(null,null))==3);if(scoped){RemovalCheck(Convert.ToInt32(c.getLimit("ETH",null))==2);RemovalCheck(Convert.ToInt32(c.getLimit("LTC",null))==1);}
((ArrayCacheBySymbolBySide)c).remove("MISSING");RemovalCheck(c.Count==3);((ArrayCacheBySymbolBySide)c).remove("LTC");RemovalCheck(c.Count==2&&ReferenceEquals(c[0],a)&&ReferenceEquals(c[1],b));RemovalCheck(Convert.ToInt32(c.getLimit("LTC",null))==0);((ArrayCacheBySymbolBySide)c).remove("LTC");c.append(RemovalRow("LTC","both",0));RemovalCheck(Convert.ToInt32(c.getLimit(null,null))==(global?1:3));c.append(RemovalRow("ETH","long",6));RemovalCheck(Convert.ToInt32(c.getLimit("ETH",null))==(scoped?1:2));RemovalCheck(c.Count==3);Console.WriteLine("PASS C# "+global+" "+scoped);
}}
}

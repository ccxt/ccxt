package io.github.ccxt.ws;
import org.junit.jupiter.api.Test;
import java.util.*;
import io.github.ccxt.ws.ArrayCache.ArrayCacheBySymbolBySide;
class ArrayCacheRemoveTest {
static Object row(String symbol,String side,int quantity){Map<String,Object>m=new HashMap<>();m.put("symbol",symbol);m.put("side",side);m.put("contracts",quantity);return m;}
static void check(boolean ok){if(!ok)throw new AssertionError("symbol removal");}
static int count(Object n){return ((Number)n).intValue();}
@Test
void removalPollingScopes(){for(boolean global:new boolean[]{false,true})for(boolean scoped:new boolean[]{false,true}){
var c=new ArrayCacheBySymbolBySide();var a=row("ETH","long",4);var b=row("ETH","short",5);c.append(a);c.append(row("LTC","long",2));c.append(b);if(global)check(count(c.getLimit(null,null))==3);if(scoped){check(count(c.getLimit("ETH",null))==2);check(count(c.getLimit("LTC",null))==1);}
io.github.ccxt.Helpers.callDynamically(c,"remove",new Object[]{"MISSING"});check(c.size()==3);io.github.ccxt.Helpers.callDynamically(c,"remove",new Object[]{"LTC"});check(c.size()==2&&c.get(0)==a&&c.get(1)==b);check(count(c.getLimit("LTC",null))==0);io.github.ccxt.Helpers.callDynamically(c,"remove",new Object[]{"LTC"});c.append(row("LTC","both",0));check(count(c.getLimit(null,null))==(global?1:3));c.append(row("ETH","long",6));check(count(c.getLimit("ETH",null))==(scoped?1:2));check(c.size()==3);System.out.println("PASS Java "+global+" "+scoped);
}}
}

use ccxt_base::{Value,get_value};
use ccxt_base::pro::cache::ArrayCacheBySymbolBySide;
use ccxt_base::runtime::is_equal;
fn s(v:&str)->Value{Value::Str(v.to_string())}
fn row(symbol:&str,side:&str,n:i64)->Value{Value::Map(vec![("symbol".to_string(),s(symbol)),("side".to_string(),s(side)),("contracts".to_string(),Value::Int(n))].into_iter().collect())}
fn check(v:Value,n:i64){assert!(is_equal(&v,&Value::Int(n)),"counter mismatch");}
#[test]
fn removal_polling_scopes(){for global in [false,true]{for scoped in [false,true]{
let mut c=ArrayCacheBySymbolBySide::new(Value::Null);c.append(row("ETH","long",4));c.append(row("LTC","long",2));c.append(row("ETH","short",5));if global{check(c.get_limit(Value::Null,Value::Null),3);}if scoped{check(c.get_limit(s("ETH"),Value::Null),2);check(c.get_limit(s("LTC"),Value::Null),1);}
c.remove_cache_symbol(s("MISSING"));c.remove_cache_symbol(s("LTC"));assert!(is_equal(&get_value(&c,&Value::Int(2)),&Value::Null));check(c.get_limit(s("LTC"),Value::Null),0);c.remove_cache_symbol(s("LTC"));c.append(row("LTC","both",0));check(c.get_limit(Value::Null,Value::Null),if global{1}else{3});c.append(row("ETH","long",6));check(c.get_limit(s("ETH"),Value::Null),if scoped{1}else{2});assert!(is_equal(&get_value(&c,&Value::Int(3)),&Value::Null));println!("PASS Rust {} {}",global,scoped);
}}}

#[test]
#[should_panic(expected = "requires ArrayCacheBySymbolBySide")]
fn removal_rejects_wrong_receiver() {
    Value::Null.remove_cache_symbol(s("ETH"));
}

#[test]
#[should_panic(expected = "requires a string symbol")]
fn removal_rejects_wrong_symbol_type() {
    ArrayCacheBySymbolBySide::new(Value::Null).remove_cache_symbol(Value::Int(1));
}

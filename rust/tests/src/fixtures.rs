// Static request/response fixture loader.
//
// Format: ts/src/test/static/{request,response}/<exchange>.json
//   {
//     "exchange": "<name>",
//     "skipKeys": ["timestamp", "signature", ...],
//     "outputType": "urlencoded" | "json" | "both" | ...,
//     "options":  { ... arbitrary describe() overrides ... },
//     "methods":  { "<methodName>": [ { "description", "method", "url", "input", "output" }, ... ] }
//   }

use indexmap::IndexMap as HashMap;
use std::path::Path;
use serde_json::Value;

#[derive(Debug, Clone)]
pub struct Fixture {
    pub exchange:    String,
    pub skip_keys:   Vec<String>,
    pub output_type: Option<String>,
    pub options:     Value,
    pub methods:     HashMap<String, Vec<Value>>,
}

pub fn load(path: &Path) -> Result<Fixture, String> {
    let raw = std::fs::read_to_string(path).map_err(|e| format!("read: {e}"))?;
    let v: Value = serde_json::from_str(&raw).map_err(|e| format!("parse: {e}"))?;

    let exchange = v.get("exchange")
        .and_then(Value::as_str)
        .ok_or_else(|| "missing `exchange` field".to_string())?
        .to_owned();

    let skip_keys = v.get("skipKeys")
        .and_then(Value::as_array)
        .map(|a| a.iter().filter_map(|x| x.as_str().map(str::to_owned)).collect())
        .unwrap_or_default();

    let output_type = v.get("outputType").and_then(Value::as_str).map(str::to_owned);

    let options = v.get("options").cloned().unwrap_or(Value::Null);

    let methods = match v.get("methods") {
        Some(Value::Object(m)) => {
            let mut out = HashMap::new();
            for (k, val) in m {
                let cases = val.as_array()
                    .ok_or_else(|| format!("methods.{k} is not an array"))?
                    .clone();
                out.insert(k.clone(), cases);
            }
            out
        }
        Some(_) => return Err("`methods` is not an object".to_string()),
        None    => HashMap::new(),
    };

    Ok(Fixture { exchange, skip_keys, output_type, options, methods })
}

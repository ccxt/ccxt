import re,glob,sys
names=['fetchOrderBook','fetchTicker','fetchTrades','fetchOHLCV','watchOrderBook','watchTicker','watchTrades']
for f in sorted(glob.glob('ts/src/prediction/**/*.ts',recursive=True))+['ts/src/base/PredictionExchange.ts']:
    s=open(f).read()
    for m in re.finditer(r'\n    (?:override )?async (\w+) \((\w+): (\w+)[^\n]*\{\n',s):
        n,p,t=m.groups()
        if n not in names: continue
        # body till next "\n    }\n"
        e=s.find('\n    }\n',m.end()); body=s[m.end():e]
        hits=[l.strip() for l in body.split('\n') if re.search(r'\b%s\b\s*[!=]==?\s*undefined|undefined\s*[!=]==?\s*%s\b|\b%s\s*=[^=]'%(p,p,p),l)]
        print(f.split('/')[-2]+'/'+f.split('/')[-1],n,p,t,hits[:3])

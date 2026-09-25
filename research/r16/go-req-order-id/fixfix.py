# quote integer ids at newly string-typed (method, index) inputs in static fixtures, minimal text edits
import json,glob,re,sys
M={'cancelOrder':[0],'fetchOrder':[0],'editOrder':[0],'fetchOrderTrades':[0],'withdraw':[0],'transfer':[0,3],'setMarginMode':[0]}
dec=json.JSONDecoder()
def inputs(o,acc):
    if isinstance(o,dict):
        for k,v in o.items():
            if k=='input': acc.append(o)
            inputs(v,acc)
    elif isinstance(o,list):
        for v in o: inputs(v,acc)
    return acc
tot=0
for f in sorted(glob.glob('ts/src/test/static/*/*.json')):
    txt=open(f).read(); d=json.loads(txt)
    if not isinstance(d,dict): continue
    targets=set()
    for m,tl in (d.get('methods') or {}).items():
        if m in M:
            for t in tl:
                inp=t.get('input') or []
                for i in M[m]:
                    if i<len(inp) and isinstance(inp[i],int) and not isinstance(inp[i],bool): targets.add((id(t),i))
    if not targets: continue
    objs=inputs(d,[]); pos=[m.end() for m in re.finditer(r'"input"\s*:\s*',txt)]
    assert len(objs)==len(pos),f
    edits=[]
    for o,p in zip(objs,pos):
        for (tid,i) in targets:
            if tid!=id(o): continue
            q=p; assert txt[q]=='['; q+=1
            for k in range(i+1):
                while txt[q] in ' \n\r\t,': q+=1
                v,e=dec.raw_decode(txt,q)
                if k==i: assert v==o['input'][i]; edits.append((q,e))
                q=e
    for q,e in sorted(edits,reverse=True): txt=txt[:q]+'"'+txt[q:e]+'"'+txt[e:]
    open(f,'w').write(txt); tot+=len(edits); print(f,len(edits))
print('total',tot)

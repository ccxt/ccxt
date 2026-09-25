import subprocess,re,collections,sys
ref=sys.argv[1]
files=subprocess.run(['git','grep','-l','getValue(this.',ref,'--','cs/ccxt/exchanges'],capture_output=True,text=True).stdout.split()
c=collections.Counter()
for f in files:
    path=f.split(':',1)[1]
    lines=subprocess.run(['git','show',f],capture_output=True,text=True).stdout.split('\n')
    for i,l in enumerate(lines):
        for m in re.finditer(r'(?<![.\w])getValue\(this\.(balance|ohlcvs|trades|tickers|bidsasks|fundingRates|transactions|positions), ([^()]*?)\)',l):
            k=m.group(2)
            if k.startswith('"'): c[(m.group(1),'lit')]+=1; continue
            t='?'
            for j in range(i,-1,-1):
                d=re.match(r'\s*([\w<>?,. ]+?) '+re.escape(k)+r'\b\s*(=|;)',lines[j])
                if d and d.group(1).split() and d.group(1).split()[-1] not in('return','else'): t=d.group(1); break
                s=re.match(r'\s+(public|private|protected)\b.*\(',lines[j])
                if s:
                    p=re.search(r'([\w<>?]+) '+re.escape(k)+r'\b',lines[j]); t='param:'+(p.group(1) if p else '?'); break
            c[(m.group(1),t)]+=1
for k,v in sorted(c.items(),key=lambda x:-x[1]): print(v,*k)

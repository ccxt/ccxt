#!/bin/bash
# certify go gate: cert.sh <job>
set -u
J=$1
R=/root/.hermes/profiles/deepseek/campaigns/typed90-recon/research
CF=$R/census-families
WT=/root/worktrees/typed90-sub/go-req-symbol
L=http://89.38.99.90:8640/jobs
cd $WT || exit 2
echo "== note"; curl -s $L/$J/note.json; echo
echo "== nonzero steps"; curl -s $L/$J/steps.tsv | awk -F'\t' '$3!="0"{print $2,$3}'
for s in request wsstatic; do printf "GO.%s: %s\n" $s "$(curl -s $L/$J/testGO.$s.log | grep -oE '[0-9]+ static (request|ws) tests passed' | tail -1)"; done
REF=$(curl -s $L/$J/note.json | python3 -c 'import json,sys;print(json.load(sys.stdin).get("result_ref",""))')
[ -n "$REF" ] || { echo "no result_ref"; exit 3; }
git fetch -q farm $REF:refs/tmp/j$J || exit 4
git merge-base --is-ancestor ba2d3740f1b refs/tmp/j$J && echo "PR head is ancestor"
echo "== counts"; $WT/research/r16/go-req-symbol/count.sh refs/tmp/j$J | tee $WT/research/r16/go-req-symbol/count-j$J.txt
cd $CF || exit 5
[ -f out-${J}go/rows.jsonl ] || timeout 530 python3 census.py --sha refs/tmp/j$J --out out-${J}go --langs go > /dev/null 2>&1 || echo "census failed"
python3 -c "import json;d=json.load(open('out-${J}go/results.json'));print({k:v for k,v in d.items() if not isinstance(v,(list,dict))})" | head -c 400; echo
python3 $R/r16/land6-lost/alllost.py out-1683 out-${J}go go | grep TOTAL
python3 /root/worktrees/typed90-sub/pin-ts7/research/r16/pin-ts7/realdiff.py out-2021go out-${J}go go | head -20

# GO-ISEQUAL-NIL-ANY progress
- worktree /root/worktrees/typed90-sub/go-isequal-nil-any, branch typed90-sub-go-isequal-nil-any, base 6cbceb9803e (ff).
- build/goTranspiler.ts: new section goAnyLocalNativeNilCompares (+ goAnyLocalNilSelfTest in --self-test), run after
  goTypedNativeNilCompares in exchange files and on base/prediction base files. Fail closed per local.
- self-test PASSED; offline replay -297 IsEqual, diffcheck 0 anomalies. See SIZE.md.

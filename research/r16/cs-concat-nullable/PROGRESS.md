# CS-CONCAT-NULLABLE-LEFT progress
Branch typed90-sub-cs-concat-nullable, worktree /root/worktrees/typed90-sub/cs-concat-nullable, base 49447fc25f5.
- scan.py <rev>: C# `object x = this.safeString*(...)` locals, never reassigned, read at least once as add() LEFT operand.
  Baseline 49447fc25f5: 96 sites (41 rest+prediction = sites-rest.tsv, 55 pro = sites-pro.tsv); `add(` in cs/ccxt/exchanges 1228.
- Split: lead = sites-rest.tsv (rest + prediction ts/src files); helper = sites-pro.tsv (ts/src/pro/*.ts only).
- Classes: a = market symbol (skip market), b = required request/URL/hash (structural or existing error), c = optional piece.

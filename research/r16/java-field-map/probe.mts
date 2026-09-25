// single-file printer replay (no post-pass): npx tsx probe.ts <worktree> <ts file> <out>
import * as fs from 'fs';
const wt = process.argv[2];
const { Transpiler } = await import(process.env.AST ?? '/root/worktrees/typed90-sub/pin-ts7/node_modules/ast-transpiler/dist/transpiler.js');
const jt: any = await import(wt + '/build/javaTranspiler.ts');
const lt: any = await import(wt + '/build/java-local-types.js');
const t: any = new Transpiler({ verbose: false, java: { asyncSupplier: 'supplyAsync' } });
t.setVerboseMode(false);
t.javaTranspiler.javaStrictEffectivelyFinal = true;
jt.patchJavaLocalTypes(t);
for (const n of ['installJavaLocalTypes','patchJavaLiteralLocalTypes','installJavaNumericLocalTypes','patchJavaConsumerStringCasts','patchJavaMapChannelStringCasts','patchJavaStringReceiverCasts','installJavaDeclaredLocalTypes','installJavaObjectParamPositions']) lt[n](t);
jt.installJavaExpressionTypeResolver(t);
for (const n of ['installJavaStringListParamTypes','installJavaNullScalarLocalTypes','patchJavaOmitLocalTypes','patchJavaQualifiedDtoListElementLocals','patchJavaStringAccumulatorLists','patchJavaTupleHolderElementLocals','patchJavaOrderBookCacheLocals']) lt[n](t);
for (const extra of (process.env.EXTRA ?? '').split(',').filter(Boolean)) lt[extra](t);
fs.writeFileSync(process.argv[4], t.transpileJavaByPath(process.argv[3]).content);


const longHash = 'a'.repeat (200);
const dict = {};
for (let i = 0; i < 10000; i++) {
    dict[i.toString ()] = i;
}
// const x = new Future ();
const start = performance.now ();
for (let i = 0; i < 500; i++) {
    longHash.indexOf (i.toString ());
}
// x.resolve ('test');
const end = performance.now ();
console.log (end - start);

// performance.mark ('example-end');
// performance.measure ('example', 'example-start', 'example-end');
// // console.log (Date.now () - now);

// performance.mark ('example-start');
// performance.mark ('example-end');
// performance.measure ('example', 'example-start', 'example-end');

// function Future () {
//     let resolve = undefined;
//     let reject = undefined;
//     const p = new Promise ((resolve_, reject_) => {
//         resolve = resolve_;
//         reject = reject_;
//     });
//     p.resolve = function _resolve () {
//         // eslint-disable-next-line prefer-rest-params
//         resolve.apply (this, arguments);
//     };
//     p.reject = function _reject () {
//         // eslint-disable-next-line prefer-rest-params
//         reject.apply (this, arguments);
//     };
//     return p;
// }

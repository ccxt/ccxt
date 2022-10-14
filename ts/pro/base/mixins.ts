// import Exchange from './Exchange.js';
// import aaxRest from '../../aax.js';
// import aaxWs from '../aax.js';


// class aaxCombined extends aaxWs {}


// interface aaxCombined extends Exchange {}



// applyMixins(aaxCombined, [aaxRest]);
 
 
// // This can live anywhere in your codebase:
// function applyMixins(derivedCtor: any, constructors: any[]) {
//   constructors.forEach((baseCtor) => {
//     Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
//       Object.defineProperty(
//         derivedCtor.prototype,
//         name,
//         Object.getOwnPropertyDescriptor(baseCtor.prototype, name) ||
//           Object.create(null)
//       );
//     });
// })
// }


// export {
//   aaxCombined
// };


// class BaseSystem {
//   public foo() {
//     console.log("Base.foo");
//   }
// }
declare module '../../ts/ccxt' {
    const whatever: any;
    export = whatever;
  }

declare module 'ccxt' {
  const whatever: any;
  export = whatever;
}

declare namespace ccxt {
    const exchange: any;
    export = ccxt;
  }

import { JuliaTranspiler } from './juliaTranspiler';

export const transpileJulia = () => {
  console.log('Starting Julia transpile');
  const transpiler = new JuliaTranspiler();
  console.log('Julia transpile finished');
};

transpileJulia();

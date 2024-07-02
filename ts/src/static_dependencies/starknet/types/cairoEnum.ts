import { CairoCustomEnum, CairoOption, CairoResult } from '../utils/calldata/enum/index.js';

export type CairoEnum = CairoCustomEnum | CairoOption<any> | CairoResult<any, any>;

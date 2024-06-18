import { CairoCustomEnum, CairoOption, CairoResult } from '../utils/calldata/enum.js';

export type CairoEnum = CairoCustomEnum | CairoOption<any> | CairoResult<any, any>;

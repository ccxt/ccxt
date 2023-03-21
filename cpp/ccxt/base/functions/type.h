#pragma one

#include <string>

/*  .............................................   */
double asDouble(const std::wstring& x);
int asInteger(const std::wstring& x);
/*  .............................................   */

double safeDouble(const std::wstring& k, double defaultValue = 0);

// const safeInteger = (o: object, k: string | number, $default?: number): number => {
//     const n = asInteger (prop (o, k));
//     return isNumber (n) ? n : $default;
// };

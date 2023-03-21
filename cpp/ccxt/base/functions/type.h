#pragma one

#include <string>

/*  .............................................   */
float asFloat(const std::wstring& x);
int asInteger(const std::wstring& x);
/*  .............................................   */

float safeFloat(const std::wstring& k, float defaultValue = 0 );

// const safeInteger = (o: object, k: string | number, $default?: number): number => {
//     const n = asInteger (prop (o, k));
//     return isNumber (n) ? n : $default;
// };

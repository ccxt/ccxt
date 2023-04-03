#pragma one

#include <string>
#include <limits>

namespace ccxt {

/*  .............................................   */
double asDouble(const std::string& x);
int asInteger(const std::string& x);
/*  .............................................   */

double safeDouble(const std::string& k, double defaultValue = std::numeric_limits<double>::quiet_NaN());
double safeDouble(double k, double defaultValue = std::numeric_limits<double>::quiet_NaN());
int safeInteger(const std::string& k, int defaultValue = std::numeric_limits<int>::min());
int safeInteger(int k, int defaultValue = std::numeric_limits<int>::min());
std::string safeString(const std::string& k, const std::string& defaultValue = "");
std::string safeString(int k, const std::string& defaultValue = "");

double safeValue2(double k1, double k2, double defaultValue = std::numeric_limits<double>::quiet_NaN());
std::string safeString2(const std::string& k1, const std::string& k2, const std::string& defaultValue = "");
std::string safeString2(int k1, const std::string& k2, const std::string& defaultValue = "");
std::string safeString2(const std::string& k1, int k2, const std::string& defaultValue = "");
std::string safeString2(int k1, int k2, const std::string& defaultValue = "");

double safeIntegerProduct(const std::string& k, double factor, double defaultValue = 0.0);

}
#pragma one

#include <map>
#include <string>

namespace ccxt {

std::multimap<std::wstring, double> sortBy(const std::multimap<std::wstring, double>& array, 
            bool descending = false, int direction = false);
            
}
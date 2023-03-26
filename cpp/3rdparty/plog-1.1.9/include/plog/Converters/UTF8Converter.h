#pragma once
#include <plog/Util.h>

namespace plog
{
    class UTF8Converter
    {
    public:
        static std::string header(const util::nstring& str)
        {
            const char kBOM[] = "\xEF\xBB\xBF";

            return std::string(kBOM) + convert(str);
        }

#ifdef _WIN32
        static std::string convert(const util::nstring& str)
        {
            return util::toNarrow(str, codePage::kUTF8);
        }
#else
        static const std::string& convert(const util::nstring& str)
        {
            return str;
        }
#endif
    };
}

#pragma once
#include <plog/Converters/UTF8Converter.h>
#include <plog/Util.h>

namespace plog
{
    template<class NextConverter = UTF8Converter>
    class NativeEOLConverter : public NextConverter
    {
#ifdef _WIN32
    public:
        static std::string header(const util::nstring& str)
        {
            return NextConverter::header(fixLineEndings(str));
        }

        static std::string convert(const util::nstring& str)
        {
            return NextConverter::convert(fixLineEndings(str));
        }

    private:
        static std::wstring fixLineEndings(const std::wstring& str)
        {
            std::wstring output;
            output.reserve(str.length() * 2);

            for (size_t i = 0; i < str.size(); ++i)
            {
                wchar_t ch = str[i];

                if (ch == L'\n')
                {
                    output.push_back(L'\r');
                }

                output.push_back(ch);
            }

            return output;
        }
#endif
    };
}

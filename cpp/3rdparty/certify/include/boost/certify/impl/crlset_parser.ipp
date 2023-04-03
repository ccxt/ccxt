#ifndef BOOST_CERTIFY_IMPL_CRLSET_PARSER_IPP
#define BOOST_CERTIFY_IMPL_CRLSET_PARSER_IPP

#include <boost/certify/crlset_parser.hpp>

namespace boost
{

namespace certify
{

inline char const*
crlset_parser_category::name() const noexcept
{
    return "crlset.parser";
}

inline std::string
crlset_parser_category::message(int ev) const
{
    switch (static_cast<crlset_error>(ev))
    {
        case crlset_error::header_length_truncated:
            return "CRLSet header length truncated";
        case crlset_error::header_truncated:
            return "CRLSet header truncated";
        case crlset_error::serial_truncated:
            return "CRLSet serial truncated";
        default:
            return "unknown";
    }
}

inline system::error_code
make_error_code(crlset_error ev)
{
    return {static_cast<int>(ev),
            detail::inline_global<crlset_parser_category const>::value};
}

inline std::vector<crlset>
parse_crlset(asio::const_buffer b, system::error_code& ec)
{
    std::vector<crlset> sets;

    endian::little_uint16_t header_len;
    if (b.size() < sizeof(header_len))
    {
        ec = crlset_error::header_length_truncated;
        return sets;
    }
    std::memcpy(&header_len, b.data(), sizeof(header_len));
    b += sizeof(header_len);

    if (b.size() < header_len)
    {
        ec = crlset_error::header_truncated;
        return sets;
    }
    b += header_len;
    // TODO: Parse the header

    endian::little_uint32_t serial_count;

    while (b.size() > sizeof(crlset::parent_spki_hash) + sizeof(serial_count))
    {
        sets.emplace_back();
        auto& set = sets.back();
        std::memcpy(set.parent_spki_hash.data(),
                    b.data(),
                    sizeof(crlset::parent_spki_hash));
        b += sizeof(crlset::parent_spki_hash);

        std::memcpy(&serial_count, b.data(), sizeof(serial_count));
        b += sizeof(serial_count);

        for (std::uint32_t n = serial_count; n > 0 && b.size() > 0; --n)
        {
            std::uint8_t serial_size;
            std::memcpy(&serial_size, b.data(), sizeof(serial_size));
            b += sizeof(serial_size);
            if (b.size() < serial_size)
            {
                ec = crlset_error::serial_truncated;
                return sets;
            }
            auto* first = static_cast<char const*>(b.data());
            auto* last = first + serial_size;
            set.serials.emplace_back(first, last);
            b += serial_size;
        }
    }

    return sets;
}

inline std::vector<crlset>
parse_crlset(boost::asio::const_buffer b)
{
    system::error_code ec;
    auto ret = certify::parse_crlset(b, ec);
    if (ec)
        boost::throw_exception(system::system_error{ec});
    return ret;
}

} // namespace certify

} // namespace boost

#endif // BOOST_CERTIFY_IMPL_CRLSET_PARSER_IPP

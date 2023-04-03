#ifndef BOOST_CERTIFY_CRLSET_PARSER_HPP
#define BOOST_CERTIFY_CRLSET_PARSER_HPP

#include <boost/asio/buffer.hpp>
#include <boost/endian/arithmetic.hpp>
#include <boost/system/system_error.hpp>

namespace boost
{

namespace certify
{

namespace detail
{

template<class T>
struct inline_global
{
    static T value;
};

template<class T>
T inline_global<T>::value{};

} // namespace detail

enum class crlset_error
{
    header_length_truncated,
    header_truncated,
    serial_truncated
};

class crlset_parser_category : public system::error_category
{
public:
    char const* name() const noexcept override;

    std::string message(int ev) const override;
};

system::error_code
make_error_code(crlset_error ev);

struct crlset
{
    std::array<std::uint8_t, 32> parent_spki_hash;
    std::vector<std::string> serials;
};

std::vector<crlset>
parse_crlset(asio::const_buffer b, system::error_code& ec);

std::vector<crlset>
parse_crlset(boost::asio::const_buffer b);

} // namespace certify

namespace system
{
template<>
struct is_error_code_enum<::boost::certify::crlset_error>
{
    static bool const value = true;
};
} // namespace system

} // namespace boost

#include <boost/certify/impl/crlset_parser.ipp>

#endif // BOOST_CERTIFY_CRLSET_PARSER_HPP

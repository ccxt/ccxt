#pragma once

#include <boost/beast.hpp>
#include <boost/beast/ssl.hpp>
#include <optional>
#include <future>
#include <chrono>

class httpsClass {
    boost::asio::ssl::context& ctx_;
    std::string                host_;
    std::optional<boost::beast::ssl_stream<boost::beast::tcp_stream>> ssl_stream_;
    boost::beast::flat_buffer  buffer_;

    static constexpr auto kTimeout = []{ using namespace std::chrono_literals; return 3s; }();

  public:
    httpsClass(boost::asio::any_io_executor ex, boost::asio::ssl::context& ctx, std::string host)
        : ctx_(ctx)
        , host_(host)
        , ssl_stream_(std::in_place, ex, ctx_) {

        auto ep = boost::asio::ip::tcp::resolver(ex).resolve(host, "https");
        ssl_stream_->next_layer().connect(ep);
        ssl_stream_->handshake(boost::asio::ssl::stream_base::handshake_type::client);
    }

    using Request  = boost::beast::http::request<boost::beast::http::string_body>;
    using Response = boost::beast::http::response<boost::beast::http::dynamic_body>;

    std::future<Response> performRequest(Request const&);
};
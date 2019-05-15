module Exchanges
  module ExampleGroupHelper
    EXCHANGES = {
      kraken: { apiKey: ENV['KRAKEN_API_KEY'], secret: ENV['KRAKEN_API_SECRET'] },
    }

    def exchanges
      EXCHANGES.map do |exchange_name, exchange_config|
        Ccxt.send exchange_name, exchange_config
      end
    end
  end
end

RSpec.configure do |config|
  config.extend Exchanges::ExampleGroupHelper
end

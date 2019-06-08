module Ccxt::ExchangeHelpers
  def self.included(base)
    base.send :include, ClassMethods
    base.extend ClassMethods
  end

  ### THESE ARE REQUIRED TO TRANSPILE THE JAVASCRIPT FILES

  ### CRYPTO FUNCTIONS

  module ClassMethods
    def hash(request, algorithm = 'md5', digest = 'hex')
      h = OpenSSL::Digest.new(algorithm, request)
      case digest
      when 'hex'
        h.hexdigest
      when 'base64'
        h.base64digest
      else
        h.digest
      end
    end

    def hmac(request, secret, algorithm = 'md5', digest = 'hex')
      ssl_digest = OpenSSL::Digest.new(algorithm)
      h = OpenSSL::HMAC.new(secret, ssl_digest)
      h.update request
      case digest
      when 'hex'
        h.hexdigest
      when 'base64'
        Base64.strict_encode64(h.digest)
      else
        h.digest
      end
    end

    def jwt(request, secret, algorithm = nil)
      header = encode(json({
        'alg' => alg,
        'typ' => 'JWT'
        }))
      encodedHeader = base64urlencode(header)
      encodedData = base64urlencode(encode(json(request)))
      token = encodedHeader + '.' + encodedData
      hmac = hmac(encode(token), encode(secret), algorithm, 'binary')
      signature = base64urlencode(hmac)
      return token + '.' + signature
    end

    # def totp(key):
    #     def dec_to_bytes(n):
    #         if n > 0:
    #             return dec_to_bytes(n // 256) + bytes([n % 256])
    #         else:
    #             return b''
    #
    #     def hex_to_dec(n):
    #         return int(n, base = 16)
    #
    #     def base32_to_bytes(n):
    #         missing_padding = len(n) % 8
    #         padding = 8 - missing_padding if missing_padding > 0 else 0
    #         padded = n.upper() + ('=' * padding)
    #         return base64.b32decode(padded)  # throws an error if the key is invalid
    #
    #     epoch = int(time.time()) // 30
    #     hmac_res = hmac(dec_to_bytes(epoch).rjust(8, b'\x00'), base32_to_bytes(key.replace(' ', '')), hashlib.sha1, 'hex')
    #     offset = hex_to_dec(hmac_res[-1]) * 2
    #     otp = str(hex_to_dec(hmac_res[offset: offset + 8]) & 0x7fffffff)
    #     return otp[-6:]

    def totp(key)
      raise NotSupported, 'TOTP: Not implemented yet.'
    end

    ### ENCODE

    # deprecated? set in JS -> Ruby transpiler
    def json(data, params = nil)
      return JSON.dump(data)
    end

    # deprecated? set in JS -> Ruby transpiler
    def unjson(input)
      return JSON.load(input)
    end

    def is_json_encoded_object(input)
      return (input.is_a?(String) &&
             (input.length >= 2) &&
             ((input[0] == '{') || (input[0] == '[')))
    end

    def binary_concat(*args)
      return args.reduce { |a, b| a + b }
    end

    def binary_to_string(string)
      return string.encode('ascii')
    end

    #
    # Encode a query for a URL, but not encoding special characters.
    #
    # @staticmethod
    # def rawencode(params = {}):
    #     return _urlencode.unquote(urlencode(params))

    def rawencode(params = {})
      return Addressable::URI.form_encode(params)
    end

    def base64urlencode(s)
      return decode(Base64.urlsafe_encode64(s, padding: false))
    end

    ### GENERIC

    def aggregate(bidasks)
      ordered = {}
      bidasks.each do |price, volume|
        if volume > 0
          value = ordered.has_key?(price) ? ordered[price] : 0
          ordered[price] = value + volume
        end
      end
      ordered.sort
    end

    def array_concat(a, b)
      return a + b
    end

    def shallow_extend(*args)
      result = args.inject({}) { |hash1, hash2| hash1.merge(hash2) }
      return result
    end

    def deep_extend(*args)
      result = nil
      args.each do |arg|
        if arg.is_a?(Hash)
          result = {} if !result.is_a?(Hash)
          arg.keys.each do |k|
            target = result.has_key?(k) ? result[k] : nil
            result[k] = deep_extend(target, arg[k])
          end
        else
          result = arg
        end
      end
      return result
    end

    def encode(string)
      return string.encode
    end

    def decode(string)
      return string.unpack('M*')
    end

    def encode_uri_component(uri)
      return URI.encode_www_form_component(uri)
    end

    def extract_params(string)
      string.scan(/{([\w-]+)}/).flatten
    end

    def implode_params(string, params)
      params.keys.each do |key|
        string = string.gsub("{#{key}}", params[key].to_s)
      end
      return string
    end

    def filterBy(array, key, value = nil)
      return filter_by(array, key, value)
    end

    def filter_by(array, key, value = nil)
      if value
        grouped = group_by(array, key)
        return grouped[value] if grouped.has_key? value

        return []
      else
        return array
      end
    end

    def groupBy(array, key)
      return group_by(array, key)
    end

    def group_by(array, key)
      result = {}
      array = to_array(array)
      array = array.collect { |entry| entry[key] ? entry : nil }.compact
      array.each do |entry|
        result[entry[key]] ||= []
        result[entry[key]] << entry
      end
      return result
    end

    def in_array(needle, haystack)
      return haystack.include?(needle)
    end

    def index_by(array, key)
      result = {}
      array = keysort(array).values if array.is_a?(Hash)
      array.each do |element|
        if element.has_key?(key) && (element[key] != nil)
          k = element[key]
          result[k] = element
        end
      end
      result
    end

    def is_empty(object)
      return object.empty?
    end

    def keysort(hash)
      return hash.sort_by { |k, v| k }.to_h
    end

    def omit(d, *args)
      result = d.dup
      args.each do |arg|
        if arg.is_a?(Array)
          arg.each do |key|
            result.delete(key) if result.has_key? key
          end
        else
          result.delete(arg) if result.has_key? arg
        end
      end
      return result
    end

    def ordered(array)
      return Hash(array)
    end

    def pluck(array, key)
      return array.delete_if { |a| !a.has_key?(key) }.map { |a| a[key] }
    end

    def safe_either(method, hash, key1, key2, default_value = nil)
      value = method.call(hash, key1)
      if value
        return value
      else
        return method.call(hash, key2, default_value)
      end
    end

    def safe_float(hash, key, default_value = nil)
      return default_value if key.nil?
      return default_value unless hash.is_a?(Hash)
      return default_value unless hash.has_key?(key)

      value = hash[key]
      return default_value unless value.respond_to?(:to_f)
      return value.to_f
    end

    def safe_float_2(hash, key1, key2, default_value = nil)
      return safe_either(method(:safe_float), hash, key1, key2, default_value)
    end

    def safe_integer(hash, key, default_value = nil)
      return default_value if key.nil?
      return default_value unless hash.is_a?(Hash)
      return default_value unless hash.has_key?(key)

      value = hash[key]
      return default_value unless value.respond_to?(:to_i)
      return value.to_i
    end

    def safe_integer_2(hash, key1, key2, default_value = nil)
      return safe_either(method(:safe_integer), hash, key1, key2, default_value)
    end

    def safe_string(hash, key, default_value = nil)
      if hash.is_a?(Hash) && hash.has_key?(key)
        value = hash[key].to_s
      else
        value = default_value
      end
      return value
    end

    def safe_string_2(hash, key1, key2, default_value = nil)
      return safe_either(method(:safe_string), hash, key1, key2, default_value)
    end

    def safe_value(hash, key, default_value = nil)
      if hash.is_a?(Hash) && hash.has_key?(key)
        value = hash[key]
      else
        value = default_value
      end
      return value
    end

    def safe_value_2(hash, key1, key2, default_value = nil)
      return safe_either(method(:safe_string), hash, key1, key2, default_value)
    end

    def sort_by(array, key, descending = false)
      # return sorted(array, key = lambda k: k[key] if k[key] is not nil else "", reverse = descending)
      result = array.sort_by { |k| k[key] ? k[key] : '' }
      descending ? result.reverse : result
    end

    def sum(*args)
      array = args.delete_if { |c| !((c.is_a?(Integer) || c.is_a?(Float))) }.compact
      return nil if array.empty?

      return array.sum
    end

    def to_array(value)
      return value.values if value.is_a?(Hash)

      return value
    end

    # Deprecated, use decimal_to_precision instead
    def truncate(num, precision = 0)
      return num.truncate(precision)
    end

    # Deprecated, todo: remove references from subclasses
    def truncate_to_string(num, precision = 0)
      return num.truncate(precision).to_s
    end

    def unique(array)
      return array.uniq
    end

    def url(path, params = {})
      result = implode_params(path, params)
      query = omit(params, extract_params(path))
      if query
        result += '?' + RestClient::Utils.encode_query_string(query)
      end
      return result
    end

    #
    # Encode a query for a URL, encoding special characters as necessary.
    #
    def urlencode(params = {})
      if params.is_a?(Hash)
        return RestClient::Utils.encode_query_string(params)
      else
        return params
      end
    end

    ### TIME

    def sec
      seconds
    end

    def seconds
      return Time.now.to_i
    end

    def usec
      microseconds
    end

    def uuid
      return SecureRandom::uuid
    end

    def microseconds
      return (Time.now.to_f * 1000000.0).to_i
    end

    def milliseconds
      return (Time.now.to_f * 1000.0).to_i
    end

    def msec
      return milliseconds
    end

    def iso8601(timestamp = nil)
      return nil unless timestamp.is_a?(Integer)
      return nil if timestamp.to_i < 0

      return Time.at(timestamp / 1000.0).round(3).utc.iso8601(3)
    end

    def dmy(timestamp, infix = '-')
      utc_datetime = Time.at((timestamp/1000).to_i).utc
      return utc_datetime.strftime('%m' + infix + '%d' + infix + '%Y')
    end

    def parse8601(timestamp)
      return DateTime.iso8601(timestamp).strftime('%Q').to_i rescue nil
    end

    def parse_date(timestamp = nil)
      return nil unless timestamp.is_a?(String)

      return DateTime.parse(timestamp).strftime('%Q').to_i rescue nil
    end

    def ymd(timestamp, infix = '-')
      utc_datetime = Time.at((timestamp/1000).to_i).utc
      return utc_datetime.strftime('%Y' + infix + '%m' + infix + '%d')
    end

    def ymdhms(timestamp, infix = ' ')
      utc_datetime = Time.at((timestamp/1000).to_i).utc
      return utc_datetime.strftime('%Y-%m-%d' + infix + '%H:%M:%S')
    end

    # Ruby default capitalize will capitalize the first letter and lower the others.
    def capitalize(string)
      if string.length > 1
        return (string[0].upcase + string[1..-1])
      else
        return string.upcase
      end
    end

    def parse_timeframe(timeframe)
      amount = timeframe[0..-1].to_i
      unit = timeframe[-1]
      case unit
      when 'y'
        scale = 60 * 60 * 24 * 365
      when 'M'
        scale = 60 * 60 * 24 * 30
      when 'w'
        scale = 60 * 60 * 24 * 7
      when 'd'
        scale = 60 * 60 * 24
      when 'h'
        scale = 60 * 60
      else
        scale = 60 # 1m by default
      end
      return amount * scale
    end

    def parse_float(value)
      return value.to_f
    end

    def parse_int(value)
      return value.to_i
    end

    def minimum_wrapper(*values)
      return values.min
    end

    def maximum_wrapper(*values)
      return values.max
    end

  end # class << self
end

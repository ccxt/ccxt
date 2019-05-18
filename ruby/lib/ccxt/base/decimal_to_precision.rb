module Ccxt
  module DecimalToPrecision
    # rounding mode
    TRUNCATE = 0
    ROUND = 1

    # digits counting mode
    DECIMAL_PLACES = 2
    SIGNIFICANT_DIGITS = 3

    # padding mode
    NO_PADDING = 4
    PAD_WITH_ZERO = 5

    def self.included(base)
      base.extend ClassMethods
      base.class_eval do
      end
    end

    module ClassMethods
      def decimal_to_precision(n, rounding_mode = ROUND, precision = nil, counting_mode = DECIMAL_PLACES, padding_mode = NO_PADDING)
        unless precision.is_a?(Integer)
          raise ArgumentError.new "precision #{precision.inspect} is invalid. Must be an Integer."
        end
        unless [TRUNCATE, ROUND].include?(rounding_mode)
          raise ArgumentError.new "rounding_mode #{rounding_mode.inspect} is invalid. Must be TRUNCATE(#{TRUNCATE}) or ROUND(#{ROUND}."
        end
        unless [DECIMAL_PLACES, SIGNIFICANT_DIGITS].include?(counting_mode)
          raise ArgumentError.new "counting_mode #{counting_mode.inspect} is invalid. Must be DECIMAL_PLACES(#{DECIMAL_PLACES}) or SIGNIFICANT_DIGITS(#{SIGNIFICANT_DIGITS}."
        end
        unless [NO_PADDING, PAD_WITH_ZERO].include?(padding_mode)
          raise ArgumentError.new "padding_mode #{counting_mode.inspect} is invalid. Must be NO_PADDING(#{NO_PADDING}) or PAD_WITH_ZERO(#{PAD_WITH_ZERO}."
        end

        # BigDecimal does not like the trailing dot
        number = BigDecimal(n.to_s.sub(/\.$/, ''))

        # negative precision
        if precision < 0
          if rounding_mode == ROUND
            return number.round(precision).to_i.to_s
          elsif rounding_mode == TRUNCATE
            return number.truncate(precision).to_i.to_s
          end
        end

        # positive precision
        if rounding_mode == ROUND
          if counting_mode == DECIMAL_PLACES
            value = number.round(precision, :half_up)
          elsif counting_mode == SIGNIFICANT_DIGITS
            if precision == 0
              value = BigDecimal('0')
            else
              value = number.round(-(Math.log10(number).ceil - precision))
            end
          end
        elsif rounding_mode == TRUNCATE
          if counting_mode == DECIMAL_PLACES
            value = number.truncate(precision)
          elsif counting_mode == SIGNIFICANT_DIGITS
            if precision == 0
              value = BigDecimal('0')
            else
              value = number.truncate(-(Math.log10(number).ceil - precision))
            end
          end
          # BigDecimal truncate will use -0.0
          value = BigDecimal('0') if value.zero?
        end

        # padding
        if padding_mode == NO_PADDING
          # The javascript and python versions don't like the trailing zero
          if value.frac == 0
            return "#{value.to_i}"
          else
            return value.to_s('F')
          end
        elsif padding_mode == PAD_WITH_ZERO
          if counting_mode == DECIMAL_PLACES
            frac = value.frac.abs.to_s('F').gsub('0.','')
            return "#{value.to_i}.#{frac.ljust(precision,'0')}"
          elsif counting_mode == SIGNIFICANT_DIGITS
            return "0" if precision == 0
            sign, digits, base, exponent = value.split

            if exponent >= digits.size && digits.size >= precision
              # this is a whole number.
              return "#{value.to_i}"
            else
              if value.frac.zero?
                frac = ''
              else
                frac = value.frac.to_s('F').gsub('0.','')
              end

              padding = precision - digits.size
              return "#{value.to_i}.#{frac}#{'0' * padding}"
            end
          end
        end
      end

      def number_to_string(x)
        # avoids scientific notation for too large and too small numbers
        # java and python version drop the trailing .0
        d = BigDecimal(x.to_s)
        return d.to_s('F').gsub(/\.0$/,'')
      end
    end
  end
end

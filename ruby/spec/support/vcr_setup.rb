VCR.configure do |vcr|
  vcr.cassette_library_dir = 'spec/vcr'
  vcr.hook_into :webmock
  vcr.configure_rspec_metadata!
  vcr.debug_logger = File.open('log/vcr.log', 'w')
  vcr.default_cassette_options = {
    decode_compressed_response: true,

    record: case ENV['VCR']

    # Record new interactions
    # Replay previously recorded interactions
    when 'new'  then :new_episodes

    # Replay previously recorded interactions
    # Raise error for new requests
    when 'none' then :none

    # Record new interactions
    # Never replay previously recorded interactions
    when 'all'  then :all

    # Replay previously recorded interactions
    # Record new interactions if there is no cassette file
    # Cause an error to be raised for new requests if there is a cassette file.
    when 'once' then :once

    # default
    else :once end,
  }
  %w[Api-Key Api-Sign].each do |header|
    vcr.filter_sensitive_data("<#{header}>") do |interaction|
      interaction.request.headers[header] &&
        interaction.request.headers[header].first
    end
  end
end

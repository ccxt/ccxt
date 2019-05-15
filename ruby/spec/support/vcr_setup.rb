VCR.configure do |vcr|
  vcr.cassette_library_dir = 'spec/vcr'
  vcr.hook_into :webmock
  vcr.configure_rspec_metadata!
  # vcr.default_cassette_options = {
  #   decode_compressed_response: true,
  #   serialize_with: :json,
  # }
end

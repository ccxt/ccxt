
lib = File.expand_path("../lib", __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require_relative "lib/ccxt/version"

Gem::Specification.new do |spec|
  spec.name          = "ccxt"
  spec.version       = Ccxt::VERSION
  spec.authors       = ["Dan Blue"]
  spec.email         = ["dan.blue@gmail.com"]

  spec.summary       = %q{ Ruby support for ccxt }
  spec.description   = %q{A JavaScript / Python / PHP / Ruby cryptocurrency trading API with support for more than 130 bitcoin/altcoin exchanges.}
  spec.homepage      = "http://github.com/ccxt/ccxt"

  # # Prevent pushing this gem to RubyGems.org. To allow pushes either set the 'allowed_push_host'
  # # to allow pushing to a single host or delete this section to allow pushing to any host.
  # if spec.respond_to?(:metadata)
  #   spec.metadata["allowed_push_host"] = "TODO: Set to 'http://mygemserver.com'"
  #
  #   spec.metadata["homepage_uri"] = spec.homepage
  #   spec.metadata["source_code_uri"] = "TODO: Put your gem's public repo URL here."
  #   spec.metadata["changelog_uri"] = "TODO: Put your gem's CHANGELOG.md URL here."
  # else
  #   raise "RubyGems 2.0 or newer is required to protect against " \
  #     "public gem pushes."
  # end

  # Specify which files should be added to the gem when it is released.
  # The `git ls-files -z` loads the files in the RubyGem that have been added into git.
  spec.files         = `git ls-files | grep -Ev '^(test|myapp|examples)'`.split("\n")
  spec.bindir        = "exe"
  spec.executables   = spec.files.grep(%r{^exe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]

  spec.add_development_dependency "bundler", "~> 2.0"
  spec.add_development_dependency "rake", "~> 10.0"
  spec.add_development_dependency "minitest", "~> 5.0"
  
  spec.add_runtime_dependency "rest-client", "~> 2.0"
  spec.add_runtime_dependency "addressable", "~> 2.6" 
end

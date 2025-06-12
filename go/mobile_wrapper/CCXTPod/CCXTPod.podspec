Pod::Spec.new do |s|
    s.name         = "CCXTPod"
    s.version      = "0.0.1"
    s.summary      = "CCXT Swift wrapper"
    s.description  = "Swift wrapper for CCXT C functions (via CCXTPodCore)"
    s.homepage     = "https://github.com/yourname/CCXTPod"
    s.license      = { :type => "MIT", :file => "../../../LICENSE.txt" }
    s.author       = { "yourname" => "your@email.com" }
    s.platform     = :ios, "12.0"
    s.osx.deployment_target = "10.15"
    s.source       = { :path => "." }
    s.source_files = "Sources/CCXTPod/**/*.swift"
    s.dependency   "CCXTPodCore"
    s.swift_version = '5.0'
    s.requires_arc = true
end

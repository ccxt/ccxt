Pod::Spec.new do |s|
    s.name         = "CCXTPodCore"
    s.version      = "0.0.1"
    s.summary      = "Core C wrapper for CCXT as XCFramework"
    s.description  = "XCFramework for CCXT Go library"
    s.homepage     = "https://github.com/yourname/CCXTPodCore"
    s.license      = { :type => "MIT", :file => "../../../LICENSE.txt" }
    s.author       = { "yourname" => "your@email.com" }
    s.platform     = :ios, "12.0"
    s.osx.deployment_target = "10.15"
    s.source       = { :path => "." }
    s.vendored_frameworks = "CCXT.xcframework"
    s.requires_arc = false
end

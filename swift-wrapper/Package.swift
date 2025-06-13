// swift-tools-version:5.7
import PackageDescription

let package = Package(
    name: "CCXTSwift",
    platforms: [
        .iOS(.v12),
        .macOS(.v10_15)
    ],
    products: [
        .library(
            name: "CCXTSwift",
            targets: ["CCXTSwift"]
        ),
    ],
    targets: [
        .binaryTarget(
            name: "CCXTSwiftCore",
            path: "Sources/CCXTSwiftCore/CCXT.xcframework"
        ),
        .target(
            name: "CCXTSwift",
            dependencies: ["CCXTSwiftCore"],
            path: "Sources/CCXTSwift"
        )
    ]
)

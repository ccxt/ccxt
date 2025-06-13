// swift-tools-version:5.7
import PackageDescription

let package = Package(
    name: "CCXTPod",
    platforms: [
        .iOS(.v12),
        .macOS(.v10_15)
    ],
    products: [
        .library(
            name: "CCXTPod",
            targets: ["CCXTPod"]
        ),
    ],
    targets: [
        .binaryTarget(
            name: "CCXTPodCore",
            path: "Sources/CCXTPodCore/CCXT.xcframework"
        ),
        .target(
            name: "CCXTPod",
            dependencies: ["CCXTPodCore"],
            path: "Sources/CCXTPod"
        )
    ]
)

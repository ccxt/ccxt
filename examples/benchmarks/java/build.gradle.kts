plugins {
    application
    java
}

repositories {
    mavenCentral()
}

application {
    mainClass.set("bench.Main")
}

dependencies {
    // resolved from the composite build declared in settings.gradle.kts
    implementation("io.github.ccxt:lib")
    // silence Netty/SLF4J stderr noise for a runnable app
    runtimeOnly("org.slf4j:slf4j-nop:2.0.13")
}

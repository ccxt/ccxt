plugins {
    application
    java
}


group = "tests"
version = "unspecified"

repositories {
    mavenCentral()
}

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

dependencies {
    implementation(project(":lib"))
    // Silence Netty's "No SLF4J providers were found" stderr noise so the JS
    // test harness doesn't mark every Java WS exchange as WARN (run-tests.js
    // flags any non-empty stderr as a warning).
    runtimeOnly("org.slf4j:slf4j-nop:2.0.13")
}

tasks.test {
    useJUnitPlatform()
}

application {
    mainClass.set("tests.Main")
}

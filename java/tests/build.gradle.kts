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
    testImplementation(libs.junit.jupiter)
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
    implementation(project(":lib"))
    // Silence Netty's "No SLF4J providers were found" stderr noise so the JS
    // test harness doesn't mark every Java WS exchange as WARN (run-tests.js
    // flags any non-empty stderr as a warning).
    runtimeOnly("org.slf4j:slf4j-nop:2.0.13")
}

tasks.test {
    useJUnitPlatform()
    // Match :tests:run so common-pool regressions also run on low-core workers.
    jvmArgs("-Djava.util.concurrent.ForkJoinPool.common.parallelism=64")
}

application {
    mainClass.set("tests.Main")
    // the transpiled test harness nests blocking join()s inside common-pool
    // tasks (Promise.all over all fixture exchanges) — with the default
    // core-count parallelism the pool starves and the run deadlocks, so give
    // it enough workers to always make progress
    applicationDefaultJvmArgs = listOf("-Djava.util.concurrent.ForkJoinPool.common.parallelism=64")
}

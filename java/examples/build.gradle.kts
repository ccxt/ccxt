plugins {
    `java`
    application
}

repositories {
    mavenCentral()
}

dependencies {
    implementation(project(":lib"))
    // Silence Netty's "No SLF4J providers were found" stderr noise. As a runnable
    // application, examples pick their own (silent) binding; the lib stays neutral
    // so downstream consumers can wire their own logback/log4j/etc.
    runtimeOnly("org.slf4j:slf4j-nop:2.0.13")
}

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

// Allow running any example via: ./gradlew :examples:run -PmainClass=examples.FetchTicker
application {
    mainClass.set(project.findProperty("mainClass") as String? ?: "examples.FetchTicker")
}

tasks.named<JavaExec>("run") {
    standardOutput = System.out
    errorOutput = System.err
    // Pass --args to the example
    if (project.hasProperty("args")) {
        args = (project.property("args") as String).split(" ").toList()
    }
}

subprojects {
    repositories {
        mavenCentral()
        // add more if you need them, e.g. mavenLocal(), google(), etc.
    }
}

application {
    mainClass.set("cli.Main")
}

plugins {
    application
    java
}

dependencies {
    implementation(project(":lib"))
    implementation(libs.jackson.databind)
    implementation("com.google.code.gson:gson:2.11.0")
    // Silence Netty's "No SLF4J providers were found" stderr noise. As a runnable
    // application, the cli picks its own (silent) binding; the lib stays neutral
    // so downstream consumers can wire their own logback/log4j/etc.
    runtimeOnly("org.slf4j:slf4j-nop:2.0.13")
}
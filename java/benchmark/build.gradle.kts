plugins {
    application
    java
}

application {
    mainClass.set("bench.Main")
}

dependencies {
    implementation(project(":lib"))
    // silence Netty/SLF4J stderr noise for a runnable app
    runtimeOnly("org.slf4j:slf4j-nop:2.0.13")
}

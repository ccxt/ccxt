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
    implementation("com.fasterxml.jackson.core:jackson-databind:2.17.+")
}
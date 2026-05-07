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
}
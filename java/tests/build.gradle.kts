plugins {
    application
    java
}


group = "tests"
version = "unspecified"

repositories {
    mavenCentral()
}

dependencies {
    implementation(project(":lib"))
}

tasks.test {
    useJUnitPlatform()
}

application {
    mainClass.set("tests.Main")
}

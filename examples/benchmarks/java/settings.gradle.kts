// Standalone build so the benchmark lives under examples/ without being a module
// of the java/ project. A composite build pulls in the library from ../../../java.
rootProject.name = "ccxt-benchmark"

includeBuild("../../../java")

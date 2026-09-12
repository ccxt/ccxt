# SS-09 evidence — map put/get channel

`MapChannelIdentity.java` (this directory) is the dispatch/value-identity probe for the
SS-09 slice: the map put/get helpers (`Helpers.addElementToObject` / `Helpers.GetValue` /
`HashMap.put` / `this.safeString*`) are declared with `Object` parameters, exactly one
declaration per name, so a `String` operand flows in with ZERO casts and the same
`invoke*` descriptor.

```bash
cd /root/worktrees/ss-09
# java/lib/build/classes/java/main is produced by `cd java && ./gradlew compileJava`
# (the runtime classpath needs the Jackson jars Helpers.java links against)
JCP=$(find /root/.gradle/caches -name 'jackson-databind-2.18.2.jar' -o -name 'jackson-core-2.18.2.jar' \
      -o -name 'jackson-annotations-2.18.2.jar' | tr '\n' ':')
javac -cp java/lib/build/classes/java/main -d /tmp/ss09-map-channel \
    build/ss09-map-channel/MapChannelIdentity.java
java -cp /tmp/ss09-map-channel:java/lib/build/classes/java/main:$JCP MapChannelIdentity
# -> SS09 map-channel identity: OK [BTC/USDT|7|7|true:null|true|true]
```

Descriptor identity (run against the same compiled probe):

```bash
javap -c -p -cp /tmp/ss09-map-channel MapChannelIdentity | grep -E 'addElementToObject|GetValue'
# every call site — String-declared and Object-declared operands alike — targets
#   Helpers.addElementToObject:(Ljava/lang/Object;[Ljava/lang/Object;)V
#   Helpers.GetValue:(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
```

The static text census lives in `build/ss09-map-channel-census.py`:

```bash
python3 build/ss09-map-channel-census.py
```

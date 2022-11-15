const mixin = (baseClass, ...mixins) => {
    const copyProps = (target, source) => {
    // this function copies all properties and symbols, filtering out some special ones
        Object.getOwnPropertyNames (source)
        // @ts-ignore
            .concat (Object.getOwnPropertySymbols (source))
            .forEach ((prop) => {
                if (
                    !prop.match (
                        /^(?:constructor|prototype|arguments|caller|name|bind|call|apply|toString|length)$/
                    )
                ) Object.defineProperty (target, prop, Object.getOwnPropertyDescriptor (source, prop));
            });
    };
    class base extends baseClass {
        constructor (...args) {
            super (...args);
            // comment out to allows for diamond inheritance
            mixins.forEach ((mixin) => {
                copyProps (this, new mixin ());
            });
        }
    }
    mixins.forEach ((mixin) => {
    // outside contructor() to allow aggregation(A,B,C).staticFunction() to be called etc.
        copyProps (base.prototype, mixin.prototype);
        copyProps (base, mixin);
    });
    return base;
};

module.exports = {
    mixin,
};


// Rewrite standalone exchange property assignments, never comparisons or names
// such as exchangeName. The Go printer can now emit direct == comparisons.
export const GO_TEST_EXCHANGE_SETTER = [
    /^([ \t]*)exchange\.(\w+)[ \t]*=(?!=)[ \t]*(.+)$/gm,
    '$1exchange.Set$2($3)',
];

import { Command } from 'commander';

// Function to extract methods and their parameters
export function extractMethodsAndParams(exchange: any) {
    const methods: { [key: string]: string[] } = {};

    for (const methodName of Object.getOwnPropertyNames(exchange)) {
        if (methodName !== 'constructor' && typeof exchange[methodName] === 'function') {
            const paramNames = (exchange[methodName].toString()
                .match(/\(([^)]*)\)/)?.[1]
                .split(',') as string[])
                .map(param => param.trim()) || [];
            if (!paramNames.includes('params = {}')) continue; // only include those functions with params
            methods[methodName] = paramNames;
        }
    }

    return methods;
}

// Create CLI based on extracted methods and parameters
export async function createExchangeCommand(program: Command, exchange: any) {
    const exchangeCmd = program.command(exchange.id)
    const methods = extractMethodsAndParams(exchange);

    for (const methodName in methods) {
        const methodCmd = exchangeCmd
            .command(methodName)
        //   .description () // TODO: is it possible to grab from jsdocs?

        methods[methodName].forEach((param, index) => {
            if (param.includes('=')) {
                const arg = param.split(' = ')[0];
                methodCmd.argument(`[${arg}]`);
            } else {
                methodCmd.argument(`<${param}>`);
            }
        });
        methodCmd.action(async (...args: any[]) => {
            const params = args.slice(0, -1); // exclude the last action callback
            const instance = exchange;
            console.log(await instance[methodName](...params));
        });
    }
}

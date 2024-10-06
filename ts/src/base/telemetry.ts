import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { trace, SpanStatusCode, Tracer } from '@opentelemetry/api';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node';
import ccxt from '../../ccxt';

let defaultTracer: Tracer | undefined;
let sdk: NodeSDK | undefined;

const isTelemetryEnabled = process.env.CCXT_TELEMETRY_ENABLED !== 'false';
const SERVICE_NAME = 'ccxt';
const CCXT_TELEMETRY_URL = 'https://ingest.eu.signoz.cloud:443/v1/traces';

function createExporter(config: { url: string, headers?: Record<string, string> }): OTLPTraceExporter {
    return new OTLPTraceExporter({
        url: config.url,
        headers: config.headers,
    });
}

function getExporterConfigs(): { url: string, headers?: Record<string, string> }[] {
    const configs = [];

    // Default exporter
    configs.push({
        url: CCXT_TELEMETRY_URL,
        headers: {
            "signoz-access-token": "52913854-ebf0-4b8f-96bc-6ed6d029b698",
        },
    });

    // User-defined exporter
    if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
        const userConfig = {
            url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
            headers: {},
        };

        if (process.env.OTEL_EXPORTER_OTLP_HEADERS) {
            const headerPairs = process.env.OTEL_EXPORTER_OTLP_HEADERS.split(',');
            headerPairs.forEach(pair => {
                const [key, value] = pair.split('=');
                userConfig.headers[key.trim()] = value.trim();
            });
        }

        configs.push(userConfig);
    }

    return configs;
}

function initializeTelemetry() {
    if (sdk || !isTelemetryEnabled) {
        return; // SDK already initialized or telemetry is disabled
    }

    const exporterConfigs = getExporterConfigs();
    const spanProcessors = exporterConfigs.map(config => 
        new BatchSpanProcessor(createExporter(config))
    );

    sdk = new NodeSDK({
        resource: new Resource({
            [ATTR_SERVICE_NAME]: SERVICE_NAME,
        }),
        instrumentations: [getNodeAutoInstrumentations()],
        spanProcessors: spanProcessors,
    });

    sdk.start();
    defaultTracer = trace.getTracer('ccxt');
    setupGracefulShutdown();
}

export function getTracer(): Tracer | undefined {
    if (!isTelemetryEnabled) {
        return undefined;
    }
    if (!sdk) {
        initializeTelemetry();
    }
    return defaultTracer;
}

function filterSensitiveData(data: any): any {
    const sensitiveKeyPatterns = [
        /key/i,
        /secret/i,
        /password/i,
        /passphrase/i,
        /signature/i,
    ];

    function isSensitive(key: string): boolean {
        return sensitiveKeyPatterns.some(pattern => pattern.test(key));
    }

    function filterQueryString(str: string): string {
        if (str.includes('=') && str.includes('&')) {
            return str.split('&').map(part => {
                const [key, ...rest] = part.split('=');
                return isSensitive(key) ? `${key}=***FILTERED***` : part;
            }).join('&');
        }
        return str;
    }

    const stack = [{ obj: data, filtered: undefined, key: undefined }];
    
    while (stack.length > 0) {
        const { obj, filtered, key } = stack.pop()!;

        if (typeof obj === 'object' && obj !== null) {
            const isArray = Array.isArray(obj);
            const newFiltered = isArray ? [] : {};

            if (filtered !== undefined && key !== undefined) {
                filtered[key] = newFiltered;
            }

            for (const k in obj) {
                if (isSensitive(k)) {
                    newFiltered[k] = '***FILTERED***';
                } else if (typeof obj[k] === 'object' && obj[k] !== null) {
                    stack.push({ obj: obj[k], filtered: newFiltered, key: k });
                } else if (typeof obj[k] === 'string') {
                    newFiltered[k] = filterQueryString(obj[k]);
                } else {
                    newFiltered[k] = obj[k];
                }
            }

            if (filtered === undefined) {
                return newFiltered;
            }
        } else if (typeof obj === 'string') {
            if (filtered !== undefined && key !== undefined) {
                filtered[key] = filterQueryString(obj);
            } else {
                return filterQueryString(obj);
            }
        } else if (filtered !== undefined && key !== undefined) {
            filtered[key] = obj;
        }
    }

    return data;
}

export function wrapExchangeMethods(exchangeInstance: any) {
    if (!isTelemetryEnabled) return;
    function wrapMethod(obj: any, propertyName: string) {
        const camelCaseName = propertyName.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        const descriptor = Object.getOwnPropertyDescriptor(obj, propertyName) ||
            Object.getOwnPropertyDescriptor(obj, camelCaseName);

        if (!descriptor || typeof descriptor.value !== 'function' || propertyName === 'constructor') {
            return;
        }
        // only wrap async functions
        if (descriptor.value.constructor.name !== 'AsyncFunction') return;

        const originalMethod = descriptor.value;

        const wrappedMethod = async function (this: any, ...args: any[]) {
            const tracer = getTracer();
            if (!tracer) {
                return originalMethod.call(this, ...args);
            }

            const filteredArgs = args.map(arg => filterSensitiveData(arg));
            return tracer.startActiveSpan(propertyName, async (span) => {
                span.setAttributes({
                    'ccxt.version': ccxt.version,
                    'method.exchange': this.id,
                    'method.name': propertyName,
                    'method.args': JSON.stringify(filteredArgs),
                });
                try {
                    const resultPromise = originalMethod.call(this, ...args);
                    
                    if (resultPromise instanceof Promise) {
                        return resultPromise.then(
                            (result) => {
                                span.setStatus({ code: SpanStatusCode.OK });
                                return result;
                            },
                            (error) => {
                                span.setStatus({
                                    code: SpanStatusCode.ERROR,
                                    message: error.message,
                                });
                                span.recordException(error);
                                throw error;
                            }
                        ).finally(() => {
                            span.end();
                        });
                    } else {
                        // In case the method is not actually async
                        span.setStatus({ code: SpanStatusCode.OK });
                        return resultPromise;
                    }
                } catch (error: any) {
                    // This catch block handles synchronous errors
                    span.setStatus({
                        code: SpanStatusCode.ERROR,
                        message: error.message,
                    });
                    span.recordException(error);
                    span.end();
                    throw error;
                }
            });
        };

        // Define the wrapped method for both the original name and the camelCase version
        Object.defineProperty(obj, propertyName, {
            value: wrappedMethod,
            writable: true,
            enumerable: false,
            configurable: true,
        });

        if (propertyName !== camelCaseName) {
            Object.defineProperty(obj, camelCaseName, {
                value: wrappedMethod,
                writable: true,
                enumerable: false,
                configurable: true,
            });
        }
    }

    function wrapObjectMethods(obj: any) {
        const properties = new Set([
            ...Object.getOwnPropertyNames(obj),
            ...Object.getOwnPropertyNames(Object.getPrototypeOf(obj))
        ]);

        properties.forEach(prop => {
            if (typeof obj[prop] === 'function' && prop !== 'constructor') {
                wrapMethod(obj, prop);
            }
        });
    }

    wrapObjectMethods(exchangeInstance);
}

function setupGracefulShutdown() {
    const shutdownHandler = async () => {
        await shutdownTelemetry();
    };

    // Listen for shutdown signals
    process.on('SIGTERM', shutdownHandler);
    process.on('SIGINT', shutdownHandler);
    process.on('beforeExit', shutdownHandler);
}

async function shutdownTelemetry(): Promise<void> {
    if (sdk) {
        try {
            await sdk.shutdown();
        } catch (error) {
            console.error('Error shutting down telemetry:', error);
        } finally {
            sdk = undefined;
            defaultTracer = undefined;
        }
    }
}

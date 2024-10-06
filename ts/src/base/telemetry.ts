import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { trace, SpanStatusCode, Tracer } from '@opentelemetry/api';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node';
import ccxt from '../../ccxt';

let defaultTracer: Tracer | undefined;
let defaultExporter: OTLPTraceExporter | undefined;
let sdk: NodeSDK | undefined;

const isTelemetryEnabled = process.env.CCXT_TELEMETRY_ENABLED !== 'false';
const SERVICE_NAME = 'ccxt';

function initializeTelemetry() {
  if (sdk || !isTelemetryEnabled) {
    return; // SDK already initialized or telemetry is disabled
  }

  defaultExporter = new OTLPTraceExporter({
    url: 'https://ingest.eu.signoz.cloud:443/v1/traces',
    headers: {
      "signoz-access-token": "52913854-ebf0-4b8f-96bc-6ed6d029b698",
    },
  });

  const batchProcessor = new BatchSpanProcessor(defaultExporter);

  sdk = new NodeSDK({
    resource: new Resource({
      [ATTR_SERVICE_NAME]: SERVICE_NAME,
    }),
    instrumentations: [getNodeAutoInstrumentations()],
    spanProcessor: batchProcessor,
  });

  sdk.start();
  defaultTracer = trace.getTracer('ccxt');
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

export function traceMethod<T extends (...args: any[]) => any>(
  target: any,
  propertyKey: string,
  descriptor: TypedPropertyDescriptor<T>
): TypedPropertyDescriptor<T> {
  const originalMethod = descriptor.value;

    descriptor.value = async function (this: any, ...args: any[]) {
      const tracer = getTracer();
      if (!tracer) {
        return originalMethod.apply(this, args);
      }

      console.log('traceMethod', propertyKey, args);
      const filteredArgs = args.map(arg => filterSensitiveData(arg));

    return tracer.startActiveSpan(propertyKey, async (span) => {
      console.log('starting span')
      span.setAttributes({
        'ccxt.version': ccxt.version,
        'method.exchange': this.id,
        'method.name': propertyKey,
        'method.args': JSON.stringify(filteredArgs),
      });

      try {
        const result = await originalMethod.call(this, ...args);
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      } catch (error: any) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error.message,
        });
        span.recordException(error);
        throw error;
      } finally {
        span.end();
      }
    });
  } as any;

  return descriptor;
}

function filterSensitiveData(data: any): any {
  const stack = [{ obj: data, filtered: undefined, key: undefined }];
  const sensitiveKeys = ['apiKey', 'secret', 'password', 'passphrase', 'key'];

  while (stack.length > 0) {
    const { obj, filtered, key } = stack.pop()!;

    if (typeof obj === 'object' && obj !== null) {
      const isArray = Array.isArray(obj);
      const newFiltered = isArray ? [] : {};

      if (filtered !== undefined && key !== undefined) {
        filtered[key] = newFiltered;
      }

      for (const k in obj) {
        if (sensitiveKeys.includes(k)) {
          newFiltered[k] = '***FILTERED***';
        } else if (typeof obj[k] === 'object' && obj[k] !== null) {
          stack.push({ obj: obj[k], filtered: newFiltered, key: k });
        } else {
          newFiltered[k] = obj[k];
        }
      }

      if (filtered === undefined) {
        return newFiltered;
      }
    } else if (filtered !== undefined && key !== undefined) {
      filtered[key] = obj;
    }
  }

  return data;
}

export function wrapExchange() {
  return function <T extends { new(...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
      constructor(...args: any[]) {
        super(...args);
        if (isTelemetryEnabled) {
          wrapExchangeMethods(this);
        }
      }
    };
  };
}

export function wrapExchangeMethods(exchangeInstance: any) {
  function wrapMethod(obj: any, propertyName: string) {
    const camelCaseName = propertyName.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    const descriptor = Object.getOwnPropertyDescriptor(obj, propertyName) || 
                       Object.getOwnPropertyDescriptor(obj, camelCaseName);

    if (!descriptor || typeof descriptor.value !== 'function' || propertyName === 'constructor') {
      return;
    }
    if (descriptor.value.constructor.name !== 'AsyncFunction') return;

    const originalMethod = descriptor.value;
    console.log(`Wrapping method: ${propertyName}`);

    const wrappedMethod = function (this: any, ...args: any[]) {
      const tracer = getTracer();
      if (!tracer) {
        return originalMethod.call(this, ...args);
      }

      const filteredArgs = args.map(arg => filterSensitiveData(arg));
      return tracer.startActiveSpan(propertyName, async (span) => {
        console.log(`Starting span for ${propertyName}`);
        span.setAttributes({
          'ccxt.version': ccxt.version,
          'method.exchange': this.id,
          'method.name': propertyName,
          'method.args': JSON.stringify(filteredArgs),
        });

        try {
          const result = await Promise.resolve(originalMethod.call(this, args));
          span.setStatus({ code: SpanStatusCode.OK });
          return result;
        } catch (error: any) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error.message,
          });
          span.recordException(error);
          throw error;
        } finally {
          span.end();
          console.log(`Span ended for ${propertyName}`);
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

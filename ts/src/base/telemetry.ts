import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { trace, context, Span } from '@opentelemetry/api';

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'ccxt-library',
  }),
  traceExporter: new OTLPTraceExporter({
    url: 'http://signoz:4318/v1/traces', // Adjust this URL to match your SigNoz setup
  }),
});

sdk.start();

export const tracer = trace.getTracer('ccxt-tracer');

export function traceMethod<T>(
  target: any,
  propertyKey: string,
  descriptor: TypedPropertyDescriptor<T>
): TypedPropertyDescriptor<T> {
  const originalMethod = descriptor.value as Function;

  descriptor.value = function (...args: any[]) {
    const span = tracer.startSpan(propertyKey);
    const filteredArgs = args.map(arg => filterSensitiveData(arg));

    context.with(trace.setSpan(context.active(), span), () => {
      span.setAttributes({
        'method.name': propertyKey,
        'method.args': JSON.stringify(filteredArgs),
      });

      try {
        const result = originalMethod.apply(this, args);
        if (result instanceof Promise) {
          return result.then(
            (value) => {
              span.end();
              return value;
            },
            (error) => {
              span.recordException(error);
              span.end();
              throw error;
            }
          );
        } else {
          span.end();
          return result;
        }
      } catch (error) {
        span.recordException(error);
        span.end();
        throw error;
      }
    });
  } as any;

  return descriptor;
}

function filterSensitiveData(data: any): any {
  if (typeof data === 'object' && data !== null) {
    const filtered = Array.isArray(data) ? [] : {};
    for (const key in data) {
      if (key === 'apiKey' || key === 'secret' || key === 'password') {
        filtered[key] = '***FILTERED***';
      } else {
        filtered[key] = filterSensitiveData(data[key]);
      }
    }
    return filtered;
  }
  return data;
}
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { ImageZoom } from 'fumadocs-ui/components/image-zoom';
import type { MDXComponents } from 'mdx/types';
import { PredictionDataModel } from '@/components/prediction-data-model';
import { ExchangesTable } from '@/components/exchanges-table';

// CCXT docs reference remote images without width/height, and we don't fetch their
// dimensions at build time. next/image (used by the default img + ImageZoom's fallback)
// REQUIRES width/height, so it throws "missing required width property". Render a plain
// <img> as ImageZoom's child — that path skips next/image while keeping click-to-zoom.
function ZoomableImg(props: any) {
  return (
    <ImageZoom src={props.src}>
      {/* lazy + async-decode: doc pages embed many remote badges/screenshots; don't
          fetch them all eagerly (cuts layout shift + network on image-heavy pages). */}
      <img
        loading="lazy"
        decoding="async"
        {...props}
        className={['rounded-lg', props.className].filter(Boolean).join(' ')}
      />
    </ImageZoom>
  );
}

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    img: ZoomableImg as any,
    PredictionDataModel: PredictionDataModel as any,
    ExchangesTable: ExchangesTable as any,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}

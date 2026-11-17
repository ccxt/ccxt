import type { SourceType } from '../types.ts';
import type { Adapter } from './types.ts';
import { rss } from './rss.ts';
import { md } from './md.ts';
import { html } from './html.ts';
import { json } from './json.ts';
import { hash } from './hash.ts';
import { spec } from './spec.ts';
import { ghCommits } from './ghcommits.ts';

export const ADAPTERS: Record<SourceType, Adapter> = { rss, md, html, json, hash, spec, 'gh-commits': ghCommits };

export type { Adapter, AdapterInput, AdapterOutput, ParsedEntry } from './types.ts';

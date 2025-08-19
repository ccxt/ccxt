import axios, { AxiosInstance, AxiosProxyConfig } from 'axios';

import { DEFAULT_API_TIMEOUT } from '../constants';
import { generateQueryPath } from '../helpers/request-helpers';
import { Response } from '../lib/axios';
import { Data } from '../types';

export default class RestClient {
  readonly host: string;
  readonly apiTimeout: Number;
  readonly axiosInstance: AxiosInstance;

  constructor(host: string, apiTimeout?: Number | null, proxy?: AxiosProxyConfig) {
    if (host.endsWith('/')) {
      this.host = host.slice(0, -1);
    } else {
      this.host = host;
    }
    this.apiTimeout = apiTimeout || DEFAULT_API_TIMEOUT;
    this.axiosInstance = axios.create({
      proxy,
    });
  }

  async get(requestPath: string, params: {} = {}): Promise<Data> {
    const url = `${this.host}${generateQueryPath(requestPath, params)}`;
    const response = await this.axiosInstance.get(url);
    return response.data;
  }

  async post(
    requestPath: string,
    params: {} = {},
    body?: unknown | null,
    headers: {} = {},
  ): Promise<Response> {
    const url = `${this.host}${generateQueryPath(requestPath, params)}`;
    return this.axiosInstance.post(url, body, { headers });
  }
}

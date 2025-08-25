import axios, { AxiosRequestConfig } from 'axios';

import { Data } from '../../types';
import { AxiosServerError, AxiosError } from './errors';
import { RequestMethod } from './types';

export interface Response {
  status: number;
  data: Data;
  headers: {};
}

async function axiosRequest(options: AxiosRequestConfig): Promise<Response> {
  try {
    return await axios(options);
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (error.isAxiosError) {
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (error.response) {
        throw new AxiosServerError(error.response, error);
      }
      throw new AxiosError(`Axios: ${error.message}`, error);
    }
    throw error;
  }
}

export function request(
  url: string,
  method: RequestMethod = RequestMethod.GET,
  body?: unknown | null,
  headers: {} = {},
): Promise<Response> {
  return axiosRequest({
    url,
    method,
    data: body,
    headers,
  });
}

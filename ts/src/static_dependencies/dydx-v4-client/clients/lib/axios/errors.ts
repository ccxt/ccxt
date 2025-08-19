import { WrappedError } from '../errors';

interface AxiosOriginalError extends Error {
  isAxiosError: true;
  toJSON(): {};
}

interface AxiosErrorResponse {
  status: number;
  statusText: string;
  data: {};
}

/**
 * @description An error thrown by axios.
 *
 * Depending on your use case, if logging errors, you may want to catch axios errors and sanitize
 * them to remove the request and response objects, or sensitive fields. For example:
 *
 *   this.originalError = _.omit(originalError.toJSON(), 'config')
 */
export class AxiosError extends WrappedError {}

/**
 * @description Axios error with response error fields.
 */
export class AxiosServerError extends AxiosError {
  public readonly status: number;
  public readonly statusText: string;
  public readonly data: {};

  constructor(response: AxiosErrorResponse, originalError: AxiosOriginalError) {
    super(
      `${response.status}: ${response.statusText} - ${JSON.stringify(response.data, null, 2)}`,
      originalError,
    );
    this.status = response.status;
    this.statusText = response.statusText;
    this.data = response.data;
  }
}

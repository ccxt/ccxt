export type RequestBody = {
  id: number | string;
  jsonrpc: '2.0';
  method: string;
  params?: {};
};

export type ResponseBody = {
  id: number | string;
  jsonrpc: '2.0';
} & (SuccessResponseBody | ErrorResponseBody);

export type SuccessResponseBody = {
  result: unknown;
};

export type ErrorResponseBody = {
  error: Error;
};

export type Error = {
  code: number;
  message: string;
  data?: unknown;
};

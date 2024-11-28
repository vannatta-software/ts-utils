import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { IServerError, ErrorResponse, SuccessResponse, IServerResponse } from './ResponseUtils';

export class ApiClient {
  private logging: boolean = false;
  private authToken?: string;
  private xsrfToken?: string;
  private connectionId?: string;
  private host?: string;

  constructor(
    private config: AxiosRequestConfig = { headers: { 'Content-Type': 'application/json' } }
  ) {}

  // Getters for tokens and host
  get AuthenicationToken() {
    return this.authToken;
  }

  get XSRFToken() {
    return this.xsrfToken;
  }

  get Host() {
    return this.host;
  }

  // Enable or disable logging
  setLogging(state: boolean) {
    this.logging = state;
  }

  // Set the authentication token
  addAuthentication(authToken: string | undefined) {
    this.authToken = authToken;
    if (!authToken) this.authToken = undefined;
  }

  // Set the XSRF token
  addXSRF(xsrfToken: string) {
    this.xsrfToken = xsrfToken;
    if (!xsrfToken) this.xsrfToken = undefined;
  }

  // Set the connection ID for WebSocket communication
  websocketConnection(id: string | null | undefined) {
    this.connectionId = id ?? '';
  }

  // Define the host for API requests
  defineHost(host: string) {
    this.host = host;
    this.config.baseURL = host; // Apply the base URL to the config
  }

  // Configure request headers
  private configureHeaders(config: AxiosRequestConfig) {
    config.headers = config.headers || {};

    if (this.authToken && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    if (this.xsrfToken) {
      config.headers['RequestVerificationToken'] = this.xsrfToken;
    }

    if (this.connectionId) {
      config.headers['Connection-Id'] = this.connectionId;
    }

    // Logging the request configuration if enabled
    if (this.logging) {
      console.log('Request Configuration:', config);
    }
  }

  // Improved request handling
  public request<T>(config: AxiosRequestConfig): Promise<SuccessResponse<T>> {
    this.configureHeaders(config);

    if (config.data && config.data.constructor.name !== 'FormData') {
      config.data = JSON.stringify(config.data); // Ensure JSON body for requests
    }

    return new Promise((resolve, reject) => {
      axios(config)
        .then((response: AxiosResponse<IServerResponse<T>>) => {
          const successResponse = new SuccessResponse(response.data);

          // Logging the successful response if enabled
          if (this.logging) {
            console.log('Response:', successResponse);
          }

          resolve(successResponse);
        })
        .catch((error: any) => {
          const errorResponse = new ErrorResponse(error.response);

          // Logging the error response if enabled
          if (this.logging) {
            console.error('Error Response:', errorResponse);
          }

          reject(errorResponse);
        });
    });
  }
}

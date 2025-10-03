export const STATUS_CODES = {
    // 1xx Informational
    CONTINUE: 100,
    SWITCHING_PROTOCOLS: 101,
    PROCESSING: 102, // WebDAV
    EARLY_HINTS: 103, // RFC 8297

    // 2xx Success
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NON_AUTHORITATIVE_INFORMATION: 203,
    NO_CONTENT: 204,
    RESET_CONTENT: 205,
    PARTIAL_CONTENT: 206,
    MULTI_STATUS: 207, // WebDAV
    ALREADY_REPORTED: 208, // WebDAV
    IM_USED: 226, // RFC 3229

    // 3xx Redirection
    MULTIPLE_CHOICES: 300,
    MOVED_PERMANENTLY: 301,
    FOUND: 302,
    SEE_OTHER: 303,
    NOT_MODIFIED: 304,
    USE_PROXY: 305,
    TEMPORARY_REDIRECT: 307,
    PERMANENT_REDIRECT: 308,

    // 4xx Client Error
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    PAYMENT_REQUIRED: 402,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    NOT_ACCEPTABLE: 406,
    PROXY_AUTHENTICATION_REQUIRED: 407,
    REQUEST_TIMEOUT: 408,
    CONFLICT: 409,
    GONE: 410,
    LENGTH_REQUIRED: 411,
    PRECONDITION_FAILED: 412,
    REQUEST_ENTITY_TOO_LARGE: 413,
    REQUEST_URI_TOO_LONG: 414,
    UNSUPPORTED_MEDIA_TYPE: 415,
    REQUESTED_RANGE_NOT_SATISFIABLE: 416,
    EXPECTATION_FAILED: 417,
    IM_A_TEAPOT: 418, // RFC 7168
    MISDIRECTED_REQUEST: 421, // RFC 7540
    UNPROCESSABLE_ENTITY: 422,
    LOCKED: 423, // WebDAV
    FAILED_DEPENDENCY: 424, // WebDAV
    TOO_EARLY: 425, // RFC 8470
    UPGRADE_REQUIRED: 426,
    PRECONDITION_REQUIRED: 428, // RFC 6585
    TOO_MANY_REQUESTS: 429, // RFC 6585
    REQUEST_HEADER_FIELDS_TOO_LARGE: 431, // RFC 6585
    UNAVAILABLE_FOR_LEGAL_REASONS: 451, // RFC 7725

    // 5xx Server Error
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
    HTTP_VERSION_NOT_SUPPORTED: 505,
    VARIANT_ALSO_NEGOTIATES: 506, // RFC 2295
    INSUFFICIENT_STORAGE: 507, // WebDAV
    LOOP_DETECTED: 508, // WebDAV
    NOT_EXTENDED: 510, // RFC 2774
    NETWORK_AUTHENTICATION_REQUIRED: 511, // RFC 6585
} as const;

export type StatusCode = typeof STATUS_CODES[keyof typeof STATUS_CODES];

// Status code categories
export const STATUS_CATEGORIES = {
    INFORMATIONAL: '1xx',
    SUCCESS: '2xx',
    REDIRECTION: '3xx',
    CLIENT_ERROR: '4xx',
    SERVER_ERROR: '5xx',
} as const;

export const STATUS_MESSAGES: Record<StatusCode, string> = {
    // 1xx Informational
    [STATUS_CODES.CONTINUE]: 'Continue',
    [STATUS_CODES.SWITCHING_PROTOCOLS]: 'Switching Protocols',
    [STATUS_CODES.PROCESSING]: 'Processing',
    [STATUS_CODES.EARLY_HINTS]: 'Early Hints',

    // 2xx Success
    [STATUS_CODES.OK]: 'OK',
    [STATUS_CODES.CREATED]: 'Created',
    [STATUS_CODES.ACCEPTED]: 'Accepted',
    [STATUS_CODES.NON_AUTHORITATIVE_INFORMATION]: 'Non-Authoritative Information',
    [STATUS_CODES.NO_CONTENT]: 'No Content',
    [STATUS_CODES.RESET_CONTENT]: 'Reset Content',
    [STATUS_CODES.PARTIAL_CONTENT]: 'Partial Content',
    [STATUS_CODES.MULTI_STATUS]: 'Multi-Status',
    [STATUS_CODES.ALREADY_REPORTED]: 'Already Reported',
    [STATUS_CODES.IM_USED]: 'IM Used',

    // 3xx Redirection
    [STATUS_CODES.MULTIPLE_CHOICES]: 'Multiple Choices',
    [STATUS_CODES.MOVED_PERMANENTLY]: 'Moved Permanently',
    [STATUS_CODES.FOUND]: 'Found',
    [STATUS_CODES.SEE_OTHER]: 'See Other',
    [STATUS_CODES.NOT_MODIFIED]: 'Not Modified',
    [STATUS_CODES.USE_PROXY]: 'Use Proxy',
    [STATUS_CODES.TEMPORARY_REDIRECT]: 'Temporary Redirect',
    [STATUS_CODES.PERMANENT_REDIRECT]: 'Permanent Redirect',

    // 4xx Client Error
    [STATUS_CODES.BAD_REQUEST]: 'Bad Request',
    [STATUS_CODES.UNAUTHORIZED]: 'Unauthorized',
    [STATUS_CODES.PAYMENT_REQUIRED]: 'Payment Required',
    [STATUS_CODES.FORBIDDEN]: 'Forbidden',
    [STATUS_CODES.NOT_FOUND]: 'Not Found',
    [STATUS_CODES.METHOD_NOT_ALLOWED]: 'Method Not Allowed',
    [STATUS_CODES.NOT_ACCEPTABLE]: 'Not Acceptable',
    [STATUS_CODES.PROXY_AUTHENTICATION_REQUIRED]: 'Proxy Authentication Required',
    [STATUS_CODES.REQUEST_TIMEOUT]: 'Request Timeout',
    [STATUS_CODES.CONFLICT]: 'Conflict',
    [STATUS_CODES.GONE]: 'Gone',
    [STATUS_CODES.LENGTH_REQUIRED]: 'Length Required',
    [STATUS_CODES.PRECONDITION_FAILED]: 'Precondition Failed',
    [STATUS_CODES.REQUEST_ENTITY_TOO_LARGE]: 'Request Entity Too Large',
    [STATUS_CODES.REQUEST_URI_TOO_LONG]: 'Request-URI Too Long',
    [STATUS_CODES.UNSUPPORTED_MEDIA_TYPE]: 'Unsupported Media Type',
    [STATUS_CODES.REQUESTED_RANGE_NOT_SATISFIABLE]: 'Requested Range Not Satisfiable',
    [STATUS_CODES.EXPECTATION_FAILED]: 'Expectation Failed',
    [STATUS_CODES.IM_A_TEAPOT]: "I'm a teapot",
    [STATUS_CODES.MISDIRECTED_REQUEST]: 'Misdirected Request',
    [STATUS_CODES.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
    [STATUS_CODES.LOCKED]: 'Locked',
    [STATUS_CODES.FAILED_DEPENDENCY]: 'Failed Dependency',
    [STATUS_CODES.TOO_EARLY]: 'Too Early',
    [STATUS_CODES.UPGRADE_REQUIRED]: 'Upgrade Required',
    [STATUS_CODES.PRECONDITION_REQUIRED]: 'Precondition Required',
    [STATUS_CODES.TOO_MANY_REQUESTS]: 'Too Many Requests',
    [STATUS_CODES.REQUEST_HEADER_FIELDS_TOO_LARGE]: 'Request Header Fields Too Large',
    [STATUS_CODES.UNAVAILABLE_FOR_LEGAL_REASONS]: 'Unavailable For Legal Reasons',

    // 5xx Server Error
    [STATUS_CODES.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
    [STATUS_CODES.NOT_IMPLEMENTED]: 'Not Implemented',
    [STATUS_CODES.BAD_GATEWAY]: 'Bad Gateway',
    [STATUS_CODES.SERVICE_UNAVAILABLE]: 'Service Unavailable',
    [STATUS_CODES.GATEWAY_TIMEOUT]: 'Gateway Timeout',
    [STATUS_CODES.HTTP_VERSION_NOT_SUPPORTED]: 'HTTP Version Not Supported',
    [STATUS_CODES.VARIANT_ALSO_NEGOTIATES]: 'Variant Also Negotiates',
    [STATUS_CODES.INSUFFICIENT_STORAGE]: 'Insufficient Storage',
    [STATUS_CODES.LOOP_DETECTED]: 'Loop Detected',
    [STATUS_CODES.NOT_EXTENDED]: 'Not Extended',
    [STATUS_CODES.NETWORK_AUTHENTICATION_REQUIRED]: 'Network Authentication Required',
};

// Detailed status descriptions
export const STATUS_DESCRIPTIONS: Partial<Record<StatusCode, string>> = {
    // 1xx Informational
    [STATUS_CODES.CONTINUE]: 'The server has received the request headers and the client should proceed to send the request body.',
    [STATUS_CODES.SWITCHING_PROTOCOLS]: 'The requester has asked the server to switch protocols and the server has agreed to do so.',
    [STATUS_CODES.PROCESSING]: 'The server has received and is processing the request, but no response is available yet.',
    [STATUS_CODES.EARLY_HINTS]: 'Used to return some response headers before final HTTP message.',

    // 2xx Success
    [STATUS_CODES.OK]: 'The request has succeeded.',
    [STATUS_CODES.CREATED]: 'The request has been fulfilled and resulted in a new resource being created.',
    [STATUS_CODES.ACCEPTED]: 'The request has been accepted for processing, but the processing has not been completed.',
    [STATUS_CODES.NON_AUTHORITATIVE_INFORMATION]: 'The server is a transforming proxy that received a 200 OK from its origin.',
    [STATUS_CODES.NO_CONTENT]: 'The server successfully processed the request and is not returning any content.',
    [STATUS_CODES.RESET_CONTENT]: 'The server successfully processed the request, but is not returning any content.',
    [STATUS_CODES.PARTIAL_CONTENT]: 'The server is delivering only part of the resource due to a range header sent by the client.',
    [STATUS_CODES.MULTI_STATUS]: 'The message body contains multiple status informations for different parts of a batch request.',
    [STATUS_CODES.ALREADY_REPORTED]: 'The members of a DAV binding have already been enumerated in a previous reply.',
    [STATUS_CODES.IM_USED]: 'The server has fulfilled a request and the response is a representation of the result of one or more instance-manipulations.',

    // Add more descriptions as needed...
    [STATUS_CODES.BAD_REQUEST]: 'The server cannot or will not process the request due to an apparent client error.',
    [STATUS_CODES.UNAUTHORIZED]: 'Similar to 403 Forbidden, but specifically for use when authentication is required and has failed or has not yet been provided.',
    [STATUS_CODES.FORBIDDEN]: 'The request was valid, but the server is refusing action.',
    [STATUS_CODES.NOT_FOUND]: 'The requested resource could not be found but may be available in the future.',
    [STATUS_CODES.INTERNAL_SERVER_ERROR]: 'A generic error message, given when an unexpected condition was encountered and no more specific message is suitable.',
    [STATUS_CODES.SERVICE_UNAVAILABLE]: 'The server is currently unavailable (because it is overloaded or down for maintenance).',
};

// Common status code groups
export const COMMON_STATUS_GROUPS = {
    SUCCESS: [STATUS_CODES.OK, STATUS_CODES.CREATED, STATUS_CODES.ACCEPTED, STATUS_CODES.NO_CONTENT],
    CLIENT_ERRORS: [STATUS_CODES.BAD_REQUEST, STATUS_CODES.UNAUTHORIZED, STATUS_CODES.FORBIDDEN, STATUS_CODES.NOT_FOUND],
    SERVER_ERRORS: [STATUS_CODES.INTERNAL_SERVER_ERROR, STATUS_CODES.BAD_GATEWAY, STATUS_CODES.SERVICE_UNAVAILABLE, STATUS_CODES.GATEWAY_TIMEOUT],
    REDIRECTS: [STATUS_CODES.MOVED_PERMANENTLY, STATUS_CODES.FOUND, STATUS_CODES.SEE_OTHER, STATUS_CODES.TEMPORARY_REDIRECT, STATUS_CODES.PERMANENT_REDIRECT],
} as const;

// Utility functions
export const getStatusMessage = (code: StatusCode): string => {
    return STATUS_MESSAGES[code] || 'Unknown Status';
};

export const getStatusDescription = (code: StatusCode): string => {
    return STATUS_DESCRIPTIONS[code] || 'No description available';
};

export const isValidStatusCode = (code: number): code is StatusCode => {
    return Object.values(STATUS_CODES).includes(code as StatusCode);
};

// Category checking functions
export const isInformational = (code: StatusCode): boolean => {
    return code >= 100 && code < 200;
};

export const isSuccess = (code: StatusCode): boolean => {
    return code >= 200 && code < 300;
};

export const isRedirection = (code: StatusCode): boolean => {
    return code >= 300 && code < 400;
};

export const isClientError = (code: StatusCode): boolean => {
    return code >= 400 && code < 500;
};

export const isServerError = (code: StatusCode): boolean => {
    return code >= 500 && code < 600;
};

export const isError = (code: StatusCode): boolean => {
    return isClientError(code) || isServerError(code);
};

export const getStatusCategory = (code: StatusCode): string => {
    if (isInformational(code)) return STATUS_CATEGORIES.INFORMATIONAL;
    if (isSuccess(code)) return STATUS_CATEGORIES.SUCCESS;
    if (isRedirection(code)) return STATUS_CATEGORIES.REDIRECTION;
    if (isClientError(code)) return STATUS_CATEGORIES.CLIENT_ERROR;
    if (isServerError(code)) return STATUS_CATEGORIES.SERVER_ERROR;
    return 'Unknown';
};

// Response creation helpers
export interface HttpResponse {
    statusCode: StatusCode;
    statusMessage: string;
    body?: any;
    headers?: Record<string, string>;
}

export const createResponse = (
    statusCode: StatusCode,
    body?: any,
    headers?: Record<string, string>
): HttpResponse => {
    return {
        statusCode,
        statusMessage: getStatusMessage(statusCode),
        body,
        headers,
    };
};

// Quick response creators
export const responses = {
    ok: (body?: any, headers?: Record<string, string>) =>
        createResponse(STATUS_CODES.OK, body, headers),

    created: (body?: any, headers?: Record<string, string>) =>
        createResponse(STATUS_CODES.CREATED, body, headers),

    noContent: (headers?: Record<string, string>) =>
        createResponse(STATUS_CODES.NO_CONTENT, undefined, headers),

    badRequest: (body?: any, headers?: Record<string, string>) =>
        createResponse(STATUS_CODES.BAD_REQUEST, body, headers),

    unauthorized: (body?: any, headers?: Record<string, string>) =>
        createResponse(STATUS_CODES.UNAUTHORIZED, body, headers),

    forbidden: (body?: any, headers?: Record<string, string>) =>
        createResponse(STATUS_CODES.FORBIDDEN, body, headers),

    notFound: (body?: any, headers?: Record<string, string>) =>
        createResponse(STATUS_CODES.NOT_FOUND, body, headers),

    conflict: (body?: any, headers?: Record<string, string>) =>
        createResponse(STATUS_CODES.CONFLICT, body, headers),

    unprocessableEntity: (body?: any, headers?: Record<string, string>) =>
        createResponse(STATUS_CODES.UNPROCESSABLE_ENTITY, body, headers),

    tooManyRequests: (body?: any, headers?: Record<string, string>) =>
        createResponse(STATUS_CODES.TOO_MANY_REQUESTS, body, headers),

    internalServerError: (body?: any, headers?: Record<string, string>) =>
        createResponse(STATUS_CODES.INTERNAL_SERVER_ERROR, body, headers),

    serviceUnavailable: (body?: any, headers?: Record<string, string>) =>
        createResponse(STATUS_CODES.SERVICE_UNAVAILABLE, body, headers),
};

// Status code ranges
export const STATUS_RANGES = {
    INFORMATIONAL_MIN: 100,
    INFORMATIONAL_MAX: 199,
    SUCCESS_MIN: 200,
    SUCCESS_MAX: 299,
    REDIRECTION_MIN: 300,
    REDIRECTION_MAX: 399,
    CLIENT_ERROR_MIN: 400,
    CLIENT_ERROR_MAX: 499,
    SERVER_ERROR_MIN: 500,
    SERVER_ERROR_MAX: 599,
} as const;

// Get all status codes by category
export const getStatusCodesByCategory = () => {
    const categorized = {
        informational: [] as StatusCode[],
        success: [] as StatusCode[],
        redirection: [] as StatusCode[],
        clientError: [] as StatusCode[],
        serverError: [] as StatusCode[],
    };

    Object.values(STATUS_CODES).forEach(code => {
        if (isInformational(code)) categorized.informational.push(code);
        else if (isSuccess(code)) categorized.success.push(code);
        else if (isRedirection(code)) categorized.redirection.push(code);
        else if (isClientError(code)) categorized.clientError.push(code);
        else if (isServerError(code)) categorized.serverError.push(code);
    });

    return categorized;
};

// Search status codes
export const searchStatusCodes = (query: string): Array<{ code: StatusCode; message: string; description?: string }> => {
    const results: Array<{ code: StatusCode; message: string; description?: string }> = [];
    const lowerQuery = query.toLowerCase();

    Object.entries(STATUS_MESSAGES).forEach(([codeStr, message]) => {
        const code = parseInt(codeStr) as StatusCode;
        const description = STATUS_DESCRIPTIONS[code];

        if (
            codeStr.includes(query) ||
            message.toLowerCase().includes(lowerQuery) ||
            (description && description.toLowerCase().includes(lowerQuery))
        ) {
            results.push({ code, message, description });
        }
    });

    return results.sort((a, b) => a.code - b.code);
};

// Export everything
export {
    STATUS_CODES as default
};

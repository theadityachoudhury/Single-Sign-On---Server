export interface FunctionResponseType<T> {
    error: boolean;
    data: T | null;
    errorDetails?: any;
    message?: string;
}

// class based on FunctionResponseType to create response objects
export class ResponseType<T> implements FunctionResponseType<T> {
    error: boolean;
    data: T | null;
    errorDetails?: any;
    message?: string;

    constructor(error: boolean, data: T | null, errorDetails?: any, message?: string) {
        this.error = error;
        this.data = data;
        this.errorDetails = errorDetails;
        this.message = message;
    }
}

// helper function to create success response
export function successResponse<T>(data: T, message?: string): FunctionResponseType<T> {
    return new ResponseType<T>(false, data, null, message);
}

// helper function to create error response
export function errorResponse<T>(errorDetails: any, message?: string): FunctionResponseType<T> {
    return new ResponseType<T>(true, null, errorDetails, message);
}

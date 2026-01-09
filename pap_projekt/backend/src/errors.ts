export class HttpError extends Error { constructor(public status: number, message: string){ super(message);} }
export const badRequest = (m: string) => new HttpError(400, m);
export const unauthorized = (m = "Unauthorized") => new HttpError(401, m);
export const forbidden = (m = "Forbidden") => new HttpError(403, m);
export const notFound = (m = "Not found") => new HttpError(404, m);

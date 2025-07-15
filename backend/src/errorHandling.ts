export const ErrorNames = {
    Auth: 'AuthError',
    NotFound: 'NotFoundError',
    Conflict: 'ConflictError',
    BadRequest: 'BadRequestError',
    Forbidden: 'ForbiddenError',
    Validation: 'ValidationError',
} as const;

export function createAppError(message: string, name: typeof ErrorNames[keyof typeof ErrorNames]): Error {
    const error = new Error(message);
    error.name = name;
    return error;
}

export function handleError(error: Error, res: any): void {
    console.error('An error occurred:', error);

    // JSONパースエラー対応
    if (error instanceof SyntaxError && 'status' in error && (error as any).status === 400 && 'body' in error) {
        return res.status(400).json({ message: 'Invalid JSON in request body.' });
    }

    switch (error.name) {
        case ErrorNames.Auth:
            return res.status(401).json({ message: error.message });
        case ErrorNames.NotFound:
            return res.status(404).json({ message: error.message });
        case ErrorNames.Conflict:
            return res.status(409).json({ message: error.message });
        case ErrorNames.BadRequest:
            return res.status(400).json({ message: error.message });
        case ErrorNames.Forbidden:
            return res.status(403).json({ message: error.message });
        case ErrorNames.Validation:
            return res.status(422).json({ message: error.message });
        default:
            return res.status(500).json({ message: 'Internal Server Error' });
    }
}
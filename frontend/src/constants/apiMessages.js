export const API_MESSAGES = {
    unauthorized: 'Sua sessão expirou. Entre novamente.',
    forbidden: 'Seu perfil não tem permissão para esta ação.',
    notFound: 'Registro não encontrado.',
    network: 'Não foi possível conectar ao servidor. Verifique a conexão e tente novamente.',
    unexpected: 'Não foi possível concluir a operação. Tente novamente.',
}

export const HTTP_STATUS = {
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
}

export const HTTP_STATUS_MESSAGES = {
    [HTTP_STATUS.UNAUTHORIZED]: API_MESSAGES.unauthorized,
    [HTTP_STATUS.FORBIDDEN]: API_MESSAGES.forbidden,
    [HTTP_STATUS.NOT_FOUND]: API_MESSAGES.notFound,
}

export const NETWORK_ERROR_STATUS = 0

export const DEFAULT_PAGE_SIZE = 10

// Formato das respostas que as telas consomem. Os mesmos esquemas validam o mock
// (src/services/mock) e o backend real (tests/contract), garantindo que os dois sejam intercambiáveis.

const TYPES = {
    number: (value) => typeof value === 'number' && Number.isFinite(value),
    string: (value) => typeof value === 'string',
    boolean: (value) => typeof value === 'boolean',
    any: () => true,
}

export const opt = (schema) => ({ __optional: schema })
export const oneOf = (...values) => ({ __oneOf: values })

const describe = (value) =>
    value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value

export const findShapeProblems = (value, schema, path = '$') => {
    if (schema?.__optional !== undefined) {
        return value === null || value === undefined
            ? []
            : findShapeProblems(value, schema.__optional, path)
    }
    if (schema?.__oneOf) {
        return schema.__oneOf.includes(value)
            ? []
            : [
                  `${path}: esperado um de ${schema.__oneOf.join(', ')}, veio ${JSON.stringify(value)}`,
              ]
    }
    if (typeof schema === 'string') {
        return TYPES[schema](value)
            ? []
            : [`${path}: esperado ${schema}, veio ${describe(value)} (${JSON.stringify(value)})`]
    }
    if (Array.isArray(schema)) {
        if (!Array.isArray(value)) return [`${path}: esperado array, veio ${describe(value)}`]
        return value.flatMap((entry, index) =>
            findShapeProblems(entry, schema[0], `${path}[${index}]`),
        )
    }
    if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        return [`${path}: esperado objeto, veio ${describe(value)}`]
    }
    return Object.entries(schema).flatMap(([key, child]) => {
        const isOptional = child?.__optional !== undefined
        if (!(key in value)) return isOptional ? [] : [`${path}.${key}: campo ausente`]
        return findShapeProblems(value[key], child, `${path}.${key}`)
    })
}

export const expectShape = (value, schema, label = 'resposta') => {
    const problems = findShapeProblems(value, schema)
    if (problems.length > 0)
        throw new Error(`${label} fora do contrato:\n  - ${problems.join('\n  - ')}`)
}

// ---- esquemas

export const pageOf = (row) => ({
    content: [row],
    page: 'number',
    size: 'number',
    totalElements: 'number',
    totalPages: 'number',
})

const ROLE = oneOf('OPERATOR', 'COORDINATOR')
const RECORD_STATUS = oneOf('ACTIVE', 'INACTIVE')
const UNIT = oneOf('UNIT', 'KG', 'L')
const REQUEST_STATUS = oneOf('PENDING', 'APPROVED', 'REJECTED', 'PICKED', 'DELIVERED', 'CANCELLED')

export const SHAPES = {
    session: {
        accessToken: 'string',
        tokenType: 'string',
        expiresIn: 'number',
        name: 'string',
        role: ROLE,
    },
    user: {
        id: 'number',
        name: 'string',
        email: 'string',
        role: ROLE,
        active: 'boolean',
        createdAt: 'string',
    },
    userOption: { id: 'number', name: 'string' },
    category: { id: 'number', name: 'string', description: opt('string'), active: 'boolean' },
    item: {
        id: 'number',
        categoryId: 'number',
        categoryName: 'string',
        name: 'string',
        unitOfMeasure: UNIT,
        minStock: opt('number'),
        status: RECORD_STATUS,
    },
    beneficiary: {
        id: 'number',
        responsibleName: 'string',
        phone: opt('string'),
        neighborhood: opt('string'),
        householdSize: 'number',
        notes: opt('string'),
        status: RECORD_STATUS,
        createdAt: 'string',
    },
    entrySummary: {
        id: 'number',
        entryDate: 'string',
        source: opt('string'),
        anonymous: 'boolean',
        registeredBy: 'string',
        createdAt: 'string',
        receivedItems: [{ itemId: 'number', itemName: 'string' }],
    },
    entry: {
        id: 'number',
        entryDate: 'string',
        source: opt('string'),
        anonymous: 'boolean',
        notes: opt('string'),
        registeredBy: 'string',
        createdAt: 'string',
        items: [
            {
                id: 'number',
                itemId: 'number',
                itemName: 'string',
                unitOfMeasure: UNIT,
                quantity: 'number',
                expiryDate: opt('string'),
            },
        ],
    },
    stockRow: {
        itemId: 'number',
        name: 'string',
        categoryId: 'number',
        categoryName: 'string',
        unitOfMeasure: UNIT,
        minStock: opt('number'),
        status: RECORD_STATUS,
        physical: 'number',
        reserved: 'number',
        available: 'number',
        level: oneOf('CRITICAL', 'LOW', 'NORMAL'),
    },
    movement: {
        id: 'number',
        type: oneOf('ENTRY', 'DELIVERY', 'ADJUSTMENT', 'REVERSAL', 'RESERVE', 'RELEASE'),
        occurredAt: 'string',
        itemId: 'number',
        itemName: 'string',
        unitOfMeasure: UNIT,
        quantity: 'number',
        userId: 'number',
        userName: 'string',
        adjustmentReason: opt('string'),
        reason: opt('string'),
        reversesId: opt('number'),
        reversedById: opt('number'),
        reference: { label: 'string', entryId: opt('number'), requestId: opt('number') },
    },
    requestRow: {
        id: 'number',
        status: REQUEST_STATUS,
        createdAt: 'string',
        beneficiaryId: 'number',
        beneficiaryName: 'string',
        requestedBy: 'string',
        itemCount: 'number',
    },
    requestAction: { id: 'number', status: REQUEST_STATUS },
    requestDetail: {
        id: 'number',
        status: REQUEST_STATUS,
        createdAt: 'string',
        beneficiaryId: 'number',
        beneficiaryName: 'string',
        requestedBy: 'string',
        beneficiary: {
            id: 'number',
            responsibleName: 'string',
            householdSize: 'number',
            neighborhood: opt('string'),
            phone: opt('string'),
            status: RECORD_STATUS,
        },
        items: [
            {
                id: 'number',
                itemId: 'number',
                itemName: 'string',
                unitOfMeasure: UNIT,
                requestedQty: 'number',
                approvedQty: opt('number'),
                available: 'number',
            },
        ],
        decidedBy: opt('string'),
        decidedAt: opt('string'),
        justification: opt('string'),
        pickedBy: opt('string'),
        pickedAt: opt('string'),
        cancelledBy: opt('string'),
        cancelledAt: opt('string'),
        cancellationReason: opt('string'),
    },
    delivery: {
        id: 'number',
        requestId: 'number',
        deliveredAt: 'string',
        deliveredBy: 'string',
        items: [{ id: 'number', itemName: 'string', unitOfMeasure: UNIT, quantity: 'number' }],
    },
    dashboard: {
        activeItems: 'number',
        activeCategories: 'number',
        criticalItems: 'number',
        entriesInPeriod: 'number',
        deliveriesInPeriod: 'number',
        pendingRequests: 'number',
        topCritical: [{ itemId: 'number', name: 'string', available: 'number', level: 'string' }],
        recentMovements: [
            {
                id: 'number',
                type: 'string',
                occurredAt: 'string',
                itemName: 'string',
                quantity: 'number',
                userName: 'string',
            },
        ],
        monthly: [{ month: 'string', entries: 'number', deliveries: 'number' }],
        balanceByCategory: [{ categoryId: 'number', categoryName: 'string', available: 'number' }],
        pendingList: [
            { id: 'number', createdAt: 'string', beneficiaryName: 'string', itemCount: 'number' },
        ],
        previous: { entries: 'number', deliveries: 'number' },
        generatedAt: 'string',
    },
}

SHAPES.movementDetail = {
    ...SHAPES.movement,
    original: opt(SHAPES.movement),
    reversal: opt(SHAPES.movement),
}
SHAPES.deliverySummary = { lastDelivery: opt(SHAPES.delivery), recentDeliveries: [SHAPES.delivery] }
SHAPES.familyHistory = {
    requests: [
        {
            id: 'number',
            status: REQUEST_STATUS,
            createdAt: 'string',
            requestedBy: 'string',
            itemCount: 'number',
        },
    ],
    deliveries: [SHAPES.delivery],
}
SHAPES.requestList = { ...pageOf(SHAPES.requestRow), counts: { ALL: 'number' } }

CREATE TABLE app_user (
    id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name          varchar(120) NOT NULL,
    email         varchar(160) NOT NULL UNIQUE,
    password_hash varchar(100) NOT NULL,
    role          varchar(11)  NOT NULL CHECK (role IN ('OPERATOR', 'COORDINATOR')),
    active        boolean      NOT NULL DEFAULT true,
    created_at    timestamp    NOT NULL DEFAULT now()
);

CREATE TABLE category (
    id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name        varchar(80) NOT NULL UNIQUE,
    description varchar(200),
    active      boolean     NOT NULL DEFAULT true
);

CREATE TABLE item (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_id     bigint        NOT NULL REFERENCES category (id) ON DELETE RESTRICT,
    name            varchar(120)  NOT NULL,
    unit_of_measure varchar(4)    NOT NULL CHECK (unit_of_measure IN ('UNIT', 'KG', 'L')),
    min_stock       numeric(12,3) NOT NULL DEFAULT 0 CHECK (min_stock >= 0),
    status          varchar(8)    NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    UNIQUE (category_id, name)
);

CREATE TABLE donation_entry (
    id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id    bigint       NOT NULL REFERENCES app_user (id) ON DELETE RESTRICT,
    entry_date date         NOT NULL,
    source     varchar(160),
    anonymous  boolean      NOT NULL DEFAULT false,
    notes      varchar(300),
    created_at timestamp    NOT NULL DEFAULT now()
);

CREATE TABLE donation_entry_item (
    id                bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    donation_entry_id bigint        NOT NULL REFERENCES donation_entry (id) ON DELETE RESTRICT,
    item_id           bigint        NOT NULL REFERENCES item (id) ON DELETE RESTRICT,
    quantity          numeric(12,3) NOT NULL CHECK (quantity > 0),
    expiry_date       date
);

CREATE TABLE beneficiary (
    id               bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    responsible_name varchar(120) NOT NULL,
    phone            varchar(20),
    neighborhood     varchar(80),
    household_size   int          NOT NULL CHECK (household_size >= 1),
    notes            varchar(300),
    status           varchar(8)   NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at       timestamp    NOT NULL DEFAULT now()
);

CREATE TABLE aid_request (
    id                  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    beneficiary_id      bigint       NOT NULL REFERENCES beneficiary (id) ON DELETE RESTRICT,
    requested_by_id     bigint       NOT NULL REFERENCES app_user (id) ON DELETE RESTRICT,
    decided_by_id       bigint       REFERENCES app_user (id) ON DELETE RESTRICT,
    status              varchar(9)   NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'PICKED', 'DELIVERED', 'CANCELLED')),
    created_at          timestamp    NOT NULL DEFAULT now(),
    decided_at          timestamp,
    justification       varchar(300),
    picked_at           timestamp,
    picked_by_id        bigint       REFERENCES app_user (id) ON DELETE RESTRICT,
    cancelled_at        timestamp,
    cancelled_by_id     bigint       REFERENCES app_user (id) ON DELETE RESTRICT,
    cancellation_reason varchar(300),
    CHECK (status <> 'CANCELLED' OR (cancellation_reason IS NOT NULL AND cancelled_at IS NOT NULL)),
    CHECK (status <> 'REJECTED' OR justification IS NOT NULL)
);

CREATE TABLE aid_request_item (
    id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    aid_request_id bigint        NOT NULL REFERENCES aid_request (id) ON DELETE RESTRICT,
    item_id        bigint        NOT NULL REFERENCES item (id) ON DELETE RESTRICT,
    requested_qty  numeric(12,3) NOT NULL CHECK (requested_qty > 0),
    approved_qty   numeric(12,3),
    CHECK (approved_qty >= 0 AND approved_qty <= requested_qty)
);

CREATE TABLE delivery (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    aid_request_id  bigint       NOT NULL UNIQUE REFERENCES aid_request (id) ON DELETE RESTRICT,
    delivered_by_id bigint       NOT NULL REFERENCES app_user (id) ON DELETE RESTRICT,
    delivered_at    timestamp    NOT NULL DEFAULT now(),
    notes           varchar(300)
);

CREATE TABLE delivery_item (
    id                  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    delivery_id         bigint        NOT NULL REFERENCES delivery (id) ON DELETE RESTRICT,
    aid_request_item_id bigint        NOT NULL REFERENCES aid_request_item (id) ON DELETE RESTRICT,
    delivered_qty       numeric(12,3) NOT NULL CHECK (delivered_qty > 0)
);

CREATE TABLE stock_movement (
    id                     bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    item_id                bigint        NOT NULL REFERENCES item (id) ON DELETE RESTRICT,
    type                   varchar(10)   NOT NULL
        CHECK (type IN ('ENTRY', 'RESERVE', 'RELEASE', 'DELIVERY', 'ADJUSTMENT', 'REVERSAL')),
    quantity               numeric(12,3) NOT NULL CHECK (quantity > 0),
    user_id                bigint        NOT NULL REFERENCES app_user (id) ON DELETE RESTRICT,
    occurred_at            timestamp     NOT NULL DEFAULT now(),
    donation_entry_item_id bigint        REFERENCES donation_entry_item (id) ON DELETE RESTRICT,
    aid_request_item_id    bigint        REFERENCES aid_request_item (id) ON DELETE RESTRICT,
    delivery_item_id       bigint        REFERENCES delivery_item (id) ON DELETE RESTRICT,
    reverses_id            bigint        UNIQUE REFERENCES stock_movement (id) ON DELETE RESTRICT,
    adjustment_reason      varchar(10)   CHECK (adjustment_reason IN ('LOSS', 'DAMAGE', 'EXPIRATION', 'TRANSFER')),
    reason                 varchar(300),
    CHECK (type <> 'REVERSAL' OR (reverses_id IS NOT NULL AND reason IS NOT NULL)),
    CHECK (type <> 'ADJUSTMENT' OR adjustment_reason IS NOT NULL)
);

CREATE UNIQUE INDEX uq_stock_movement_entry_item
    ON stock_movement (donation_entry_item_id)
    WHERE type = 'ENTRY';

CREATE INDEX idx_stock_movement_item ON stock_movement (item_id, occurred_at);
CREATE INDEX idx_aid_request_beneficiary ON aid_request (beneficiary_id, status);
CREATE INDEX idx_aid_request_item_request ON aid_request_item (aid_request_id);
CREATE INDEX idx_donation_entry_item_entry ON donation_entry_item (donation_entry_id);

CREATE RULE stock_movement_no_update AS ON UPDATE TO stock_movement DO INSTEAD NOTHING;
CREATE RULE stock_movement_no_delete AS ON DELETE TO stock_movement DO INSTEAD NOTHING;

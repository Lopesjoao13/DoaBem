-- V2: dados de demonstração (dummies) para popular o banco.
-- Tema: banco de alimentos / doações. Todos os nomes, telefones e organizações são fictícios.
--
-- O saldo de estoque é sempre derivado de stock_movement (RN03), então cada entrada, reserva,
-- entrega, ajuste e estorno abaixo gera a movimentação correspondente, do mesmo jeito que o
-- AidRequestService e o MovementService fazem.
--
-- Só roda em banco vazio: se já existir categoria cadastrada, não faz nada (não mistura com dados reais).
-- As datas são relativas ao momento da migration, para o dashboard (últimos 30 dias) já vir preenchido.
-- Usuários de demonstração: senha "Doabem@123" (mesmos e-mails do DevDataInitializer, que então não duplica).

CREATE FUNCTION pg_temp.seed_ts(days_ago int, at_hour numeric)
    RETURNS timestamp LANGUAGE sql STABLE AS
$$ SELECT date_trunc('day', now())::timestamp - days_ago * interval '1 day' + at_hour * interval '1 hour' $$;

DO
$seed$
DECLARE
    v_hash  constant varchar := '$2a$10$A/TegKNMnbRpYSE.QKk5OOu6AEoTGxFFtv1ijy5UyL4fOFYYFv85K';
    v_coord bigint;
    v_op    bigint;
    v_op2   bigint;
    v_entry bigint;
    v_req   bigint;
    v_deliv bigint;
    v_adj   bigint;
    b_maria bigint;
    b_jose  bigint;
    b_ana   bigint;
    b_sandra bigint;
    b_roberto bigint;
BEGIN
    IF EXISTS (SELECT 1 FROM category) THEN
        RAISE NOTICE 'V2: banco já possui dados; seed de demonstração ignorado.';
        RETURN;
    END IF;

    -- ------------------------------------------------------------------ usuários
    INSERT INTO app_user (name, email, password_hash, role, active, created_at)
    VALUES ('Coordenador Demo', 'coordenador@doabem.local', v_hash, 'COORDINATOR', true, pg_temp.seed_ts(40, 9)),
           ('Operador Demo', 'operador@doabem.local', v_hash, 'OPERATOR', true, pg_temp.seed_ts(40, 9)),
           ('Juliana Martins', 'juliana.martins@doabem.local', v_hash, 'OPERATOR', true, pg_temp.seed_ts(35, 9)),
           ('Carlos Eduardo Prado', 'carlos.prado@doabem.local', v_hash, 'OPERATOR', false, pg_temp.seed_ts(38, 9))
    ON CONFLICT (email) DO NOTHING;

    SELECT id INTO v_coord FROM app_user WHERE email = 'coordenador@doabem.local';
    SELECT id INTO v_op    FROM app_user WHERE email = 'operador@doabem.local';
    SELECT id INTO v_op2   FROM app_user WHERE email = 'juliana.martins@doabem.local';

    -- ------------------------------------------------------------------ categorias e itens
    INSERT INTO category (name, description, active)
    VALUES ('Alimentos', 'Alimentos não perecíveis e itens da cesta básica', true),
           ('Higiene pessoal', 'Produtos de higiene e cuidado pessoal', true),
           ('Limpeza', 'Produtos de limpeza doméstica', true),
           ('Vestuário e cobertores', 'Roupas, agasalhos e cobertores', true),
           ('Brinquedos', 'Campanha de Natal ainda não iniciada', false);

    INSERT INTO item (category_id, name, unit_of_measure, min_stock, status)
    SELECT c.id, v.name, v.unit, v.min_stock, v.status
    FROM (VALUES ('Alimentos', 'Arroz tipo 1', 'KG', 30, 'ACTIVE'),
                 ('Alimentos', 'Feijão carioca', 'KG', 20, 'ACTIVE'),
                 ('Alimentos', 'Açúcar refinado', 'KG', 15, 'ACTIVE'),
                 ('Alimentos', 'Óleo de soja 900 ml', 'UNIT', 20, 'ACTIVE'),
                 ('Alimentos', 'Macarrão espaguete 500 g', 'UNIT', 30, 'ACTIVE'),
                 ('Alimentos', 'Leite integral UHT', 'L', 24, 'ACTIVE'),
                 ('Alimentos', 'Leite em pó 400 g (descontinuado)', 'UNIT', 0, 'INACTIVE'),
                 ('Higiene pessoal', 'Sabonete em barra', 'UNIT', 40, 'ACTIVE'),
                 ('Higiene pessoal', 'Creme dental 90 g', 'UNIT', 30, 'ACTIVE'),
                 ('Higiene pessoal', 'Papel higiênico (rolo)', 'UNIT', 60, 'ACTIVE'),
                 ('Higiene pessoal', 'Absorvente (pacote)', 'UNIT', 50, 'ACTIVE'),
                 ('Higiene pessoal', 'Fralda infantil M (pacote)', 'UNIT', 15, 'ACTIVE'),
                 ('Limpeza', 'Detergente líquido 500 ml', 'UNIT', 20, 'ACTIVE'),
                 ('Limpeza', 'Água sanitária', 'L', 10, 'ACTIVE'),
                 ('Limpeza', 'Sabão em pó', 'KG', 10, 'ACTIVE'),
                 ('Vestuário e cobertores', 'Cobertor casal', 'UNIT', 40, 'ACTIVE'),
                 ('Vestuário e cobertores', 'Agasalho infantil', 'UNIT', 15, 'ACTIVE'))
             AS v(category, name, unit, min_stock, status)
             JOIN category c ON c.name = v.category;

    -- ------------------------------------------------------------------ entradas de doação (+ movimentação ENTRY)
    INSERT INTO donation_entry (user_id, entry_date, source, anonymous, notes, created_at)
    VALUES (v_coord, pg_temp.seed_ts(28, 0)::date, 'Supermercado Bom Preço', false,
            'Campanha de arrecadação do mês', pg_temp.seed_ts(28, 10))
    RETURNING id INTO v_entry;
    INSERT INTO donation_entry_item (donation_entry_id, item_id, quantity, expiry_date)
    SELECT v_entry, i.id, v.qty, v.expiry
    FROM (VALUES ('Arroz tipo 1', 80, (current_date + 300)),
                 ('Feijão carioca', 50, (current_date + 240)),
                 ('Açúcar refinado', 30, (current_date + 360)),
                 ('Óleo de soja 900 ml', 60, (current_date + 180)),
                 ('Macarrão espaguete 500 g', 90, (current_date + 270))) AS v(name, qty, expiry)
             JOIN item i ON i.name = v.name;

    INSERT INTO donation_entry (user_id, entry_date, source, anonymous, notes, created_at)
    VALUES (v_op, pg_temp.seed_ts(21, 0)::date, 'Campanha da Paróquia São José', false,
            'Kits de higiene arrecadados na missa de domingo', pg_temp.seed_ts(21, 11))
    RETURNING id INTO v_entry;
    INSERT INTO donation_entry_item (donation_entry_id, item_id, quantity, expiry_date)
    SELECT v_entry, i.id, v.qty, NULL
    FROM (VALUES ('Sabonete em barra', 120),
                 ('Creme dental 90 g', 70),
                 ('Papel higiênico (rolo)', 150),
                 ('Absorvente (pacote)', 40),
                 ('Fralda infantil M (pacote)', 36)) AS v(name, qty)
             JOIN item i ON i.name = v.name;

    INSERT INTO donation_entry (user_id, entry_date, source, anonymous, notes, created_at)
    VALUES (v_op2, pg_temp.seed_ts(14, 0)::date, NULL, true,
            'Doador pediu para não ser identificado', pg_temp.seed_ts(14, 15))
    RETURNING id INTO v_entry;
    INSERT INTO donation_entry_item (donation_entry_id, item_id, quantity, expiry_date)
    SELECT v_entry, i.id, v.qty, v.expiry
    FROM (VALUES ('Cobertor casal', 30, NULL::date),
                 ('Agasalho infantil', 40, NULL::date),
                 ('Leite integral UHT', 48, (current_date + 120))) AS v(name, qty, expiry)
             JOIN item i ON i.name = v.name;

    INSERT INTO donation_entry (user_id, entry_date, source, anonymous, notes, created_at)
    VALUES (v_coord, pg_temp.seed_ts(8, 0)::date, 'Metalúrgica Norte (campanha dos colaboradores)', false,
            NULL, pg_temp.seed_ts(8, 9))
    RETURNING id INTO v_entry;
    INSERT INTO donation_entry_item (donation_entry_id, item_id, quantity, expiry_date)
    SELECT v_entry, i.id, v.qty, v.expiry
    FROM (VALUES ('Detergente líquido 500 ml', 60, NULL::date),
                 ('Água sanitária', 24, NULL::date),
                 ('Sabão em pó', 30, NULL::date),
                 ('Feijão carioca', 25, (current_date + 200)),
                 ('Arroz tipo 1', 40, (current_date + 280))) AS v(name, qty, expiry)
             JOIN item i ON i.name = v.name;

    INSERT INTO donation_entry (user_id, entry_date, source, anonymous, notes, created_at)
    VALUES (v_op, pg_temp.seed_ts(3, 0)::date, 'Vizinhos do bairro Itaum', false,
            'Entrega feita na sede pelos próprios moradores', pg_temp.seed_ts(3, 16))
    RETURNING id INTO v_entry;
    INSERT INTO donation_entry_item (donation_entry_id, item_id, quantity, expiry_date)
    SELECT v_entry, i.id, v.qty, NULL
    FROM (VALUES ('Papel higiênico (rolo)', 48),
                 ('Macarrão espaguete 500 g', 30),
                 ('Sabonete em barra', 36),
                 ('Açúcar refinado', 12.500)) AS v(name, qty)
             JOIN item i ON i.name = v.name;

    -- Uma ENTRY por item de entrada (RN03: o saldo vem das movimentações).
    INSERT INTO stock_movement (item_id, type, quantity, user_id, occurred_at, donation_entry_item_id)
    SELECT dei.item_id, 'ENTRY', dei.quantity, de.user_id, de.created_at, dei.id
    FROM donation_entry_item dei
             JOIN donation_entry de ON de.id = dei.donation_entry_id
    WHERE NOT EXISTS (SELECT 1 FROM stock_movement sm WHERE sm.donation_entry_item_id = dei.id);

    -- ------------------------------------------------------------------ famílias beneficiárias
    INSERT INTO beneficiary (responsible_name, phone, neighborhood, household_size, notes, status, created_at)
    VALUES ('Maria das Graças Oliveira', '(47) 99111-2201', 'Boa Vista', 5,
            'Duas crianças em idade escolar', 'ACTIVE', pg_temp.seed_ts(35, 14)),
           ('José Carlos Pereira', '(47) 99222-3302', 'Itaum', 3, NULL, 'ACTIVE', pg_temp.seed_ts(34, 14)),
           ('Ana Paula Schmitt', '(47) 99333-4403', 'Aventureiro', 4,
            'Bebê de 8 meses (precisa de fraldas)', 'ACTIVE', pg_temp.seed_ts(30, 10)),
           ('Sandra Regina Koch', '(47) 99444-5504', 'Jardim Paraíso', 6,
            'Avó cuidando de quatro netos', 'ACTIVE', pg_temp.seed_ts(30, 11)),
           ('Roberto Lima', '(47) 99555-6605', 'Floresta', 2, NULL, 'ACTIVE', pg_temp.seed_ts(25, 9)),
           ('Francisca Almeida', '(47) 99666-7706', 'Costa e Silva', 1,
            'Mudou-se para outra cidade', 'INACTIVE', pg_temp.seed_ts(33, 9));

    SELECT id INTO b_maria   FROM beneficiary WHERE responsible_name = 'Maria das Graças Oliveira';
    SELECT id INTO b_jose    FROM beneficiary WHERE responsible_name = 'José Carlos Pereira';
    SELECT id INTO b_ana     FROM beneficiary WHERE responsible_name = 'Ana Paula Schmitt';
    SELECT id INTO b_sandra  FROM beneficiary WHERE responsible_name = 'Sandra Regina Koch';
    SELECT id INTO b_roberto FROM beneficiary WHERE responsible_name = 'Roberto Lima';

    -- ------------------------------------------------------------------ solicitações (um exemplo de cada situação)

    -- R1 ENTREGUE (Maria): separada e entregue em 10 dias atrás
    INSERT INTO aid_request (beneficiary_id, requested_by_id, decided_by_id, status, created_at, decided_at, picked_at, picked_by_id)
    VALUES (b_maria, v_op, v_coord, 'DELIVERED', pg_temp.seed_ts(12, 10), pg_temp.seed_ts(11, 9),
            pg_temp.seed_ts(10, 9), v_op)
    RETURNING id INTO v_req;
    INSERT INTO aid_request_item (aid_request_id, item_id, requested_qty, approved_qty)
    SELECT v_req, i.id, v.requested, v.approved
    FROM (VALUES ('Arroz tipo 1', 10, 10), ('Feijão carioca', 5, 5), ('Óleo de soja 900 ml', 2, 2),
                 ('Macarrão espaguete 500 g', 4, 4), ('Açúcar refinado', 2, 2)) AS v(name, requested, approved)
             JOIN item i ON i.name = v.name;
    INSERT INTO stock_movement (item_id, type, quantity, user_id, occurred_at, aid_request_item_id)
    SELECT ari.item_id, 'RESERVE', ari.approved_qty, v_op, pg_temp.seed_ts(10, 9), ari.id
    FROM aid_request_item ari WHERE ari.aid_request_id = v_req;
    INSERT INTO delivery (aid_request_id, delivered_by_id, delivered_at, notes)
    VALUES (v_req, v_op, pg_temp.seed_ts(10, 14), 'Retirada pela própria responsável')
    RETURNING id INTO v_deliv;
    INSERT INTO delivery_item (delivery_id, aid_request_item_id, delivered_qty)
    SELECT v_deliv, ari.id, ari.approved_qty FROM aid_request_item ari WHERE ari.aid_request_id = v_req;
    INSERT INTO stock_movement (item_id, type, quantity, user_id, occurred_at, aid_request_item_id, delivery_item_id)
    SELECT ari.item_id, t.type, di.delivered_qty, v_op, pg_temp.seed_ts(10, 14), ari.id, di.id
    FROM delivery_item di
             JOIN aid_request_item ari ON ari.id = di.aid_request_item_id
             CROSS JOIN (VALUES ('DELIVERY'), ('RELEASE')) AS t(type)
    WHERE di.delivery_id = v_deliv;

    -- R2 ENTREGUE (Sandra): aprovação parcial de fraldas (pediu 4, aprovado 3)
    INSERT INTO aid_request (beneficiary_id, requested_by_id, decided_by_id, status, created_at, decided_at, picked_at, picked_by_id)
    VALUES (b_sandra, v_op2, v_coord, 'DELIVERED', pg_temp.seed_ts(9, 10), pg_temp.seed_ts(8, 9),
            pg_temp.seed_ts(7, 10), v_op2)
    RETURNING id INTO v_req;
    INSERT INTO aid_request_item (aid_request_id, item_id, requested_qty, approved_qty)
    SELECT v_req, i.id, v.requested, v.approved
    FROM (VALUES ('Sabonete em barra', 8, 8), ('Creme dental 90 g', 4, 4), ('Papel higiênico (rolo)', 12, 12),
                 ('Fralda infantil M (pacote)', 4, 3), ('Absorvente (pacote)', 2, 2)) AS v(name, requested, approved)
             JOIN item i ON i.name = v.name;
    INSERT INTO stock_movement (item_id, type, quantity, user_id, occurred_at, aid_request_item_id)
    SELECT ari.item_id, 'RESERVE', ari.approved_qty, v_op2, pg_temp.seed_ts(7, 10), ari.id
    FROM aid_request_item ari WHERE ari.aid_request_id = v_req;
    INSERT INTO delivery (aid_request_id, delivered_by_id, delivered_at, notes)
    VALUES (v_req, v_op2, pg_temp.seed_ts(6, 15), 'Retirada pelo filho da responsável')
    RETURNING id INTO v_deliv;
    INSERT INTO delivery_item (delivery_id, aid_request_item_id, delivered_qty)
    SELECT v_deliv, ari.id, ari.approved_qty FROM aid_request_item ari WHERE ari.aid_request_id = v_req;
    INSERT INTO stock_movement (item_id, type, quantity, user_id, occurred_at, aid_request_item_id, delivery_item_id)
    SELECT ari.item_id, t.type, di.delivered_qty, v_op2, pg_temp.seed_ts(6, 15), ari.id, di.id
    FROM delivery_item di
             JOIN aid_request_item ari ON ari.id = di.aid_request_item_id
             CROSS JOIN (VALUES ('DELIVERY'), ('RELEASE')) AS t(type)
    WHERE di.delivery_id = v_deliv;

    -- R3 SEPARADA (José): reserva ativa aguardando retirada
    INSERT INTO aid_request (beneficiary_id, requested_by_id, decided_by_id, status, created_at, decided_at, picked_at, picked_by_id)
    VALUES (b_jose, v_op, v_coord, 'PICKED', pg_temp.seed_ts(3, 10), pg_temp.seed_ts(2, 9),
            pg_temp.seed_ts(1, 10), v_op)
    RETURNING id INTO v_req;
    INSERT INTO aid_request_item (aid_request_id, item_id, requested_qty, approved_qty)
    SELECT v_req, i.id, v.requested, v.approved
    FROM (VALUES ('Arroz tipo 1', 5, 5), ('Feijão carioca', 3, 3), ('Macarrão espaguete 500 g', 2, 2),
                 ('Detergente líquido 500 ml', 2, 2)) AS v(name, requested, approved)
             JOIN item i ON i.name = v.name;
    INSERT INTO stock_movement (item_id, type, quantity, user_id, occurred_at, aid_request_item_id)
    SELECT ari.item_id, 'RESERVE', ari.approved_qty, v_op, pg_temp.seed_ts(1, 10), ari.id
    FROM aid_request_item ari WHERE ari.aid_request_id = v_req;

    -- R4 APROVADA (Ana): ainda sem reserva (a reserva só nasce na separação); agasalhos aprovados parcialmente
    INSERT INTO aid_request (beneficiary_id, requested_by_id, decided_by_id, status, created_at, decided_at)
    VALUES (b_ana, v_op2, v_coord, 'APPROVED', pg_temp.seed_ts(2, 11), pg_temp.seed_ts(1, 9))
    RETURNING id INTO v_req;
    INSERT INTO aid_request_item (aid_request_id, item_id, requested_qty, approved_qty)
    SELECT v_req, i.id, v.requested, v.approved
    FROM (VALUES ('Cobertor casal', 2, 2), ('Agasalho infantil', 4, 3), ('Leite integral UHT', 6, 6)) AS v(name, requested, approved)
             JOIN item i ON i.name = v.name;

    -- R5 PENDENTE (Roberto)
    INSERT INTO aid_request (beneficiary_id, requested_by_id, status, created_at)
    VALUES (b_roberto, v_op, 'PENDING', pg_temp.seed_ts(1, 14))
    RETURNING id INTO v_req;
    INSERT INTO aid_request_item (aid_request_id, item_id, requested_qty)
    SELECT v_req, i.id, v.requested
    FROM (VALUES ('Arroz tipo 1', 4), ('Feijão carioca', 2), ('Sabão em pó', 1)) AS v(name, requested)
             JOIN item i ON i.name = v.name;

    -- R6 PENDENTE (Sandra): quantidade fracionada em KG
    INSERT INTO aid_request (beneficiary_id, requested_by_id, status, created_at)
    VALUES (b_sandra, v_op2, 'PENDING', now()::timestamp - interval '2 hours')
    RETURNING id INTO v_req;
    INSERT INTO aid_request_item (aid_request_id, item_id, requested_qty)
    SELECT v_req, i.id, v.requested
    FROM (VALUES ('Fralda infantil M (pacote)', 2), ('Papel higiênico (rolo)', 6), ('Açúcar refinado', 1.500)) AS v(name, requested)
             JOIN item i ON i.name = v.name;

    -- R7 RECUSADA (Sandra): justificativa obrigatória
    INSERT INTO aid_request (beneficiary_id, requested_by_id, decided_by_id, status, created_at, decided_at, justification)
    VALUES (b_sandra, v_op, v_coord, 'REJECTED', pg_temp.seed_ts(20, 10), pg_temp.seed_ts(19, 9),
            'Composição familiar não confirmada; reapresentar a documentação na sede.')
    RETURNING id INTO v_req;
    INSERT INTO aid_request_item (aid_request_id, item_id, requested_qty)
    SELECT v_req, i.id, v.requested
    FROM (VALUES ('Óleo de soja 900 ml', 6), ('Arroz tipo 1', 20)) AS v(name, requested)
             JOIN item i ON i.name = v.name;

    -- R8 CANCELADA depois de separada (Ana): reserva criada e depois liberada
    INSERT INTO aid_request (beneficiary_id, requested_by_id, decided_by_id, status, created_at, decided_at,
                             picked_at, picked_by_id, cancelled_at, cancelled_by_id, cancellation_reason)
    VALUES (b_ana, v_op, v_coord, 'CANCELLED', pg_temp.seed_ts(7, 10), pg_temp.seed_ts(6, 9),
            pg_temp.seed_ts(5, 9), v_op, pg_temp.seed_ts(4, 16), v_coord,
            'Família desistiu da retirada: conseguiu os itens por outra entidade.')
    RETURNING id INTO v_req;
    INSERT INTO aid_request_item (aid_request_id, item_id, requested_qty, approved_qty)
    SELECT v_req, i.id, v.requested, v.approved
    FROM (VALUES ('Água sanitária', 2, 2), ('Sabão em pó', 2, 2), ('Detergente líquido 500 ml', 3, 3)) AS v(name, requested, approved)
             JOIN item i ON i.name = v.name;
    INSERT INTO stock_movement (item_id, type, quantity, user_id, occurred_at, aid_request_item_id)
    SELECT ari.item_id, t.type, ari.approved_qty, t.user_id, t.at, ari.id
    FROM aid_request_item ari
             CROSS JOIN (VALUES ('RESERVE', v_op, pg_temp.seed_ts(5, 9)),
                                ('RELEASE', v_coord, pg_temp.seed_ts(4, 16))) AS t(type, user_id, at)
    WHERE ari.aid_request_id = v_req;

    -- R9 CANCELADA ainda pendente (José): duplicada, sem movimentação de estoque
    INSERT INTO aid_request (beneficiary_id, requested_by_id, status, created_at, cancelled_at, cancelled_by_id, cancellation_reason)
    VALUES (b_jose, v_op2, 'CANCELLED', pg_temp.seed_ts(5, 10), pg_temp.seed_ts(5, 11), v_coord,
            'Solicitação duplicada: já havia um pedido em andamento para a família.')
    RETURNING id INTO v_req;
    INSERT INTO aid_request_item (aid_request_id, item_id, requested_qty)
    SELECT v_req, i.id, v.requested
    FROM (VALUES ('Macarrão espaguete 500 g', 3)) AS v(name, requested)
             JOIN item i ON i.name = v.name;

    -- ------------------------------------------------------------------ ajustes e estorno
    INSERT INTO stock_movement (item_id, type, quantity, user_id, occurred_at, adjustment_reason, reason)
    SELECT i.id, 'ADJUSTMENT', 3, v_op2, pg_temp.seed_ts(5, 13), 'DAMAGE', 'Caixas amassadas e vazando, descartadas'
    FROM item i WHERE i.name = 'Leite integral UHT';

    INSERT INTO stock_movement (item_id, type, quantity, user_id, occurred_at, adjustment_reason, reason)
    SELECT i.id, 'ADJUSTMENT', 4, v_op, pg_temp.seed_ts(6, 13), 'EXPIRATION', 'Pacotes com validade vencida na conferência'
    FROM item i WHERE i.name = 'Macarrão espaguete 500 g';

    -- Ajuste lançado por engano e estornado pelo Coordenador (o estorno devolve o saldo).
    INSERT INTO stock_movement (item_id, type, quantity, user_id, occurred_at, adjustment_reason, reason)
    SELECT i.id, 'ADJUSTMENT', 10, v_op, pg_temp.seed_ts(4, 10), 'TRANSFER', 'Transferência para outra entidade'
    FROM item i WHERE i.name = 'Sabonete em barra'
    RETURNING id INTO v_adj;
    INSERT INTO stock_movement (item_id, type, quantity, user_id, occurred_at, reverses_id, reason)
    SELECT sm.item_id, 'REVERSAL', sm.quantity, v_coord, pg_temp.seed_ts(4, 11), sm.id,
           'Transferência cancelada; os sabonetes continuaram no estoque.'
    FROM stock_movement sm WHERE sm.id = v_adj;
END
$seed$;

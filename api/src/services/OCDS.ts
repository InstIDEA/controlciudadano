import pg from 'pg';
import {ApiError} from '../index';


const QUERY_ITEMS = `
    SELECT ts.tender_title                               as llamado_nombre,
            ts.tender_id                                 as llamado_slug,
            ts.tender_procurementmethod                  as procurement_method,
            ts.ocid                                      as llamado_numero,
            ai.unit_price                                as precio_unitario,
            ai.quantity                                  as cantidad,
            ai.unit_name                                 as unidad_medida,
            ai.attributes                                as atributos,
            ai.description                               as item_adjudicado,
            ai.classification_id                         as item_classification_nivel_5_id,
            ai.classification_description                as item_classification_nivel_5_nombre,
            ai.item_id                                   as item_id,
            s.supplier_name                              as supplier_name,
            s.supplier_id                                as supplier_ruc
    FROM ocds.award_items ai
            join ocds.award s on ai.ocid = s.ocid and ai.award_id = s.award_id
            join ocds.procurement ts on ts.ocid = s.ocid
    WHERE ts.characteristics ? 'covid_19'
    LIMIT $1 OFFSET $2
    ;
`

const QUERY_SUPPLIERS = `
    SELECT name,
           ruc,
           telephone,
           contact_point,
           pais         as country,
           departamento as department,
           ciudad       as city,
           direccion    as address
    FROM ocds.unique_suppliers
    LIMIT $1 OFFSET $2
    ;
`

const QUERY_SUPPLIER = `
    SELECT name,
        ruc,
        telephone,
        contact_point,
        pais         as country,
        departamento as department,
        ciudad       as city,
        direccion    as address
    FROM ocds.unique_suppliers
    WHERE ruc = $1
    ;
`

const QUERY_CONTRACTS_PER_SUPPLIER = `
    select t.tender_id                          as tender_slug,
            t.tender_title                      as tender_title,
            c.ocid                              as contract_ocid,
            c.contract_id                       as contract_id,
            c.award_id                          as contract_award_id,
            s.supplier_name                     as name,
            s.supplier_id                       as ruc,
            c.amount                            as amount,
            c.currency                          as currency,
            c.date_signed                       as sign_date,
            t.tender_procurementmethod          as procurement_method,
            t.characteristics ? 'covid_19'      as is_covid
    from ocds.award s
            join ocds.contract c on c.ocid = s.ocid and c.award_id = s.award_id
            join ocds.procurement t on t.ocid = s.ocid
    where s.supplier_id ilike $1
    ORDER BY c.date_signed DESC
    LIMIT $2 OFFSET $3
    ;
`

const QUERY_SINGLE_ITEM = `
    select distinct sum(ai.unit_price * ai.quantity)            as total_amount,
        sum(ai.quantity)                                        as quantity,
        avg(ai.unit_price)                                      as avg_amount,
        max(ai.unit_price)                                      as max_amount,
        min(ai.unit_price)                                      as min_amount,
        count(ai.ocid)                                          as count,
        sum(ts.tender_numberoftenderers::int)                   as total_tenders,
        avg(ts.tender_numberoftenderers::int)                   as avg_tenders,
        jsonb_agg(jsonb_build_object(
                'id', ts.ocid,
                'title', ts.tender_title,
                'slug', ts.tender_id,
                'method', ts.tender_procurementmethod,
                'method_description', ts.tender_procurementmethoddetails,
                'flags', ts.characteristics,
                'date', ts.tender_date_published,
                'local_name', ai.description,
                'tenders', ts.tender_numberoftenderers,
                'currency', ai.unit_price_currency,
                'total', ai.unit_price * ai.quantity,
                'quantity', ai.quantity,
                'amount', ai.unit_price,
                'status', ts.tender_status,
                'sign_date', c.date_signed,
                'process_duration',
                (CASE
                    WHEN c.date_signed IS NULL
                        THEN NULL
                    ELSE EXTRACT(EPOCH FROM
                                c.date_signed - (ts.tender_date_published)::timestamp)
                    END),
                'supplier', jsonb_build_object(
        'name', a.supplier_name,
        'id', a.supplier_id
        )
            ))                                                  as tenders,
        ai.unit_price_currency                                  as currency,
        ai.unit_name                                            as unit,
        ai.attributes -> 1 ->> 'value'                          as presentation,
        ai.classification_id                                    as id,
        ai.classification_description                           as name
    from ocds.award_items ai
        join ocds.award a on a.ocid = ai.ocid and a.award_id = ai.award_id
        join ocds.contract c on c.ocid = a.ocid and c.award_id = a.award_id
        join ocds.procurement ts on ts.data_id = ai.data_id
    where a.status = 'active'
    and ai.classification_id = $1
    group by ai.classification_id, name, presentation, unit, ai.unit_price_currency
    order by total_amount desc;
`

const QUERY_ITEM_PRICE_EVOLUTION = `
    select a.ocid                                   as ocid,
           t.tender_date_published                  as date,
           ai.classification_id                     as id,
           ai.classification_description as name,
           adjusted_and_in_gs(
                   ai.unit_price,
                   ai.unit_price_currency,
                   t.tender_date_published
               )                                    as price,
           ai.quantity                              as quantity,
           t.characteristics                        as flags,
           ai.attributes                            as atributos,
           ai.attributes-> 1 ->> 'value'            as presentation,
           ai.unit_name                             as unit
    from ocds.award_items ai
             join ocds.procurement t on ai.ocid = t.ocid
             join ocds.award a on a.ocid = ai.ocid and a.award_id = ai.award_id
    where ai.classification_id = $1
`


const QUERY_ITEM_RELATED_PARTIES = `
    select DISTINCT ts.tender_id                  AS slug,
                    ts.tender_title               AS tender_title,
                    ts.tender_procurementmethod   AS tender_method,
                    ts.characteristics            AS tender_flags,
                    ts.tender_date_published      AS tender_date_published,
                    ps.roles                      AS roles,
                    ps.party_id                   AS party_id,
                    ps.name                       AS party_name
    FROM ocds.award_items ai
             JOIN ocds.procurement ts ON ts.ocid = ai.ocid
             JOIN ocds.parties ps ON ps.ocid = ts.ocid
    WHERE ai.classification_id = $1
`

const QUERY_SUPPLIERS_BY_BUYER = `
    SELECT DISTINCT b.ocid,
                    aa.supplier_id                  AS supplier_id,
                    aa.supplier_name                AS supplier,
                    b.tender_title                  as tender_title,
                    b.tender_id                     as tender_slug,
                    b.tender_procurementmethod      as procurement_method,
                    aa.currency                     AS currency,
--                     adjusted_and_in_gs(aa.award_value_amount, aa.award_value_currency, aa.award_date) AS amount,
                    aa.amount                       as awarded,
                    b.tender_amount                 as referential,
                    case
                        when b.tender_amount > 0 then
                            (aa.amount / b.tender_amount - 1) * 100
                        else 0 end                  as percentage,
                    aa.date                         AS date,
                    b.characteristics ? 'covid_19'  AS is_covid
    FROM ocds.procurement b
             JOIN ocds.award aa on aa.ocid = b.ocid
    WHERE b.buyer_id = $1
      AND aa.date IS NOT NULL
    ORDER BY aa.date desc
`

const QUERY_GET_BUYER_INFO = `
    SELECT  b.buyer_id          as id,
            b.buyer_name        as name
        FROM ocds.procurement b
        WHERE b.buyer_id = $1
    LIMIT 1
`

export class OCDSService {

    constructor(private db: pg.Pool) {
    }


    async getPaginatedList(page?: number, size?: number) {

        const pagination = OCDSService.calcOffsetLimit(page, size);
        const data = await this.db.query(QUERY_ITEMS, [pagination.limit, pagination.offset])

        return {
            page: pagination.page,
            size: pagination.size,
            data: data.rows,
            count: 1000 //TODO fix this
        }
    }

    async getSuppliers(
        page = 1,
        size = 5
    ) {

        const pagination = OCDSService.calcOffsetLimit(page, size);
        const data = await this.db.query(QUERY_SUPPLIERS, [pagination.limit, pagination.offset])

        return {
            page: pagination.page,
            size: pagination.size,
            data: data.rows,
            count: 21000 // fix this
        }
    }

    async getSupplierContracts(page: number, size: number, supplier: string) {

        const pagination = OCDSService.calcOffsetLimit(page, size);
        const data = await this.db.query(QUERY_CONTRACTS_PER_SUPPLIER, [
            `%${supplier}`,
            pagination.limit,
            pagination.offset
        ])

        return {
            page: pagination.page,
            size: pagination.size,
            data: data.rows,
            count: 1000 // fix this
        }
    }

    async getSupplierInfo(supplier: string) {

        const result = await this.db.query(QUERY_SUPPLIER, [
            supplier.replace("PY-RUC-", "")
        ]);
        if (result.rows.length < 1) throw new ApiError('supplier.not.found', 404, {supplier})
        if (result.rows.length > 1) console.warn(`Multiple suppliers for ruc ${supplier}`)
        return {
            data: result.rows[0]
        };
    }

    async getItemInfo(itemId: string) {

        const result = await this.db.query(QUERY_SINGLE_ITEM, [itemId]);
        if (result.rows.length < 1) throw new ApiError('item.not.found', 404, {itemId})

        return {
            data: result.rows
        };
    }

    async getItemPriceEvolution(itemId: string) {

        const result = await this.db.query(QUERY_ITEM_PRICE_EVOLUTION, [itemId]);

        return {
            data: result.rows
        };
    }

    async getItemParties(itemId: string) {

        const result = await this.db.query(QUERY_ITEM_RELATED_PARTIES, [itemId]);

        return {
            data: result.rows
        };
    }

    async getBuyerInfo(buyerId: string) {

        const result = await this.db.query(QUERY_GET_BUYER_INFO, [buyerId]);

        return {
            data: result.rows.length > 0 ? result.rows[0] : {},
            buyerId: buyerId
        };
    }

    async getSuppliersByBuyer(buyerId: string) {

        const result = await this.db.query(QUERY_SUPPLIERS_BY_BUYER, [buyerId]);

        return {
            data: result.rows,
            buyerId: buyerId
        };
    }

    private static calcOffsetLimit(page?: number, size?: number) {

        if (!page || page < 1) page = 1;
        if (!size || size > 100) size = 5;

        const limit = size;
        const offset = (page - 1) * size;

        return {limit, offset, page, size}
    }

}



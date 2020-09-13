import pg from 'pg';
import {ApiError} from '../index';


const QUERY_ITEMS = `
    SELECT ts.tender_title                               as llamado_nombre,
           ts.tender_id                                  as llamado_slug,
           ts.tender_procurementmethod                   as procurement_method,
           ts.ocid                                       as llamado_numero,
           ai.unit_amount                                as precio_unitario,
           ai.quantity                                   as cantidad,
           ai.item -> 'unit' ->> 'name'                  as unidad_medida,
           ai.item -> 'attributes'                       as atributos,
           ai.item ->> 'description'                     as item_adjudicado,
           ai.item_classification                        as item_classification_nivel_5_id,
           ai.item -> 'classification' ->> 'description' as item_classification_nivel_5_nombre,
           ai.item_id                                    as item_id,
           s.supplier ->> 'name'                         as supplier_name,
           s.supplier ->> 'id'                           as supplier_ruc
    FROM view_data_dncp_data.award_items_summary ai
             join view_data_dncp_data.tender_summary_with_data ts on ts.data_id = ai.data_id
             left join view_data_dncp_data.award_suppliers_summary s
                       on s.award_index = ai.award_index and ts.data_id = s.data_id
    WHERE ts.tender -> 'coveredBy' ? 'covid_19'
    LIMIT $1 OFFSET $2
    ;
`

const QUERY_SUPPLIERS = `
    select name,
           ruc,
           telephone,
           contact_point,
           pais         as country,
           departamento as department,
           ciudad       as city,
           direccion    as address
    FROM view_data_dncp_data.unique_suppliers
    LIMIT $1 OFFSET $2
    ;
`
const QUERY_SUPPLIER = `
    select name,
           ruc,
           telephone,
           contact_point,
           pais         as country,
           departamento as department,
           ciudad       as city,
           direccion    as address
    FROM view_data_dncp_data.unique_suppliers
    WHERE ruc = $1
    ;
`

const QUERY_CONTRACTS_PER_SUPPLIER = `
    select t.tender_id                as tender_slug,
           t.tender_title             as tender_title,
           c.ocid                      as contract_ocid,
           c.contract_id               as contract_id,
           c.award_id                  as contract_award_id,
           s.supplier ->> 'name'       as name,
           s.supplier ->> 'id'         as ruc,
           c.contract_value_amount     as amount,
           c.contract_value_currency   as currency,
           c.datesigned                as sign_date,
           t.tender_procurementmethod as procurement_method,
           t.covid                    as is_covid
    from view_data_dncp_data.award_suppliers_summary s
             join view_data_dncp_data.awards_summary a on s.data_id = a.data_id and a.award_index = s.award_index
             join view_data_dncp_data.contracts_summary_no_data c on c.data_id = s.data_id and c.award_id = a.award_id
             join view_data_dncp_data.tender_summary t on t.data_id = s.data_id

    where s.supplier ->> 'id' ilike $1
    ORDER BY c.datesigned DESC
    LIMIT $2 OFFSET $3
    ;
`

const QUERY_SINGLE_ITEM = `
    select distinct sum(ai.unit_amount * ai.quantity)             as total_amount,
                    sum(ai.quantity)                              as quantity,
                    avg(ai.unit_amount)                           as avg_amount,
                    max(ai.unit_amount)                           as max_amount,
                    min(ai.unit_amount)                           as min_amount,
                    count(ai.ocid)                                as count,
                    sum(ts.tender_numberoftenderers)              as total_tenders,
                    avg(ts.tender_numberoftenderers)              as avg_tenders,
                    jsonb_agg(jsonb_build_object(
                            'id', ts.ocid,
                            'title', ts.tender_title,
                            'slug', ts.tender_id,
                            'method', ts.tender_procurementmethod,
                            'method_description', ts.tender ->> 'procurementMethodDetails',
                            'flags', ts.tender -> 'coveredBy',
                            'date', ts.tender ->> 'datePublished',
                            'local_name', ai.item ->> 'description',
                            'tenders', ts.tender_numberoftenderers,
                            'currency', ai.unit_currency,
                            'total', ai.unit_amount * ai.quantity,
                            'quantity', ai.quantity,
                            'amount', ai.unit_amount,
                            'status', ts.tender_status,
                            'sign_date', a.fecha_firma_contrato,
                            'process_duration',
                            (CASE
                                 WHEN a.fecha_firma_contrato IS NULL
                                     THEN NULL
                                 ELSE EXTRACT(EPOCH FROM
                                              a.fecha_firma_contrato - (ts.tender ->> 'datePublished')::timestamp)
                                END),
                            'supplier', s.supplier
                        ))                                        as tenders,
                    ai.unit_currency                              as currency,
                    ai.item -> 'unit' ->> 'name'                  as unit,
                    ai.item -> 'attributes' -> 1 ->> 'value'      as presentation,
                    ai.item_classification                        as id,
                    ai.item -> 'classification' ->> 'description' as name
    from view_data_dncp_data.award_items_summary ai
             join view_data_dncp_data.awards_summary_no_data a on a.ocid = ai.ocid and a.award_index = ai.award_index
             join view_data_dncp_data.tender_summary_with_data ts on ts.data_id = ai.data_id
             left join view_data_dncp_data.award_suppliers_summary s
                       on s.award_index = ai.award_index and ts.data_id = s.data_id

    where a.award_status = 'active'
      and ai.item_classification = $1

    group by ai.item_classification, name, presentation, unit, currency
    order by total_amount desc
`

const QUERY_ITEM_PRICE_EVOLUTION = `
    select a.ocid                                        as ocid,
           t.tender ->> 'datePublished'                  as date,
           ai.item_classification                        as id,
           ai.item -> 'classification' ->> 'description' as name,
           adjusted_and_in_gs(
                   ai.unit_amount,
                   ai.unit_currency,
                   (t.tender ->> 'datePublished')::timestamp
               )                                         as price,
           ai.quantity                                   as quantity,
           t.tender -> 'coveredBy'                       as flags,
           ai.item -> 'attributes'                       as atributos,
           ai.item -> 'attributes' -> 1 ->> 'value'      as presentation,
           ai.item -> 'unit' ->> 'name'                  as unit

    from view_data_dncp_data.award_items_summary ai
             join view_data_dncp_data.tender_summary_with_data t on ai.ocid = t.ocid
             join view_data_dncp_data.awards_summary_no_data a on a.ocid = ai.ocid and a.award_index = ai.award_index
    where ai.item_classification = $1
`


const QUERY_ITEM_RELATED_PARTIES = `
    select DISTINCT ts.tender_id                  AS slug,
                    ts.tender_title               AS tender_title,
                    ts.tender_procurementmethod   AS tender_method,
                    ts.tender -> 'coveredBy'      AS tender_flags,
                    ts.tender ->> 'datePublished' AS tender_date_published,
                    ps.roles                      AS roles,
                    ps.party ->> 'id'             AS party_id,
                    ps.party ->> 'name'           AS party_name
    FROM view_data_dncp_data.award_items_summary ai
             JOIN view_data_dncp_data.tender_summary_with_data ts ON ts.data_id = ai.data_id
             JOIN view_data_dncp_data.parties_summary ps ON ps.ocid = ts.ocid
    WHERE ai.item_classification = $1
`

const QUERY_SUPPLIERS_BY_BUYER = `
    SELECT DISTINCT b.ocid,
                    a.supplier ->> 'id'        AS supplier_id,
                    a.supplier ->> 'name'      AS supplier,

                    t.tender_title             as tender_title,
                    t.tender_id                as tender_slug,
                    t.tender_procurementmethod as procurement_method,

                    aa.award_value_currency    AS currency,
--                     adjusted_and_in_gs(aa.award_value_amount, aa.award_value_currency, aa.award_date) AS amount,

                    aa.award_value_amount      as awarded,
                    t.tender_value_amount      as referential,
                    case
                        when t.tender_value_amount > 0 then
                            (aa.award_value_amount / t.tender_value_amount - 1) * 100
                        else 0 end             as percentage,
                    aa.award_date              AS date,
                    t.covid                    AS is_covid
    FROM view_data_dncp_data.buyer_summary b
             JOIN view_data_dncp_data.awards_summary_no_data aa on aa.ocid = b.ocid
             JOIN view_data_dncp_data.tender_summary t ON t.ocid = b.ocid
             JOIN view_data_dncp_data.award_suppliers_summary a ON a.ocid = b.ocid
        AND a.award_index = aa.award_index
    WHERE b.buyer ->> 'id' = $1
      AND aa.award_date IS NOT NULL
    ORDER BY aa.award_date desc
`

const QUERY_GET_BUYER_INFO = `
    SELECT b.buyer ->> 'id'   as id,
           b.buyer ->> 'name' as name
    FROM view_data_dncp_data.buyer_summary b
    WHERE b.buyer ->> 'id' = $1
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



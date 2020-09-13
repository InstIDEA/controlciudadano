CREATE EXTENSION plpython3u;
CREATE EXTENSION jsonb_plpython3u;

select a.ocid                                        as ocid,
       t.tender ->> 'datePublished'                  as date,
       ai.item_classification                        as id,
       ai.item -> 'classification' ->> 'description' as name,
       ai.unit_amount                                as price,
       ai.unit_currency                              as currency,
       ai.quantity                                   as quantity,
       t.tender -> 'coveredBy'                       as flags,
       ai.item -> 'attributes'                       as atributos,
       ai.item -> 'attributes' -> 1 ->> 'value'      as presentation,
       ai.item -> 'unit' ->> 'name'                  as unit

from view_data_dncp_data.award_items_summary ai
         join view_data_dncp_data.tender_summary_with_data t on ai.ocid = t.ocid
         join view_data_dncp_data.awards_summary_no_data a on a.ocid = ai.ocid and a.award_index = ai.award_index
where ai.item_classification = 'catalogoNivel5DNCP-46182005-001'
  and a.ocid = 'ocds-03ad3f-192261-1';

CREATE OR REPLACE FUNCTION analysis.clean_currencies()
    RETURNS void
    LANGUAGE plpython3u
AS
$$

GD.pop('__INFLATION', None);
GD.pop('__EXCHANGE', None);
GD.pop('__INFLATION_LAST', None);



$$;

select analysis.clean_currencies();


CREATE OR REPLACE FUNCTION adjusted_and_in_gs(amount NUMERIC, currency text, month integer, year integer)
    RETURNS jsonb
    transform for type jsonb
    LANGUAGE plpython3u
AS
$$
PRECISION=4


if '__INFLATION' not in GD:
  plpy.notice('We dont have inflation')
  raw_inflation = plpy.execute("SELECT * FROM staging.bcp_inflation")
  inflation = {}
  for row in raw_inflation:
    key = str(row["year"]) + "-" + str(row["month"])
    inflation[key] = row["index"]
    GD['__INFLATION_LAST'] = row["index"]


  GD['__INFLATION'] = inflation
  plpy.notice('Inflation loaded', inflation)

if '__EXCHANGE' not in GD:
  plpy.notice('We dont have exchange data')

  raw_exchanges = plpy.execute("SELECT * FROM staging.bcp_reference_exchange")
  exchanges = {}
  for row in raw_exchanges:
    key = row["code"] + "-" + str(row["year"]) + "-" + str(row["month"])
    exchanges[key] = row["currency_gs"]

  GD['__EXCHANGE'] = exchanges
  plpy.notice('Exchanges loaded', exchanges)


inflation = GD['__INFLATION']
current_inflation = GD['__INFLATION_LAST'] / 100

if current_inflation is None:
  plpy.notice('No current inflation')
  current_inflation = 1

exchanges = GD['__EXCHANGE']

inflation_key = str(year) + "-" + str(month)
rate_key = currency + "-" + inflation_key
rate = None

if rate_key in exchanges:
  rate = exchanges[rate_key]

if currency == 'PYG':
  rate = 1

if rate is None:
  converted = None
else:
  converted = amount * rate

index = 1
if inflation_key in inflation:
  index = inflation[inflation_key] / 100

plpy.debug('Inflation', index, 'Current inflation', current_inflation, 'Rate', rate, 'Converted', converted)

if converted is None:
  converted = None
  inflated = None
else:
  inflated = round(converted * current_inflation / index, PRECISION)
  converted = round(converted, PRECISION)

return ({
  'in_gs': converted,
  'inflated': inflated,
  'original_currency': currency,
  'original_amount': amount
})


$$;

CREATE OR REPLACE FUNCTION adjusted_and_in_gs(amount NUMERIC, currency text, date timestamp)
    RETURNS jsonb
    language plpgsql
as
$$
declare
begin
    return adjusted_and_in_gs(
            amount,
            currency,
            EXTRACT(MONTH from date)::integer,
            EXTRACT(YEAR from date)::integer
        );
end;
$$

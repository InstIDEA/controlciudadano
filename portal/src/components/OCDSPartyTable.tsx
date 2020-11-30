import * as React from 'react';
import {OCDSItemRelatedParty} from '../Model';
import {Table, Tag, Tooltip} from 'antd';
import {Link} from 'react-router-dom';
import {PARTY_ROLES} from '../Constants';
import {getTenderLink} from '../pages/OCDSAwardItemsPage';
import {formatIsoDate, formatSortableDate} from '../formatters';

/**
 * Represents a table with OCDS parties
 * @see OCDSItemRelatedParty
 */
export function OCDSPartyTable(props: {
    parties: OCDSItemRelatedParty[],
    withXScroll: boolean
}) {

    return <Table<OCDSItemRelatedParty>
        rowKey={r => `${r.slug}${r.party_id}`}
        dataSource={props.parties}
        scroll={{
            x: props.withXScroll ? 400 : undefined
        }}
        columns={[{
            title: 'Llamado',
            dataIndex: 'title',
            render: (_, r) => <>
                <a href={getTenderLink(r.slug, r.tender_method)} target="__blank" rel="noopener noreferrer">
                    {r.tender_title}
                </a>
                <br/>
                {(r.tender_flags || []).sort().map(f => <Tag key={f}>{f}</Tag>)}
            </>,
            sorter: (a, b) => (a.tender_title || '').localeCompare(b.tender_title),
        }, {
            title: 'Fecha llamado',
            dataIndex: 'tender_date_published',
            defaultSortOrder: 'descend',
            render: (_, t) => formatIsoDate(t.tender_date_published),
            sorter: (a, b) => formatSortableDate(a.tender_date_published).localeCompare(formatSortableDate(b.tender_date_published)),
        }, {
            title: 'Nombre',
            dataIndex: 'party_name',
            render: (_, row) => {
                if (row.party_id.startsWith("PY-RUC")) {
                    return <Link to={`ocds/supplier/${row.party_id}`} target="__blank" rel="noopener noreferrer">
                        {row.party_name}
                        <br/>
                        <small>{row.party_id}</small>
                    </Link>
                }
                return <>
                    {row.party_name}
                    <br/>
                    <small>{row.party_id}</small>
                </>
            },
            sorter: (a, b) => (a.party_name || '').localeCompare(b.party_name),
        }, {
            title: 'role',
            dataIndex: 'roles',
            render: (_, t) => (t.roles || []).sort().map(f => <Role key={f} id={f}/>)
        }]}
    />
}

function Role({id}: { id: string }) {

    if (!PARTY_ROLES[id]) return <Tag>{id}</Tag>

    return <Tooltip title={PARTY_ROLES[id].description}>
        <Tag>
            {PARTY_ROLES[id].title}
        </Tag>
    </Tooltip>
}

export const RELATIONS_COLORS: { [k: string]: string } = {
    'OCDS_SAME_LEGAL_CONTACT': '#ff0000',
    'OCDS_SAME_ADDRESS': '#ffc700'
}

export const RELATIONS_NAMES: { [k: string]: string } = {
    'OCDS_SAME_LEGAL_CONTACT': 'Mismo contacto',
    'OCDS_SAME_ADDRESS': 'Misma dirección'
}

export const IMPORTANT_RELATIONS: { [k: string]: boolean } = {
    buyer: true,
    procuringEntity: false,
    supplier: true,
    tenderer: true,
    funder: false,
    enquirer: true,
    payer: false,
    payee: false,
    reviewBody: false,
    interestedParty: false,
    notifiedSupplier: true
}
/**
 * <a href="https://standard.open-contracting.org/latest/en/schema/codelists/#party-role">
 *     OFFICIAL DEFINITION
 * </a>
 * Plus some local roles
 */
/**
 * Buyer: Entidad Compradora -> entidad que compró el item
 Supplier: Proveedor Adjudicado -> proveedor que fue adjudicado con el item
 Tenderer: Oferente -> proveedor que realizó una oferta en el proceso de licitación
 Enquirer: Proveedor que realizó una consulta
 Notified Supplier: Proveedor invitado -> proveedor que fue invitado por la entidad compradora a participar del proceso de licitaci[on
 */

export const PARTY_ROLES: { [k: string]: { title: string, description: string, color: string } } = {
    buyer: {
        title: "Entidad compradora",
        description: "Entidad que compró el item",
        color: 'red'
    },
    procuringEntity: {
        title: "Procuring entity",
        description: "The entity managing the procurement. This can be different from the buyer who pays for, or uses, the items being procured.",
        color: 'red'
    },
    supplier: {
        title: "Proveedor Adjudicado",
        description: "Proveedor que fue adjudicado con el item",
        color: '#0088ff'
    },
    tenderer: {
        title: "Oferente ",
        description: "Proveedor que realizó una oferta en el proceso de licitación",
        color: '#c6c7c7'
    },
    funder: {
        title: "Funder",
        description: "The funder is an entity providing money or finance for this contracting process.",
        color: '#ff0000'
    },
    enquirer: {
        title: "Enquirer",
        description: "Proveedor que realizó una consulta",
        color: '#ffa200'
    },
    payer: {
        title: "Payer",
        description: "A party making a payment from a transaction.",
        color: '#ff0000'
    },
    payee: {
        title: "Payee",
        description: "A party in receipt of a payment from a transaction.",
        color: '#000dff'
    },
    reviewBody: {
        title: "Review body",
        description: "A party responsible for the review of this procurement process. This party often has a role in any challenges made to the contract award.",
        color: '#ffa200'
    },
    interestedParty: {
        title: "Interested party",
        description: "A party that has expressed an interest in the contracting process: for example, by purchasing tender documents or submitting clarification questions.",
        color: '#ffd500'
    },
    notifiedSupplier: {
        title: "Proveedor invitado",
        description: "Proveedor que fue invitado por la entidad compradora a participar del proceso de licitaci[on",
        color: '#ffd500'
    }
}

export const COLOR_ORANGE = 'rgba(205, 83, 52, 1)';
export const COLOR_BLUE = 'rgba(0, 52, 91, 1)';
export const COLOR_GREY = 'rgba(171, 171, 171, 1)';

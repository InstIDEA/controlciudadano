export function buildSFPUrl(cedula: string, year = "2020") {
    return `https://datos.sfp.gov.py/api/rest/funcionarios/data?draw=5&columns%5B0%5D%5Bdata%5D=anho&columns%5B0%5D%5Bname%5D=&columns%5B0%5D%5Bsearchable%5D=true&columns%5B0%5D%5Borderable%5D=true&columns%5B0%5D%5Bsearch%5D%5Bvalue%5D=${year}&columns%5B0%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B0%5D%5BextraData%5D=&columns%5B1%5D%5Bdata%5D=mes&columns%5B1%5D%5Bname%5D=&columns%5B1%5D%5Bsearchable%5D=true&columns%5B1%5D%5Borderable%5D=true&columns%5B1%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B1%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B1%5D%5BextraData%5D=&columns%5B2%5D%5Bdata%5D=nivel&columns%5B2%5D%5Bname%5D=&columns%5B2%5D%5Bsearchable%5D=true&columns%5B2%5D%5Borderable%5D=true&columns%5B2%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B2%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B2%5D%5BextraData%5D=&columns%5B3%5D%5Bdata%5D=descripcionNivel&columns%5B3%5D%5Bname%5D=&columns%5B3%5D%5Bsearchable%5D=true&columns%5B3%5D%5Borderable%5D=true&columns%5B3%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B3%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B3%5D%5BextraData%5D=nivel&columns%5B4%5D%5Bdata%5D=entidad&columns%5B4%5D%5Bname%5D=&columns%5B4%5D%5Bsearchable%5D=true&columns%5B4%5D%5Borderable%5D=true&columns%5B4%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B4%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B4%5D%5BextraData%5D=&columns%5B5%5D%5Bdata%5D=descripcionEntidad&columns%5B5%5D%5Bname%5D=&columns%5B5%5D%5Bsearchable%5D=true&columns%5B5%5D%5Borderable%5D=true&columns%5B5%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B5%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B5%5D%5BextraData%5D=entidad&columns%5B6%5D%5Bdata%5D=oee&columns%5B6%5D%5Bname%5D=&columns%5B6%5D%5Bsearchable%5D=true&columns%5B6%5D%5Borderable%5D=true&columns%5B6%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B6%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B6%5D%5BextraData%5D=&columns%5B7%5D%5Bdata%5D=descripcionOee&columns%5B7%5D%5Bname%5D=&columns%5B7%5D%5Bsearchable%5D=true&columns%5B7%5D%5Borderable%5D=true&columns%5B7%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B7%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B7%5D%5BextraData%5D=oee&columns%5B8%5D%5Bdata%5D=documento&columns%5B8%5D%5Bname%5D=&columns%5B8%5D%5Bsearchable%5D=true&columns%5B8%5D%5Borderable%5D=true&columns%5B8%5D%5Bsearch%5D%5Bvalue%5D=${cedula}&columns%5B8%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B8%5D%5BextraData%5D=&columns%5B9%5D%5Bdata%5D=nombres&columns%5B9%5D%5Bname%5D=&columns%5B9%5D%5Bsearchable%5D=true&columns%5B9%5D%5Borderable%5D=true&columns%5B9%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B9%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B9%5D%5BextraData%5D=&columns%5B10%5D%5Bdata%5D=apellidos&columns%5B10%5D%5Bname%5D=&columns%5B10%5D%5Bsearchable%5D=true&columns%5B10%5D%5Borderable%5D=true&columns%5B10%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B10%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B10%5D%5BextraData%5D=&columns%5B11%5D%5Bdata%5D=presupuestado&columns%5B11%5D%5Bname%5D=&columns%5B11%5D%5Bsearchable%5D=true&columns%5B11%5D%5Borderable%5D=true&columns%5B11%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B11%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B11%5D%5BextraData%5D=&columns%5B12%5D%5Bdata%5D=devengado&columns%5B12%5D%5Bname%5D=&columns%5B12%5D%5Bsearchable%5D=true&columns%5B12%5D%5Borderable%5D=true&columns%5B12%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B12%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B12%5D%5BextraData%5D=&columns%5B13%5D%5Bdata%5D=sexo&columns%5B13%5D%5Bname%5D=&columns%5B13%5D%5Bsearchable%5D=true&columns%5B13%5D%5Borderable%5D=true&columns%5B13%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B13%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B13%5D%5BextraData%5D=&columns%5B14%5D%5Bdata%5D=estado&columns%5B14%5D%5Bname%5D=&columns%5B14%5D%5Bsearchable%5D=true&columns%5B14%5D%5Borderable%5D=true&columns%5B14%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B14%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B14%5D%5BextraData%5D=&columns%5B15%5D%5Bdata%5D=anhoIngreso&columns%5B15%5D%5Bname%5D=&columns%5B15%5D%5Bsearchable%5D=true&columns%5B15%5D%5Borderable%5D=true&columns%5B15%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B15%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B15%5D%5BextraData%5D=&columns%5B16%5D%5Bdata%5D=discapacidad&columns%5B16%5D%5Bname%5D=&columns%5B16%5D%5Bsearchable%5D=true&columns%5B16%5D%5Borderable%5D=true&columns%5B16%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B16%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B16%5D%5BextraData%5D=&columns%5B17%5D%5Bdata%5D=tipoDiscapacidad&columns%5B17%5D%5Bname%5D=&columns%5B17%5D%5Bsearchable%5D=true&columns%5B17%5D%5Borderable%5D=true&columns%5B17%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B17%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B17%5D%5BextraData%5D=&columns%5B18%5D%5Bdata%5D=fechaNacimiento&columns%5B18%5D%5Bname%5D=&columns%5B18%5D%5Bsearchable%5D=true&columns%5B18%5D%5Borderable%5D=true&columns%5B18%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B18%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B18%5D%5BextraData%5D=&columns%5B19%5D%5Bdata%5D=cargaHoraria&columns%5B19%5D%5Bname%5D=&columns%5B19%5D%5Bsearchable%5D=true&columns%5B19%5D%5Borderable%5D=true&columns%5B19%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B19%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B19%5D%5BextraData%5D=&order%5B0%5D%5Bcolumn%5D=0&order%5B0%5D%5Bdir%5D=desc&order%5B1%5D%5Bcolumn%5D=1&order%5B1%5D%5Bdir%5D=desc&start=0&length=10&search%5Bvalue%5D=&search%5Bregex%5D=false`;
}

export function fetchSFPData(cedula: string, year = "2020"): Promise<SFPResponse> {
    return fetch(buildSFPUrl(cedula, year))
        .then(d => d.json());
}

export class SFPFetcher extends EventTarget {
    cancelled = false;

    fetchAllYears(document: string) {
        for (let i = 2020; i > 2018; i--) {
            fetchSFPData(document, `${i}`)
                .then(data => {
                    if (this.cancelled) return;
                    const event = new CustomEvent<SFPEventPayload>('sfp_new_data', {
                        detail: {type: 'new_data', data: data.data, year: i}
                    });
                    this.dispatchEvent(event);
                })
                .catch(err => {
                    if (this.cancelled) return;
                    this.dispatchEvent(new CustomEvent<SFPEventPayload>('sfp_new_data', {
                        detail: {type: 'error', year: i, error: err}
                    }))
                })
        }
    }

    addHandler(handler: (d: SFPEventPayload) => void) {
        this.addEventListener('sfp_new_data', e => handler((e as CustomEvent<SFPEventPayload>).detail));
    }

    cancel() {
        this.cancelled = true;
    }
}

export type SFPEventPayload = {
    type: 'new_data',
    data: SFPRow[],
    year: number
} | {
    type: 'error',
    error: unknown,
    year: number
}

export interface SFPRow {
    mes: number;
    nivel: number;
    entidad: number;
    oee: number;
    descripcionOee: string;
    anho: number;
    devengado: number;
    discapacidad: string;
    estado: string;
    funcion?: any;
    presupuestado: number;
    descripcionNivel: string;
    descripcionEntidad: string;
    fechaNacimiento: string;
    anhoIngreso: number;
    cargaHoraria: string;
    tipoDiscapacidad?: any;
    nombres: string;
    apellidos: string;
    documento: string;
    sexo: string;
}

export interface SFPResponse {
    data: SFPRow[];
    draw: number;
    recordsTotal: number;
    recordsFiltered: number;
}

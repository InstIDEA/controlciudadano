import fetch from "node-fetch";

export interface Vehiculo {
    tipo: string;
    marca: string;
    modelo: string;
    adquisicion: number;
    fabricacion: number;
    importe: number;
}

export interface Mueble {
    tipo: string;
    importe: number;
}

export interface Resumen {
    totalActivo: number;
    totalPasivo: number;
    patrimonioNeto: number;
}

export interface Data {
    fecha: Date;
    cedula: number;
    nombre: string;
    apellido: string;
    cargo: string;
    institucion: string;
    depositos?: any;
    deudores?: any;
    inmuebles?: any;
    vehiculos: Vehiculo[];
    actividadesAgropecuarias?: any;
    muebles: Mueble[];
    otrosActivos?: any;
    deudas?: any;
    ingresosMensual: number;
    ingresosAnual: number;
    egresosMensual: number;
    egresosAnual: number;
    activos: number;
    pasivos: number;
    patrimonioNeto: number;
    resumen: Resumen;
}

export interface ParserResult {
    message: string[];
    status: number;
    data: Data;
    raw: string[];
}


export async function fetchParsedDJBR(url: string): Promise<ParserResult> {

    // curl -X POST --data '{ "file": { "path": "https://data.controlciudadanopy.org/contraloria/declaraciones/775497_a76ff476d9d3a23716ac225e9a46e794.pdf" } }'  localhost:8080/parser/send
    const parsed = await fetch('http://data.controlciudadanopy.org:8081/parser/send', {
        method: 'POST',
        timeout: 5000,
        body: JSON.stringify({
            file: {
                path: url
            }
        })
    })

    if (parsed.status >= 200 && parsed.status <= 200) {
        return await parsed.json();
    }

    console.warn(parsed.status);
    throw new Error("Error parsing declaration: " + parsed.status);

}

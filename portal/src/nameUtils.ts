export function fixName(name: string) {

    return (name || "")
        .replace("G�E", "GÜE")
        .replace('ARGA�A', 'ARGAÑA')
        .replace('NU�EZ', 'NUÑEZ')
        .replace('CA�ETE', 'CAÑETE')
        .replace('IBA�EZ', 'IBAÑEZ')
        .replace('PE�A', 'PEÑA')
        .replace('MU�OZ', 'MUÑOZ')
        .replace('ACU�A', 'ACUÑA')
        .replace('FARI�A', 'FARIÑA')
        .replace('QUI�ONEZ', 'QUIÑONEZ');
}

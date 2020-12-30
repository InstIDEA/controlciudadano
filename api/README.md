# API

Estos servicios web se utilizan para realizar búsquedas en la base de datos y mostrar información dentro del portal.

## Instalación
### Requerimientos
1. npm 6+ o mayor 

### Instalación
Accede al directorio de la api:

```sh
cd api
```

Para instalar los paquetes y dependencias, ejecute:

```sh
npm install
```

### Configuración
Establezca las siguientes variables de entorno:
* PGUSER: usuario de la base de datos.
* PGHOST: host de la base de datos.
* PGPASSWORD: contraseña de acceso a la base de datos.
* PGDATABASE: la instancia de la base de datos.
* PGPORT: puerto de la base de datos (25432 por defecto).
* PORT: puerto del servicio (3001 por defecto).


### Levantar el servicio
Para iniciar el servicio, ejecute:

```sh
npm start
```

Alternativamente, para levantar el servicio y configurar las variables en un simple comando, puede ejecutar:
```sh
PGUSER=usuario PGHOST=host PGPASSWORD=pass PGDATABASE=db PGPORT=25432 PORT=3001 npm start
```

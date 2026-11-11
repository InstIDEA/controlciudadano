/**
 * Configuración de URLs del portal.
 *
 * Se leen de variables de entorno REACT_APP_* (Create React App las inyecta en
 * TIEMPO DE BUILD, no en runtime: si se cambian hay que volver a correr `yarn build`).
 * Si no están definidas se usan los valores de producción de controlcivico.org.
 */

/** API Express. Ej: https://api.controlcivico.org/api */
export const API_URL = process.env.REACT_APP_API_URL || 'https://api.controlcivico.org/api';

/** Archivos estáticos (paraguay.json, etc). Ej: https://data.controlcivico.org/cdn/ */
export const CDN_URL = process.env.REACT_APP_CDN_URL || 'https://data.controlcivico.org/cdn/';

/** API de Redash (query results). Ej: https://redash.controlcivico.org/api */
export const REDASH_API_URL = process.env.REACT_APP_REDASH_API_URL || 'https://redash.controlcivico.org/api';

/** Elasticsearch usado por ReactiveSearch. Ej: https://data.controlcivico.org/ */
export const ELASTIC_URL = process.env.REACT_APP_ELASTIC_URL || 'https://data.controlcivico.org/';

/** Nombre del sitio para los meta tags de OpenGraph. */
export const SITE_NAME = process.env.REACT_APP_SITE_NAME || 'controlcivico.org';

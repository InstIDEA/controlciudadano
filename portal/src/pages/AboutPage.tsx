import React from 'react';
import { Row, Col, Typography } from 'antd';
import './AboutPage.css';
import { Header } from '../components/layout/Header'
import Footer from '../components/layout/Footer';
import '../components/layout/Layout.css'
import { Link } from 'react-router-dom';

function AboutPage() {
  return (<>
    <Header tableMode={false} />
    <Row>
      <Col offset={1} xxl={22} xl={22} lg={22} md={22} sm={22} xs={22} style={{ textAlign: 'center' }}>
        <Typography.Title level={2} className="about-title">Acerca de</Typography.Title>
      </Col>

    </Row>
    <Row gutter={[8, 24]} className="about-paragraph" style={{ fontSize: '20px' }}>
      <Col span={12} offset={6}>
        <Typography.Paragraph style={{ textAlign: 'justify' }}>
        La plataforma de Control Ciudadano nace con el objetivo de poner a disposición de la ciudadanía un portal de datos abiertos
        para controlar los recursos públicos. Los datos que se encuentran disponibles en la actualidad son: las compras realizadas
        durante la pandemia de la COVID-19, las declaraciones juradas subidas a la fecha en la web de la Contraloría General de la República,
        datos sobre autoridades electas, relación con proveedores del Estado que cuenten con los mismos datos de contacto, las facturas de ANDE
        y ESSAP.
        La plataforma pretende contar con más datos que ayuden a ejercer el derecho de “contralores ciudadanos”, convirtiéndose en una
        herramienta colaborativa, apoyada por la comunidad de organizaciones y personas que deseen sumar sus esfuerzos a la sostenibilidad
        de un portal útil  – para promover el acceso a la información pública y contribuir al desarrollo de un país transparente, libre de
        corrupción e impunidad.
        </Typography.Paragraph>
      </Col>
    </Row>
    <Row>
      <Col offset={1} xxl={22} xl={22} lg={22} md={22} sm={22} xs={22} style={{ textAlign: 'center' }}>
        <Typography.Title level={2} className="about-title">¿Quiénes están involucrados en el proyecto?</Typography.Title>
      </Col>

    </Row>
    <Row>
      <Col offset={1} xxl={22} xl={22} lg={22} md={22} sm={22} xs={22} style={{ textAlign: 'center' }}>
        <Typography.Title level={2} className="about-title">Datos</Typography.Title>
      </Col>

    </Row>
    <Row gutter={[8, 24]} className="about-paragraph" style={{ fontSize: '20px' }}>
      <Col span={12} offset={6}>
        <Typography.Paragraph style={{ textAlign: 'justify' }}>
          Las fuentes de datos sobre las cuales se realizan los análisis en este sitio fueron descargados de los sitios oficiales del gobierno del
          Paraguay o mediante solicitudes de acceso a la información  pública.
          Todos los datos, con sus respectivas fuentes, y con una copia local para asegurar la sostenibilidad del sitio se encuentran en la página
          de Fuente de datos.
        </Typography.Paragraph>
      </Col>
    </Row>
    <Row>
      <Col offset={1} xxl={22} xl={22} lg={22} md={22} sm={22} xs={22} style={{ textAlign: 'center' }}>
        <Typography.Title level={2} className="about-title">Colaboración</Typography.Title>
      </Col>

    </Row>
    <Row gutter={[8, 24]} className="about-paragraph" style={{ fontSize: '20px' }}>
      <Col span={12} offset={6}>
        <Typography.Paragraph style={{ textAlign: 'justify' }}>
          El código fuente se encuentra públicamente disponible en el repositorio almacenado en <a href="https://github.com/InstIDEA/controlciudadano" target="__blank" rel="noopener noreferrer">Github</a>.
          Si desea realizar aportes con funcionalidades o reportar bugs, favor <a href="https://github.com/InstIDEA/controlciudadano/issues/new" target="__blank" rel="noopener noreferrer">crear incidencias </a>
          y <a href="https://github.com/InstIDEA/controlciudadano/issues/new" target="__blank" rel="noopener noreferrer">solicitudes de cambio </a> directamente al repositorio central.
          En este repositorio se almacena la información de:
          <ul>
            <li>Portal: Código fuente del portal web </li>
            <li>API: Servicios web utilizados para mostrar información dentro del portal</li>
            <li>ETL: Conjunto de ETL (programas para extracción transformación y carga) que nutren la base de datos del portal</li>
            <li>Infra: Conjunto de archivos que describen la infraestructura requerida para el portal, incluyendo servidores de base de datos, de archivos, de aplicación, etc.</li>
          </ul>
        </Typography.Paragraph>
      </Col>
    </Row>
    <Row>
      <Col offset={1} xxl={22} xl={22} lg={22} md={22} sm={22} xs={22} style={{ textAlign: 'center' }}>
        <Typography.Title level={2} className="about-title">Apoyo</Typography.Title>
      </Col>
    </Row>
    <Row gutter={[8, 24]} className="about-paragraph" style={{ fontSize: '20px' }}>
      <Col span={12} offset={6}>
        <Typography.Paragraph style={{ textAlign: 'justify' }}>
          El desarrollo inicial de este sitio web fue posible gracias al generoso apoyo del pueblo de los Estados Unidos de América a través de la Agencia
          de los Estados Unidos para el Desarrollo Internacional (USAID). El contenido de este sitio web es responsabilidad de sus autores y no refleja
          necesariamente las opiniones o posiciones de la Agencia de los Estados Unidos para el Desarrollo Internacional o del Gobierno de los Estados Unidos.
          La sección de <Link to="/action">análisis de compras covid</Link> con técnicas de Inteligencia Artificial fue posible gracias al apoyo de la
          <a href="https://www.open-contracting.org/" target="__blank" rel="noopener noreferrer"> Open Contracting Partnership.</a>
        </Typography.Paragraph>
      </Col>
    </Row>
    <Row>
      <Col offset={1} xxl={22} xl={22} lg={22} md={22} sm={22} xs={22} style={{ textAlign: 'center' }}>
        <Typography.Title level={2} className="about-title">Términos y condiciones</Typography.Title>
      </Col>

    </Row>
    <Row gutter={[8, 24]} className="about-paragraph" style={{ fontSize: '20px' }}>
      <Col span={12} offset={6}>
        <Typography.Paragraph style={{ textAlign: 'justify' }}>
          El acceso al Sistema de Información de Contrataciones Públicas www.contrataciones.gov.py, en adelante SICP, no implica que la Dirección Nacional de
          Contrataciones Públicas, en adelante DNCP, haya comprobado la veracidad, exactitud, adecuación, idoneidad, exhaustividad y actualidad de la información
          suministrada a través de nuestro sitio. El contenido de esta página en cuanto a los procedimientos de contratación es obtenido directamente de cada
          entidad licitante; en lo que respecta a los pagos a proveedores, los mismos provienen de las entidades contratantes y del Ministerio de Hacienda según el caso,
          no pudiendo la DNCP garantizar que el contenido de la información se encuentre permanentemente actualizado, atendiendo que el mismo depende de los datos
          proveídos por las distintas entidades sujetas al Sistema de Contrataciones del Sector Público.
          Las informaciones contenidas en los documentos que acompañan a las licitaciones son digitalizaciones de los documentos remitidos por los organismos del Estado,
          toda publicación constituye una recopilación fiel e integral del documento emitido por la entidad oficial, sin agregados, supresiones o correcciones de ninguna naturaleza.
          La DNCP no se responsabiliza de las decisiones tomadas a partir de la información difundida en el SICP ni de los posibles daños y perjuicios producidos al usuario
          visitante o a terceros con motivo de actuaciones que tengan como único fundamento la información obtenida en el sitio. La DNCP podrá efectuar, en cualquier momento y sin
          necesidad de previo aviso, modificaciones y actualizaciones sobre la información contenida en el SICP o en su configuración o presentación.
          La reutilización de los datos difundidos en el SICP se realizará, por parte de los usuarios, bajo su propia cuenta y riesgo, correspondiéndoles exclusivamente a ellos responder
          frente a terceros por daños que pudieran derivarse de ello. La DNCP no será responsable del uso o reúso que hagan de la información, ni tampoco de los daños sufridos o pérdidas
          económicas que, de forma directa o indirecta, produzcan o puedan producir por el uso de la información reutilizada.

          En el SICP se han incluido enlaces a páginas de sitios Web de terceros (“links”), que se han considerado de interés para los Usuarios; sin embargo cuando nuestras páginas contengan
          enlaces a páginas externas a la DNCP, ya sea a otras entidades gubernamentales, comerciales o privadas, y el usuario seleccione uno de éstos la DNCP no asume ninguna responsabilidad derivada de la conexión o contenidos de los enlaces de terceros a los que se hace referencia en el SICP, por lo que el usuario estará sujeto a las normas y condiciones de la página externa.

        </Typography.Paragraph>
      </Col>
    </Row>
    <Footer tableMode={false} aboutFooter={true} />
  </>
  );
}


export default AboutPage;

import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  path?: string;
  type?: string;
  noindex?: boolean;
}

const BASE_URL = 'https://hubmx.lovable.app';
const SITE_NAME = 'HUB MX';
const DEFAULT_TITLE = 'HUB MX - Comunidad de Comunidades Tech';
const DEFAULT_DESC = 'Conecta con comunidades tech en México y Latinoamérica. Eventos, networking, mentorías y más.';
const OG_IMAGE = `${BASE_URL}/favicon.png`;

const SEOHead = ({
  title,
  description = DEFAULT_DESC,
  path = '/',
  type = 'website',
  noindex = false,
}: SEOHeadProps) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const url = `${BASE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:locale" content="es_MX" />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={OG_IMAGE} />
    </Helmet>
  );
};

export default SEOHead;

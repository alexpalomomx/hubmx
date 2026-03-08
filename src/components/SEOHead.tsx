import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  path?: string;
  type?: string;
}

const BASE_URL = 'https://hubmx.lovable.app';
const SITE_NAME = 'HUB MX';
const DEFAULT_TITLE = 'HUB MX - Comunidad de Comunidades Tech';
const DEFAULT_DESC = 'Conecta con comunidades tech en México y Latinoamérica. Eventos, networking, mentorías y más.';

const SEOHead = ({
  title,
  description = DEFAULT_DESC,
  path = '/',
  type = 'website',
}: SEOHeadProps) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const url = `${BASE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
};

export default SEOHead;

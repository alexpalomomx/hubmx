export interface CountryData {
  name: string;
  code: string;
  states: string[];
}

export const LATAM_COUNTRIES: CountryData[] = [
  {
    name: "México",
    code: "MX",
    states: [
      "Aguascalientes", "Baja California", "Baja California Sur", "Campeche",
      "Chiapas", "Chihuahua", "Ciudad de México", "Coahuila", "Colima",
      "Durango", "Estado de México", "Guanajuato", "Guerrero", "Hidalgo",
      "Jalisco", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca",
      "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa",
      "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz",
      "Yucatán", "Zacatecas"
    ],
  },
  {
    name: "Colombia",
    code: "CO",
    states: [
      "Amazonas", "Antioquia", "Arauca", "Atlántico", "Bogotá D.C.",
      "Bolívar", "Boyacá", "Caldas", "Caquetá", "Casanare", "Cauca",
      "Cesar", "Chocó", "Córdoba", "Cundinamarca", "Guainía", "Guaviare",
      "Huila", "La Guajira", "Magdalena", "Meta", "Nariño",
      "Norte de Santander", "Putumayo", "Quindío", "Risaralda",
      "San Andrés y Providencia", "Santander", "Sucre", "Tolima",
      "Valle del Cauca", "Vaupés", "Vichada"
    ],
  },
  {
    name: "Argentina",
    code: "AR",
    states: [
      "Buenos Aires", "CABA", "Catamarca", "Chaco", "Chubut",
      "Córdoba", "Corrientes", "Entre Ríos", "Formosa", "Jujuy",
      "La Pampa", "La Rioja", "Mendoza", "Misiones", "Neuquén",
      "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz",
      "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucumán"
    ],
  },
  {
    name: "Chile",
    code: "CL",
    states: [
      "Arica y Parinacota", "Tarapacá", "Antofagasta", "Atacama",
      "Coquimbo", "Valparaíso", "Región Metropolitana", "O'Higgins",
      "Maule", "Ñuble", "Biobío", "La Araucanía", "Los Ríos",
      "Los Lagos", "Aysén", "Magallanes"
    ],
  },
  {
    name: "Perú",
    code: "PE",
    states: [
      "Amazonas", "Áncash", "Apurímac", "Arequipa", "Ayacucho",
      "Cajamarca", "Callao", "Cusco", "Huancavelica", "Huánuco",
      "Ica", "Junín", "La Libertad", "Lambayeque", "Lima",
      "Loreto", "Madre de Dios", "Moquegua", "Pasco", "Piura",
      "Puno", "San Martín", "Tacna", "Tumbes", "Ucayali"
    ],
  },
  {
    name: "Ecuador",
    code: "EC",
    states: [
      "Azuay", "Bolívar", "Cañar", "Carchi", "Chimborazo", "Cotopaxi",
      "El Oro", "Esmeraldas", "Galápagos", "Guayas", "Imbabura", "Loja",
      "Los Ríos", "Manabí", "Morona Santiago", "Napo", "Orellana",
      "Pastaza", "Pichincha", "Santa Elena", "Santo Domingo de los Tsáchilas",
      "Sucumbíos", "Tungurahua", "Zamora-Chinchipe"
    ],
  },
  {
    name: "Uruguay",
    code: "UY",
    states: [
      "Artigas", "Canelones", "Cerro Largo", "Colonia", "Durazno",
      "Flores", "Florida", "Lavalleja", "Maldonado", "Montevideo",
      "Paysandú", "Río Negro", "Rivera", "Rocha", "Salto",
      "San José", "Soriano", "Tacuarembó", "Treinta y Tres"
    ],
  },
  {
    name: "Costa Rica",
    code: "CR",
    states: [
      "Alajuela", "Cartago", "Guanacaste", "Heredia", "Limón",
      "Puntarenas", "San José"
    ],
  },
  {
    name: "Panamá",
    code: "PA",
    states: [
      "Bocas del Toro", "Chiriquí", "Coclé", "Colón", "Darién",
      "Herrera", "Los Santos", "Panamá", "Panamá Oeste", "Veraguas"
    ],
  },
  {
    name: "República Dominicana",
    code: "DO",
    states: [
      "Distrito Nacional", "Santiago", "Santo Domingo", "La Vega",
      "San Cristóbal", "Puerto Plata", "Duarte", "La Romana",
      "San Pedro de Macorís", "Espaillat"
    ],
  },
  {
    name: "Guatemala",
    code: "GT",
    states: [
      "Alta Verapaz", "Baja Verapaz", "Chimaltenango", "Chiquimula",
      "El Progreso", "Escuintla", "Guatemala", "Huehuetenango",
      "Izabal", "Jalapa", "Jutiapa", "Petén", "Quetzaltenango",
      "Quiché", "Retalhuleu", "Sacatepéquez", "San Marcos",
      "Santa Rosa", "Sololá", "Suchitepéquez", "Totonicapán", "Zacapa"
    ],
  },
  {
    name: "Bolivia",
    code: "BO",
    states: [
      "Beni", "Chuquisaca", "Cochabamba", "La Paz", "Oruro",
      "Pando", "Potosí", "Santa Cruz", "Tarija"
    ],
  },
  {
    name: "Paraguay",
    code: "PY",
    states: [
      "Alto Paraná", "Asunción", "Central", "Itapúa", "Caaguazú",
      "San Pedro", "Cordillera", "Guairá", "Paraguarí", "Concepción"
    ],
  },
  {
    name: "Venezuela",
    code: "VE",
    states: [
      "Amazonas", "Anzoátegui", "Apure", "Aragua", "Barinas",
      "Bolívar", "Carabobo", "Cojedes", "Delta Amacuro",
      "Distrito Capital", "Falcón", "Guárico", "Lara", "Mérida",
      "Miranda", "Monagas", "Nueva Esparta", "Portuguesa",
      "Sucre", "Táchira", "Trujillo", "Vargas", "Yaracuy", "Zulia"
    ],
  },
  {
    name: "Honduras",
    code: "HN",
    states: [
      "Atlántida", "Choluteca", "Colón", "Comayagua", "Copán",
      "Cortés", "El Paraíso", "Francisco Morazán", "Gracias a Dios",
      "Intibucá", "Islas de la Bahía", "La Paz", "Lempira", "Ocotepeque",
      "Olancho", "Santa Bárbara", "Valle", "Yoro"
    ],
  },
  {
    name: "El Salvador",
    code: "SV",
    states: [
      "Ahuachapán", "Cabañas", "Chalatenango", "Cuscatlán",
      "La Libertad", "La Paz", "La Unión", "Morazán",
      "San Miguel", "San Salvador", "San Vicente",
      "Santa Ana", "Sonsonate", "Usulután"
    ],
  },
  {
    name: "Nicaragua",
    code: "NI",
    states: [
      "Boaco", "Carazo", "Chinandega", "Chontales", "Estelí",
      "Granada", "Jinotega", "León", "Madriz", "Managua",
      "Masaya", "Matagalpa", "Nueva Segovia", "Río San Juan", "Rivas"
    ],
  },
  {
    name: "Cuba",
    code: "CU",
    states: [
      "Artemisa", "Camagüey", "Ciego de Ávila", "Cienfuegos",
      "Granma", "Guantánamo", "Holguín", "Isla de la Juventud",
      "La Habana", "Las Tunas", "Matanzas", "Mayabeque",
      "Pinar del Río", "Sancti Spíritus", "Santiago de Cuba",
      "Villa Clara"
    ],
  },
];

export const getStatesForCountry = (countryName: string): string[] => {
  const country = LATAM_COUNTRIES.find((c) => c.name === countryName);
  return country?.states || [];
};

export const getAllCountryNames = (): string[] => {
  return LATAM_COUNTRIES.map((c) => c.name);
};

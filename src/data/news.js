/**
 * NEWS ENTRIES
 * ------------
 * Add a new object at the TOP of the array for each piece of news.
 *
 * Fields:
 *  slug        URL identifier, lowercase, hyphens only (must be unique).
 *  date        ISO date "YYYY-MM-DD". Used for sorting and display.
 *  type        "aquila"  -> our own announcement / article
 *              "press"   -> a mention in the media (add `source`)
 *              "player"  -> interview / quotes from a player
 *  playerIds   ids from src/data/players.js (optional). Links the entry to profiles.
 *  dealId      id from src/data/deals.js (optional).
 *  image       path under /public (optional). Falls back to the player's photo.
 *  source      { name, url } for press entries (optional otherwise).
 *  title / excerpt / body   objects with `en` and `es` texts. `body` is an array of paragraphs.
 *  tags        free-form keywords (optional), e.g. ["ISL", "Signing"].
 */
export const news = [
    {
        slug: 'miguel-lopez-joins-ue-santa-coloma',
        date: '2026-02-01',
        type: 'aquila',
        playerIds: [6],
        dealId: 8,
        tags: ['Signing', 'Andorra'],
        title: {
            en: 'Miguel López joins UE Santa Coloma',
            es: 'Miguel López ficha por la UE Santa Coloma',
        },
        excerpt: {
            en: 'The midfielder moves within the Andorran Primera Divisió, from FC Rànger’s to UE Santa Coloma, on a free transfer.',
            es: 'El centrocampista cambia de equipo dentro de la Primera Divisió andorrana: deja el FC Rànger’s y llega libre a la UE Santa Coloma.',
        },
        body: {
            en: [
                'Miguel López has signed for UE Santa Coloma. The midfielder arrives from FC Rànger’s on a free transfer and continues his career in the Andorran Primera Divisió.',
                'A technical midfielder who controls the tempo of the game, Miguel brings experience to a club that competes at the top of Andorran football. The move was structured and closed by Aquila Sports Management during the winter window.',
                'We wish Miguel a great second half of the season.',
            ],
            es: [
                'Miguel López es nuevo jugador de la UE Santa Coloma. El centrocampista llega libre desde el FC Rànger’s y continúa su carrera en la Primera Divisió de Andorra.',
                'Centrocampista técnico y con visión, Miguel aporta experiencia a un club que compite en la parte alta del fútbol andorrano. La operación fue estructurada y cerrada por Aquila Sports Management durante el mercado de invierno.',
                'Le deseamos a Miguel una gran segunda vuelta.',
            ],
        },
    },
    {
        slug: 'christian-rivera-signs-for-real-aviles',
        date: '2026-01-15',
        type: 'aquila',
        playerIds: [2],
        dealId: 2,
        tags: ['Signing', 'Spain'],
        title: {
            en: 'Christian Rivera returns to Spanish football with Real Avilés',
            es: 'Christian Rivera vuelve al fútbol español con el Real Avilés',
        },
        excerpt: {
            en: 'The defensive midfielder joins Real Avilés Industrial as a free agent for the second half of the 2025/26 season.',
            es: 'El mediocentro defensivo se incorpora al Real Avilés Industrial como agente libre para la segunda vuelta de la 2025/26.',
        },
        body: {
            en: [
                'Christian Rivera has signed for Real Avilés Industrial. The defensive midfielder joins the club as a free agent and returns to Spanish football for the second half of the 2025/26 season.',
                'Standing 1.91 m, Christian offers a commanding presence in midfield, exceptional aerial ability and experience in the Spanish professional leagues. He can also cover as a central defender.',
                'The deal was negotiated and closed by Aquila Sports Management in the January window.',
            ],
            es: [
                'Christian Rivera es nuevo jugador del Real Avilés Industrial. El mediocentro defensivo llega como agente libre y vuelve al fútbol español para la segunda vuelta de la temporada 2025/26.',
                'Con 1,91 m, Christian aporta presencia en el centro del campo, un juego aéreo excepcional y experiencia en el fútbol profesional español. Puede actuar también como central.',
                'La operación fue negociada y cerrada por Aquila Sports Management en el mercado de enero.',
            ],
        },
    },
    {
        slug: 'mati-hernandez-steps-up-to-kerala-blasters',
        date: '2026-01-10',
        type: 'aquila',
        playerIds: [5],
        dealId: 7,
        image: '/assets/deals/mati-kerala-done-deal.jpg',
        tags: ['Signing', 'ISL', 'India'],
        title: {
            en: 'Mati Hernández steps up to the ISL with Kerala Blasters',
            es: 'Mati Hernández da el salto a la ISL con Kerala Blasters',
        },
        excerpt: {
            en: 'After half a season at Gokulam Kerala, Luis Matías “Mati” Hernández joins Kerala Blasters, one of the biggest clubs in Indian football.',
            es: 'Tras media temporada en el Gokulam Kerala, Luis Matías “Mati” Hernández ficha por Kerala Blasters, uno de los grandes del fútbol indio.',
        },
        body: {
            en: [
                'Luis Matías “Mati” Hernández is a Kerala Blasters player. The midfielder moves from Gokulam Kerala to the Indian Super League on a free transfer, only months after arriving in India.',
                'Mati joined Gokulam Kerala in August 2025 from DPMM FC (Brunei). His work rate and adaptability in the I-League opened the door to one of the most followed clubs in Asia, and to a contract that runs until 2027.',
                'Two moves in six months, both closed by Aquila Sports Management: this is what a career plan looks like when the player delivers on the pitch.',
            ],
            es: [
                'Luis Matías “Mati” Hernández ya es jugador de Kerala Blasters. El centrocampista pasa del Gokulam Kerala a la Indian Super League como agente libre, solo unos meses después de llegar a la India.',
                'Mati fichó por el Gokulam Kerala en agosto de 2025 procedente del DPMM FC (Brunéi). Su intensidad y su adaptación en la I-League le abrieron la puerta de uno de los clubes con más seguidores de Asia, con contrato hasta 2027.',
                'Dos movimientos en seis meses, ambos cerrados por Aquila Sports Management: así es un plan de carrera cuando el jugador responde en el campo.',
            ],
        },
    },
    {
        slug: 'victor-bertomeu-kerala-blasters-intermediation',
        date: '2026-01-08',
        type: 'aquila',
        dealId: 9,
        tags: ['Intermediation', 'ISL', 'India'],
        title: {
            en: 'Aquila intermediates Víctor Bertomeu’s move to Kerala Blasters',
            es: 'Aquila intermedia la llegada de Víctor Bertomeu a Kerala Blasters',
        },
        excerpt: {
            en: 'A second Spanish player lands in Kochi in the same window, this time through an intermediation mandate.',
            es: 'Un segundo jugador español aterriza en Kochi en la misma ventana, esta vez a través de un mandato de intermediación.',
        },
        body: {
            en: [
                'Víctor Bertomeu has joined Kerala Blasters. Aquila Sports Management acted as intermediary in the operation, which brought the Spanish player to the Indian Super League as a free agent.',
                'It is the second Spanish arrival at the Kochi club in the January window handled by Aquila, and a good example of our intermediation service: identify the right counterpart, structure the deal and coordinate every party until signature.',
            ],
            es: [
                'Víctor Bertomeu es nuevo jugador de Kerala Blasters. Aquila Sports Management actuó como intermediario en la operación, que lleva al jugador español a la Indian Super League como agente libre.',
                'Es la segunda llegada española al club de Kochi en el mercado de enero gestionada por Aquila, y un buen ejemplo de nuestro servicio de intermediación: identificar al interlocutor adecuado, estructurar la operación y coordinar a todas las partes hasta la firma.',
            ],
        },
    },
    {
        slug: 'victor-campuzano-signs-for-sydney-fc',
        date: '2025-09-05',
        type: 'aquila',
        playerIds: [1],
        dealId: 1,
        tags: ['Signing', 'A-League', 'Australia'],
        title: {
            en: 'Víctor Campuzano signs for Sydney FC',
            es: 'Víctor Campuzano ficha por el Sydney FC',
        },
        excerpt: {
            en: 'The forward leaves Sporting Gijón and joins Sydney FC on a contract until 2027, a strategic step into the A-League.',
            es: 'El delantero deja el Sporting de Gijón y se incorpora al Sydney FC con contrato hasta 2027, un paso estratégico hacia la A-League.',
        },
        body: {
            en: [
                'Víctor Campuzano is a Sydney FC player. The forward arrives from Sporting Gijón on a free transfer and signs until 2027 with one of the most successful clubs in Australian football.',
                'A versatile attacker with La Liga experience, Víctor can play as a striker, as a No. 10 or on the wing. The A-League offers him a leading role in a competitive league with strong international visibility.',
                'The move was planned and executed by Aquila Sports Management.',
            ],
            es: [
                'Víctor Campuzano es nuevo jugador del Sydney FC. El delantero llega libre desde el Sporting de Gijón y firma hasta 2027 con uno de los clubes más laureados del fútbol australiano.',
                'Atacante polivalente con experiencia en LaLiga, Víctor puede jugar como delantero, mediapunta o extremo. La A-League le ofrece un papel protagonista en una liga competitiva y con gran visibilidad internacional.',
                'La operación fue planificada y ejecutada por Aquila Sports Management.',
            ],
        },
    },
    {
        slug: 'mati-hernandez-joins-gokulam-kerala',
        date: '2025-08-20',
        type: 'aquila',
        playerIds: [5],
        dealId: 3,
        tags: ['Signing', 'India'],
        title: {
            en: 'Mati Hernández joins Gokulam Kerala',
            es: 'Mati Hernández ficha por el Gokulam Kerala',
        },
        excerpt: {
            en: 'From Brunei to India: the midfielder leaves DPMM FC and takes on a new challenge in the I-League.',
            es: 'De Brunéi a la India: el centrocampista deja el DPMM FC y afronta un nuevo reto en la I-League.',
        },
        body: {
            en: [
                'Luis Matías “Mati” Hernández has signed for Gokulam Kerala. The midfielder arrives from DPMM FC (Brunei) on a free transfer to compete in the I-League.',
                'The Asian market is one of the areas where Aquila Sports Management works most actively. Mati’s profile, a dynamic midfielder with a high work rate, fits the demands of Indian football, and the move keeps his career on an upward path.',
            ],
            es: [
                'Luis Matías “Mati” Hernández ha fichado por el Gokulam Kerala. El centrocampista llega libre desde el DPMM FC (Brunéi) para competir en la I-League.',
                'El mercado asiático es una de las zonas en las que Aquila Sports Management trabaja con más actividad. El perfil de Mati, un centrocampista dinámico y de gran intensidad, encaja con las exigencias del fútbol indio y mantiene su carrera en línea ascendente.',
            ],
        },
    },
    {
        slug: 'christian-jimenez-signs-for-ac-escaldes',
        date: '2025-07-15',
        type: 'aquila',
        playerIds: [4],
        dealId: 4,
        tags: ['Signing', 'Andorra'],
        title: {
            en: 'Christian Jiménez signs for AC Escaldes',
            es: 'Christian Jiménez ficha por el AC Escaldes',
        },
        excerpt: {
            en: 'The ambidextrous defender leaves UD Torre del Mar and joins the Andorran Primera Divisió.',
            es: 'El defensa ambidiestro deja la UD Torre del Mar y se incorpora a la Primera Divisió de Andorra.',
        },
        body: {
            en: [
                'Christian Jiménez is a new AC Escaldes player. The defender arrives from UD Torre del Mar on a free transfer and will compete in the Andorran Primera Divisió.',
                'Ambidextrous and able to play across the back line, Christian was a key defensive signing for the club. The deal was closed by Aquila Sports Management in the summer window.',
            ],
            es: [
                'Christian Jiménez es nuevo jugador del AC Escaldes. El defensa llega libre desde la UD Torre del Mar y competirá en la Primera Divisió de Andorra.',
                'Ambidiestro y capaz de jugar en toda la línea defensiva, Christian fue un fichaje clave para la zaga del club. La operación fue cerrada por Aquila Sports Management en el mercado de verano.',
            ],
        },
    },
    {
        slug: 'dani-fernandez-joins-sd-logrones',
        date: '2025-07-10',
        type: 'aquila',
        playerIds: [3],
        dealId: 5,
        tags: ['Signing', 'Spain'],
        title: {
            en: 'Dani Fernández joins SD Logroñés',
            es: 'Dani Fernández ficha por la SD Logroñés',
        },
        excerpt: {
            en: 'The young forward moves from CD Numancia to SD Logroñés within Segunda Federación.',
            es: 'El joven delantero pasa del CD Numancia a la SD Logroñés dentro de Segunda Federación.',
        },
        body: {
            en: [
                'Dani Fernández has signed for SD Logroñés. The forward arrives from CD Numancia on a free transfer and continues in Segunda Federación.',
                'At 23, Dani combines physical strength with a natural goal-scoring instinct. The move gives him a leading role at a club with ambition, and keeps his development on track. Closed by Aquila Sports Management.',
            ],
            es: [
                'Dani Fernández ha fichado por la SD Logroñés. El delantero llega libre desde el CD Numancia y continúa en Segunda Federación.',
                'Con 23 años, Dani combina fortaleza física con un instinto goleador natural. El movimiento le da protagonismo en un club con ambición y mantiene su progresión. Operación cerrada por Aquila Sports Management.',
            ],
        },
    },
    {
        slug: 'pablo-margallo-ud-santa-coloma-intermediation',
        date: '2025-07-05',
        type: 'aquila',
        dealId: 6,
        tags: ['Intermediation', 'Andorra'],
        title: {
            en: 'Aquila intermediates Pablo Margallo’s move to UD Santa Coloma',
            es: 'Aquila intermedia el fichaje de Pablo Margallo por la UD Santa Coloma',
        },
        excerpt: {
            en: 'From CD Unión Sur Yaiza (Canary Islands) to Andorra, through an intermediation mandate.',
            es: 'Del CD Unión Sur Yaiza (Canarias) a Andorra, a través de un mandato de intermediación.',
        },
        body: {
            en: [
                'Pablo Margallo has joined UD Santa Coloma. Aquila Sports Management acted as intermediary in the operation, which takes the player from CD Unión Sur Yaiza to the Andorran Primera Divisió.',
                'Andorra has become a natural destination for Spanish players looking for a competitive league with European exposure, and Aquila has closed several operations there in recent seasons.',
            ],
            es: [
                'Pablo Margallo es nuevo jugador de la UD Santa Coloma. Aquila Sports Management actuó como intermediario en la operación, que lleva al jugador del CD Unión Sur Yaiza a la Primera Divisió de Andorra.',
                'Andorra se ha convertido en un destino natural para jugadores españoles que buscan una liga competitiva con exposición europea, y Aquila ha cerrado allí varias operaciones en las últimas temporadas.',
            ],
        },
    },
];

export const newsTypes = ['aquila', 'press', 'player'];

export const sortedNews = () => [...news].sort((a, b) => (a.date < b.date ? 1 : -1));

export const getNewsBySlug = (slug) => news.find((n) => n.slug === slug);

export const getNewsForPlayer = (playerId) =>
    sortedNews().filter((n) => (n.playerIds || []).includes(playerId));

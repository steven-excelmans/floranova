import type { Plant } from 'src/types/plant';

const plants: Plant[] = [
  // ─── Centaurea cyanus 'Classic Magic' ─────────────────────────────
  {
    id: 'centaurea-cyanus-classic-magic',
    species: 'Centaurea cyanus',
    variety: 'Classic Magic',
    latinName: 'Centaurea cyanus',
    name: {
      nl: 'Korenbloem Classic Magic',
      en: 'Cornflower Classic Magic',
    },
    type: 'flower',
    calendar: {
      indoorSowing: [3, 4],
      greenhouse: null,
      outdoor: [4, 5],
    },
    germination: 'dark',
    colors: ['purple', 'black', 'white'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Pink_Cornflower_%28111522721%29.jpeg/500px-Pink_Cornflower_%28111522721%29.jpeg',
    maintenanceNotes: {
      nl: 'Goed doorlatende grond. Zaailingen uitdunnen op 20-25 cm. Kan ook in de herfst (sept-okt) gezaaid worden voor vroege bloei. Regelmatig uitgebloeide bloemen verwijderen voor langere bloei.',
      en: 'Well-drained soil. Thin seedlings to 20-25 cm apart. Can also be autumn-sown (Sept-Oct) for early blooming. Deadhead regularly to prolong flowering.',
    },
    plantingConditions: ['tray', 'outside-direct', 'module-tray'],
    minDistanceCm: 25,
    stemTips: {
      nl: 'Oogst wanneer bloemen net volledig open zijn. Knip tot het derde bladpaar om hergroei te stimuleren. Vaaslevensduur 5-7 dagen. Droogt ook uitstekend.',
      en: 'Harvest when flowers are just fully open. Cut to the third leaf pair to encourage regrowth. Vase life 5-7 days. Also dries excellently, retaining color.',
    },
    sun: 'full-sun',
  },

  // ─── Centaurea cyanus 'Black Ball' ────────────────────────────────
  {
    id: 'centaurea-cyanus-black-ball',
    species: 'Centaurea cyanus',
    variety: 'Black Ball',
    latinName: 'Centaurea cyanus',
    name: {
      nl: 'Korenbloem Black Ball',
      en: 'Cornflower Black Ball',
    },
    type: 'flower',
    calendar: {
      indoorSowing: [3, 4],
      greenhouse: null,
      outdoor: [4, 5],
    },
    germination: 'dark',
    colors: ['black', 'purple'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Cyanus_Segetum_Dark_Red_%28260904605%29.jpeg/500px-Cyanus_Segetum_Dark_Red_%28260904605%29.jpeg',
    maintenanceNotes: {
      nl: 'Voorjaarzaai: eventueel koud stratificeren (2 weken in de koelkast). Herfst buiten zaaien (sept-okt) kan ook. Goed doorlatende, niet te rijke grond. Droogtetolerant.',
      en: 'Spring sowing: optionally cold-stratify (2 weeks in fridge). Autumn direct sowing (Sept-Oct) is also possible. Well-drained, not overly rich soil. Drought tolerant.',
    },
    plantingConditions: ['tray', 'outside-direct', 'module-tray'],
    minDistanceCm: 25,
    stemTips: {
      nl: 'Oogst bij volle bloei. Knip boven het derde bladpaar voor meer bloemen en langere stelen. Vaaslevensduur 5-7 dagen.',
      en: 'Harvest at full bloom. Cut above the third leaf pair for more flowers and longer stems. Vase life 5-7 days.',
    },
    sun: 'full-sun',
  },

  // ─── Helianthus annuus 'Moulin Rouge' ────────────────────────────
  {
    id: 'helianthus-annuus-moulin-rouge',
    species: 'Helianthus annuus',
    variety: 'Moulin Rouge',
    latinName: 'Helianthus annuus',
    name: {
      nl: 'Zonnebloem Moulin Rouge',
      en: 'Sunflower Moulin Rouge',
    },
    type: 'flower',
    calendar: {
      indoorSowing: [4, 4],
      greenhouse: null,
      outdoor: [5, 6],
    },
    germination: 'dark',
    colors: ['burgundy', 'red', 'black'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/%27Red_Wave%27_sunflower_IMG_5475.jpg/500px-%27Red_Wave%27_sunflower_IMG_5475.jpg',
    maintenanceNotes: {
      nl: 'Pollenvrij en vertakkend: meerdere bloemen per plant. Zaai 1-2 cm diep. Niet te vroeg buiten planten, bodemtemp. min. 15°C. Lange penwortel: gebruik biologisch afbreekbare potjes bij voorzaaien. Steun eventueel bij wind.',
      en: 'Pollen-free and branching: multiple blooms per plant. Sow 1-2 cm deep. Do not plant out too early, soil temp min. 15C. Long taproot: use biodegradable pots when starting indoors. Stake if exposed to wind.',
    },
    plantingConditions: ['outside-direct', 'p9-pot', 'big-pot'],
    minDistanceCm: 40,
    stemTips: {
      nl: 'Oogst wanneer buitenste kroonbladeren beginnen los te komen van het centrum. Pollenvrij dus geen vlekken op textiel. Bloemen 13-18 cm. Vaaslevensduur 7-10 dagen.',
      en: 'Harvest when outer petals begin to lift away from the center. Pollen-free so no stains on textiles. Flowers 13-18 cm. Vase life 7-10 days.',
    },
    sun: 'full-sun',
  },

  // ─── Zinnia elegans 'Envy' ────────────────────────────────────────
  {
    id: 'zinnia-elegans-envy',
    species: 'Zinnia elegans',
    variety: 'Envy',
    latinName: 'Zinnia elegans',
    name: {
      nl: 'Zinnia Envy',
      en: 'Zinnia Envy',
    },
    type: 'flower',
    calendar: {
      indoorSowing: [3, 4],
      greenhouse: null,
      outdoor: [5, 6],
    },
    germination: 'dark',
    colors: ['green', 'chartreuse'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Zinnia_Jade_%28284585870%29.jpg/500px-Zinnia_Jade_%28284585870%29.jpg',
    maintenanceNotes: {
      nl: 'Zaai oppervlakkig (0,5 cm diep). Kiemt in 7-14 dagen bij 21-24°C. Niet te vroeg uitplanten, gevoelig voor koude. Toppen (pinchen) voor meer vertakking. Goede luchtcirculatie voorkomt meeldauw.',
      en: 'Sow shallowly (0.5 cm deep). Germinates in 7-14 days at 21-24C. Do not plant out too early, sensitive to cold. Pinch for more branching. Good air circulation prevents powdery mildew.',
    },
    plantingConditions: ['tray', 'outside-direct', 'module-tray', 'p9-pot'],
    minDistanceCm: 25,
    stemTips: {
      nl: 'Cut-and-come-again bloem: hoe meer je knipt, hoe meer bloemen. Oogst wanneer bloemen volledig open zijn met stevige stelen. Vaaslevensduur 7-10 dagen. Unieke groene kleur, perfect voor bloemstukken.',
      en: 'Cut-and-come-again flower: the more you cut, the more flowers you get. Harvest when flowers are fully open with firm stems. Vase life 7-10 days. Unique green color, perfect for arrangements.',
    },
    sun: 'full-sun',
  },

  // ─── Zinnia elegans 'Cupcakes Mix' ────────────────────────────────
  {
    id: 'zinnia-elegans-cupcakes-mix',
    species: 'Zinnia elegans',
    variety: 'Cupcakes Mix',
    latinName: 'Zinnia elegans',
    name: {
      nl: 'Zinnia Cupcakes Mix',
      en: 'Zinnia Cupcakes Mix',
    },
    type: 'flower',
    calendar: {
      indoorSowing: [3, 4],
      greenhouse: null,
      outdoor: [5, 6],
    },
    germination: 'dark',
    colors: ['pink', 'orange', 'yellow', 'red', 'cream', 'rose'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Zinnia_elegans_Dreamland_Mix_1zz.jpg/500px-Zinnia_elegans_Dreamland_Mix_1zz.jpg',
    maintenanceNotes: {
      nl: 'Zaai oppervlakkig (0,5 cm diep). Kiemt snel in 3-5 dagen bij 25-29°C. Niet te vroeg uitplanten, vorstgevoelig. Dode bloemen verwijderen voor continue bloei tot de vorst. Goede luchtstroom is belangrijk.',
      en: 'Sow shallowly (0.5 cm deep). Germinates quickly in 3-5 days at 25-29C. Do not plant out too early, frost sensitive. Deadhead for continuous blooming until frost. Good airflow is important.',
    },
    plantingConditions: ['tray', 'outside-direct', 'module-tray', 'p9-pot'],
    minDistanceCm: 25,
    stemTips: {
      nl: 'Cut-and-come-again bloem. Oogst met stevige, rechte stelen wanneer de bloem volledig open is. Semi-gevulde tot gevulde bloemen van ca. 5 cm. Vaaslevensduur 7-10 dagen.',
      en: 'Cut-and-come-again flower. Harvest with firm, straight stems when flower is fully open. Semi-double to double blooms of about 5 cm. Vase life 7-10 days.',
    },
    sun: 'full-sun',
  },

  // ─── Phlox drummondii 'Creme Brulee' ─────────────────────────────
  {
    id: 'phlox-drummondii-creme-brulee',
    species: 'Phlox drummondii',
    variety: 'Creme Brulee',
    latinName: 'Phlox drummondii',
    name: {
      nl: 'Vlambloem Creme Brulee',
      en: 'Annual Phlox Creme Brulee',
    },
    type: 'flower',
    calendar: {
      indoorSowing: [2, 4],
      greenhouse: null,
      outdoor: [5, 6],
    },
    germination: 'dark',
    colors: ['pink', 'peach', 'cream', 'lavender'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Phlox_drummondii_-_25777770860.jpg/500px-Phlox_drummondii_-_25777770860.jpg',
    maintenanceNotes: {
      nl: 'Zaai 1,5 mm diep en dek af: donkerkiemer! Kiemt in 10-21 dagen bij 18-20°C. Uitplanten na laatste vorst (begin juni in Belgie). Goed doorlatende, vruchtbare grond. Verwijder uitgebloeide bloemen.',
      en: 'Sow 1.5 mm deep and cover: dark germinator! Germinates in 10-21 days at 18-20C. Plant out after last frost (early June in Belgium). Well-drained, fertile soil. Remove spent flowers.',
    },
    plantingConditions: ['tray', 'module-tray', 'p9-pot', 'outside-direct'],
    minDistanceCm: 25,
    stemTips: {
      nl: 'Oogst wanneer 1/3 tot 1/2 van de bloemen aan de stengel open zijn. Direct in water plaatsen en laten conditioneren. Vaaslevensduur 5-7 dagen. Verwelkte bloemetjes voorzichtig afknijpen voor langere stelen.',
      en: 'Harvest when 1/3 to 1/2 of blooms on a stem are open. Place in water immediately and condition. Vase life 5-7 days. Carefully pinch off spent florets for longer stems.',
    },
    sun: 'full-sun',
  },

  // ─── Matthiola incana 'Apricot' ──────────────────────────────────
  {
    id: 'matthiola-incana-apricot',
    species: 'Matthiola incana',
    variety: 'Apricot',
    latinName: 'Matthiola incana',
    name: {
      nl: 'Violier Apricot',
      en: 'Stock Apricot',
    },
    type: 'flower',
    calendar: {
      indoorSowing: [2, 4],
      greenhouse: null,
      outdoor: null,
    },
    germination: 'light',
    colors: ['apricot', 'peach'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Stock_Flowers_%28246225299%29.jpeg/500px-Stock_Flowers_%28246225299%29.jpeg',
    maintenanceNotes: {
      nl: 'Lichtkiemer: zaai oppervlakkig en dek amper af (max 3 mm). Kiemt in 10-14 dagen bij 16-19°C. Na opkomst kweek bij 10°C om dubbele bloemen te selecteren (lichtgroene zaailingen = dubbel, donkergroen = enkel). Niet toppen! Vorstgevoelig, na de ijsheiligen uitplanten.',
      en: 'Light germinator: sow on surface and barely cover (max 3 mm). Germinates in 10-14 days at 16-19C. After emergence grow at 10C to select doubles (light green seedlings = double, dark green = single). Do not pinch! Frost sensitive, plant out after last frost.',
    },
    plantingConditions: ['tray', 'module-tray', 'p9-pot'],
    minDistanceCm: 15,
    stemTips: {
      nl: 'Oogst wanneer 1/3 tot 1/2 van de bloemetjes aan de aar open zijn. Direct in koel water conditioneren, liefst een nacht. Heerlijk geurend! Vaaslevensduur tot 10 dagen.',
      en: 'Harvest when 1/3 to 1/2 of florets on the spike are open. Condition in cool water immediately, preferably overnight. Wonderfully fragrant! Vase life up to 10 days.',
    },
    sun: 'full-sun',
  },

  // ─── Xerochrysum bracteatum 'Pretty Pink' ────────────────────────
  {
    id: 'xerochrysum-bracteatum-pretty-pink',
    species: 'Xerochrysum bracteatum',
    variety: 'Pretty Pink',
    latinName: 'Xerochrysum bracteatum',
    name: {
      nl: 'Strobloem Pretty Pink',
      en: 'Strawflower Pretty Pink',
    },
    type: 'flower',
    calendar: {
      indoorSowing: [3, 4],
      greenhouse: null,
      outdoor: [5, 6],
    },
    germination: 'light',
    colors: ['pink'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Strawflower%2C_Xerochrysum_bracteatum%2C_Pink_Flame.jpg/500px-Strawflower%2C_Xerochrysum_bracteatum%2C_Pink_Flame.jpg',
    maintenanceNotes: {
      nl: 'Lichtkiemer: zaai op het oppervlak en druk licht aan, NIET afdekken. Kiemt in 10-14 dagen bij 18-24°C. Uitplanten na de ijsheiligen. Goed doorlatende grond, verdraagt droogte. Uitstekend om te drogen.',
      en: 'Light germinator: sow on surface and press lightly, do NOT cover. Germinates in 10-14 days at 18-24C. Plant out after last frost. Well-drained soil, tolerates drought. Excellent for drying.',
    },
    plantingConditions: ['tray', 'module-tray', 'p9-pot', 'outside-direct'],
    minDistanceCm: 25,
    stemTips: {
      nl: 'Oogst wanneer de eerste 2-3 schutbladlagen open zijn maar het centrum nog gesloten is. Bloemen openen na het knippen verder. Vaaslevensduur vers tot 10 dagen. Voor drogen: ondersteboven hangen op een droge, donkere, luchtige plek.',
      en: 'Harvest when the first 2-3 bract layers are open but the center is still closed. Flowers continue opening after cutting. Fresh vase life up to 10 days. For drying: hang upside down in a dry, dark, airy place.',
    },
    sun: 'full-sun',
  },

  // ─── Zinnia elegans 'Zinderella Peach' ─────────────────────────────
  {
    id: 'zinnia-elegans-zinderella-peach',
    species: 'Zinnia elegans',
    variety: 'Zinderella Peach',
    latinName: 'Zinnia elegans',
    name: {
      nl: 'Zinnia Zinderella Peach',
      en: 'Zinnia Zinderella Peach',
    },
    type: 'flower',
    calendar: {
      indoorSowing: [3, 4],
      greenhouse: null,
      outdoor: [5, 6],
    },
    germination: 'dark',
    colors: ['peach', 'salmon', 'pink'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Zinnia-scabiosa-type_IMG_8426.jpg/500px-Zinnia-scabiosa-type_IMG_8426.jpg',
    maintenanceNotes: {
      nl: 'Zaai 0,5-1 cm diep (donkerkiemer). Kiemt in 5-10 dagen bij 21-24°C. Knip de top af wanneer planten 20-30 cm hoog zijn om vertakking te bevorderen. Niet van bovenaf water geven om meeldauw te voorkomen. Vorstgevoelig, plant pas na de ijsheiligen uit.',
      en: 'Sow 0.5-1 cm deep (dark germinator). Germinates in 5-10 days at 21-24°C. Pinch tops when plants reach 20-30 cm to encourage branching. Avoid overhead watering to prevent powdery mildew. Frost sensitive, plant out after last frost only.',
    },
    plantingConditions: ['tray', 'outside-direct', 'module-tray'],
    minDistanceCm: 25,
    stemTips: {
      nl: 'Oogst wanneer de bloem volledig open is. Test door de stengel 20 cm onder de bloem te schudden: als hij stevig rechtop blijft, is hij klaar. Scallop-vormige bloemblaadjes. Vaaslevensduur 7+ dagen.',
      en: 'Harvest when flower is fully open. Test by shaking the stem 20 cm below the bloom: if it stays firm and upright, it is ready to cut. Scallop-shaped petals. Vase life 7+ days.',
    },
    sun: 'full-sun',
  },

  // ─── Gomphrena globosa 'QIS Mix' ──────────────────────────────────
  {
    id: 'gomphrena-globosa-qis-mix',
    species: 'Gomphrena globosa',
    variety: 'QIS Mix',
    latinName: 'Gomphrena globosa',
    name: {
      nl: 'Kogelamarant QIS Mix',
      en: 'Globe Amaranth QIS Mix',
    },
    type: 'flower',
    calendar: {
      indoorSowing: [3, 4],
      greenhouse: null,
      outdoor: null,
    },
    germination: 'light',
    colors: ['pink', 'purple', 'white', 'orange', 'red'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Globe_amaranth_%28Gomphrena_globosa%29.jpg/500px-Globe_amaranth_%28Gomphrena_globosa%29.jpg',
    maintenanceNotes: {
      nl: 'Week zaden 4 uur in warm water voor betere kieming. Heeft warmte nodig om te kiemen (21-27°C), gebruik een warmtemat. Druk zaad licht aan in de grond, niet afdekken. Niet direct buiten zaaien. Knip regelmatig voor meer bloei. 85-100 dagen tot bloei.',
      en: 'Soak seeds in warm water for 4 hours before sowing for better germination. Needs heat to germinate (21-27°C), use a heat mat. Press seed gently into soil, do not cover. Do not direct sow. Cut regularly to encourage more blooms. 85-100 days to bloom.',
    },
    plantingConditions: ['tray', 'module-tray'],
    minDistanceCm: 25,
    stemTips: {
      nl: 'Oogst wanneer de bloemen vol kleur hebben maar nog niet vervaagd zijn. Snijd diep in de plant, tot 1-2 bladparen van de basis, voor langere stelen en meer hergroei. Uitstekend als droogbloem: behoudt kleur perfect.',
      en: 'Harvest when blooms are in full colour but not faded. Cut deep into the plant, down to 1-2 leaf pairs from the base, for longer stems and more regrowth. Excellent dried flower: retains colour perfectly.',
    },
    sun: 'full-sun',
  },

  // ─── Sanguisorba officinalis 'Red Thunder' ────────────────────────
  {
    id: 'sanguisorba-officinalis-red-thunder',
    species: 'Sanguisorba officinalis',
    variety: 'Red Thunder',
    latinName: 'Sanguisorba officinalis',
    name: {
      nl: 'Grote pimpernel Red Thunder',
      en: 'Great Burnet Red Thunder',
    },
    type: 'flower',
    calendar: {
      indoorSowing: [2, 4],
      greenhouse: null,
      outdoor: [4, 6],
    },
    germination: 'light',
    colors: ['burgundy', 'dark red'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Sanguisorba_officinalis_2.JPG/500px-Sanguisorba_officinalis_2.JPG',
    maintenanceNotes: {
      nl: 'Vaste plant (perennial). Zaai oppervlakkig, licht bedekken. Koude stratificatie kan helpen als zaden na 3-4 weken niet kiemen (2-4 weken bij 5°C). Kiemt in 2-4 weken bij 24-25°C. Houd de grond vochtig maar niet nat. Heeft steun nodig bij wind. Snij verwelkte stengels af om uitzaaien te voorkomen.',
      en: 'Perennial plant. Surface sow, lightly cover. Cold stratification may help if seeds do not germinate after 3-4 weeks (2-4 weeks at 5°C). Germinates in 2-4 weeks at 24-25°C. Keep soil moist but not waterlogged. Needs staking in windy sites. Cut back faded stems to prevent self-seeding.',
    },
    plantingConditions: ['tray', 'module-tray', 'p9-pot'],
    minDistanceCm: 45,
    stemTips: {
      nl: 'Oogst wanneer de donkerrode flessenborstelbloemen bijna volledig open zijn. Lange, sierlijke stelen (90-120 cm) zijn ideaal voor wilde boeketten. Vaaslevensduur 5-7 dagen.',
      en: 'Harvest when the dark-red bottlebrush flowers are nearly fully open. Long, graceful stems (90-120 cm) are ideal for wild-style arrangements. Vase life 5-7 days.',
    },
    sun: 'full-sun',
  },

  // ─── Cosmos bipinnatus 'Rose Picotee' ─────────────────────────────
  {
    id: 'cosmos-bipinnatus-rose-picotee',
    species: 'Cosmos bipinnatus',
    variety: 'Rose Picotee',
    latinName: 'Cosmos bipinnatus',
    name: {
      nl: 'Cosmea Rose Picotee',
      en: 'Cosmos Rose Picotee',
    },
    type: 'flower',
    calendar: {
      indoorSowing: [3, 4],
      greenhouse: null,
      outdoor: [5, 6],
    },
    germination: 'light',
    colors: ['white', 'pink', 'rose'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/FranceNormandieSouleuvreEnBocageCosmosPicotee.jpg/500px-FranceNormandieSouleuvreEnBocageCosmosPicotee.jpg',
    maintenanceNotes: {
      nl: 'Lichtkiemer: zaai oppervlakkig en bedek licht. Kiemt in 7-21 dagen bij 20-25°C. Knip de top af wanneer zaailingen 2-3 bladparen hebben. Niet te veel bemesten, dat geeft meer blad en minder bloemen. Verdraagt droogte goed. Witte bloemen met roze-rode rand.',
      en: 'Light germinator: sow on surface and cover lightly. Germinates in 7-21 days at 20-25°C. Pinch out tips when seedlings have 2-3 leaf pairs. Do not over-fertilise as this promotes foliage over flowers. Tolerates drought well. White flowers with pink-rose edging.',
    },
    plantingConditions: ['tray', 'outside-direct', 'module-tray'],
    minDistanceCm: 30,
    stemTips: {
      nl: 'Oogst in het \'gebarsten knop\'-stadium, net voordat de bloemblaadjes volledig opengaan. Vaaslevensduur 5-7 dagen. Hoe meer je snijdt, hoe meer bloemen er komen.',
      en: 'Harvest at the "cracked bud" stage, just before petals fully unfurl. Vase life 5-7 days. The more you cut, the more flowers you get.',
    },
    sun: 'full-sun',
  },

  // ─── Cosmos bipinnatus 'Kiiro' ────────────────────────────────────
  {
    id: 'cosmos-bipinnatus-kiiro',
    species: 'Cosmos bipinnatus',
    variety: 'Kiiro',
    latinName: 'Cosmos bipinnatus',
    name: {
      nl: 'Cosmea Kiiro',
      en: 'Cosmos Kiiro',
    },
    type: 'flower',
    calendar: {
      indoorSowing: [3, 5],
      greenhouse: null,
      outdoor: [5, 6],
    },
    germination: 'light',
    colors: ['yellow', 'cream', 'peach'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Konosu_Cosmos_Bipinnatus_Yellow_Campus_1.jpg/500px-Konosu_Cosmos_Bipinnatus_Yellow_Campus_1.jpg',
    maintenanceNotes: {
      nl: 'Japanse selectie. Lichtkiemer: zaden licht bedekken of verticaal in de grond plaatsen met het topje zichtbaar. Kiemt in 7-15 dagen bij 18-25°C. Knip de top af bij 2-3 bladparen. Niet te veel voeding geven. Wordt 90-110 cm hoog. Bloeit van juni tot oktober.',
      en: 'Japanese bred variety. Light germinator: lightly cover seeds or place vertically in soil with the tip visible. Germinates in 7-15 days at 18-25°C. Pinch tips at 2-3 leaf pairs. Do not over-feed. Reaches 90-110 cm tall. Blooms June to October.',
    },
    plantingConditions: ['tray', 'outside-direct', 'module-tray'],
    minDistanceCm: 30,
    stemTips: {
      nl: 'Oogst in het \'gebarsten knop\'-stadium voor langere vaaslevensduur. Zachtgele kleur vervaagt naar wit in het midden, achterkant van bloemblaadjes heeft perziktint. Vaaslevensduur 5-7 dagen.',
      en: 'Harvest at the "cracked bud" stage for longer vase life. Soft yellow colour fades to white at the centre, reverse of petals has a peach tinge. Vase life 5-7 days.',
    },
    sun: 'full-sun',
  },

  // ─── Beta vulgaris 'Burpee\'s Golden' ─────────────────────────────
  {
    id: 'beta-vulgaris-burpees-golden',
    species: 'Beta vulgaris',
    variety: "Burpee's Golden",
    latinName: 'Beta vulgaris',
    name: {
      nl: "Biet Burpee's Golden",
      en: "Beet Burpee's Golden",
    },
    type: 'vegetable',
    calendar: {
      indoorSowing: [2, 4],
      greenhouse: null,
      outdoor: [3, 7],
    },
    germination: 'dark',
    colors: ['golden yellow'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Golden_beets_in_a_pile.jpg/500px-Golden_beets_in_a_pile.jpg',
    maintenanceNotes: {
      nl: 'Donkerkiemer: zaai 1-2 cm diep. Week zaden een nacht in lauw water voor betere kieming. Gouden bieten kiemen trager dan rode variëteiten (14-21 dagen). Clusterkiem: meerdere zaailingen per zaad, dun uit tot 10 cm. Oogst bij 5-7 cm doorsnede (ca. 55 dagen). Blad is ook eetbaar.',
      en: 'Dark germinator: sow 1-2 cm deep. Soak seeds overnight in lukewarm water for better germination. Golden beets germinate slower than red varieties (14-21 days). Cluster seed: multiple seedlings per seed, thin to 10 cm. Harvest at 5-7 cm diameter (approx. 55 days). Leaves are also edible.',
    },
    plantingConditions: ['outside-direct', 'module-tray'],
    minDistanceCm: 10,
    stemTips: null,
    sun: 'full-sun',
  },

  // ─── Beta vulgaris 'Chioggia' ─────────────────────────────────────
  {
    id: 'beta-vulgaris-chioggia',
    species: 'Beta vulgaris',
    variety: 'Chioggia',
    latinName: 'Beta vulgaris',
    name: {
      nl: 'Rode biet Chioggia',
      en: 'Beet Chioggia',
    },
    type: 'vegetable',
    calendar: {
      indoorSowing: [2, 4],
      greenhouse: null,
      outdoor: [3, 7],
    },
    germination: 'dark',
    colors: ['red', 'white', 'pink'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Betterave_Rossa_di_Chioggia_Montpellier.JPG/500px-Betterave_Rossa_di_Chioggia_Montpellier.JPG',
    maintenanceNotes: {
      nl: 'Donkerkiemer: zaai 1-2 cm diep. Italiaanse erfgoedvariëteit met rood-witte ringen. Week zaden voor het zaaien. Clusterkiem: meerdere zaailingen per zaad, dun uit tot 10 cm. Kiemt in 5-10 dagen. Oogst jong (5-7 cm, ca. 50-60 dagen) voor de mooiste ringen. Niet te lang koken, anders verdwijnen de ringen.',
      en: 'Dark germinator: sow 1-2 cm deep. Italian heirloom variety with red-and-white candy stripes. Soak seeds before sowing. Cluster seed: multiple seedlings per seed, thin to 10 cm. Germinates in 5-10 days. Harvest young (5-7 cm, approx. 50-60 days) for the prettiest rings. Do not overcook or the rings will fade.',
    },
    plantingConditions: ['outside-direct', 'module-tray'],
    minDistanceCm: 10,
    stemTips: null,
    sun: 'full-sun',
  },

  // ─── Psylliostachys suworowii 'Pink Pokers' ──────────────────────
  {
    id: 'psylliostachys-suworowii-pink-pokers',
    species: 'Psylliostachys suworowii',
    variety: 'Pink Pokers',
    latinName: 'Psylliostachys suworowii',
    name: {
      nl: 'Statice Pink Pokers (Russische statice)',
      en: 'Russian Statice Pink Pokers',
    },
    type: 'flower',
    calendar: {
      indoorSowing: [2, 3],
      greenhouse: null,
      outdoor: null,
    },
    germination: 'light',
    colors: ['pink', 'rose'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Psylliostachys_suworowii_%28Plumbaginaceae%29_plant.JPG/500px-Psylliostachys_suworowii_%28Plumbaginaceae%29_plant.JPG',
    maintenanceNotes: {
      nl: 'Lichtkiemer: bedek zaden nauwelijks, bestrooi met fijn vermiculiet. Niet direct buiten zaaien. Koude stratificatie kan kieming verbeteren: 2-4 weken in vochtig keukenpapier bij 1-4°C in de koelkast. Kiemt in 7-14 dagen bij 20-25°C. Vormt eerst een lage bladrozet voordat bloemaren verschijnen. Goed gedraineerde grond essentieel.',
      en: 'Light germinator: barely cover seeds, dust with fine vermiculite. Do not direct sow outdoors. Cold stratification may improve germination: 2-4 weeks in moist paper towel at 1-4°C in fridge. Germinates in 7-14 days at 20-25°C. Forms a low leaf rosette first before flower spikes appear. Well-drained soil essential.',
    },
    plantingConditions: ['tray', 'module-tray'],
    minDistanceCm: 25,
    stemTips: {
      nl: 'Oogst wanneer de meeste bloemknoppen kleur tonen, bij droog weer. Pijpenragervormige aren van 20-40 cm. Uitstekend als droogbloem: hang ondersteboven op een droge, donkere plek. Behoudt kleur na het drogen.',
      en: 'Harvest when most florets show colour, during dry weather. Pipe-cleaner shaped spikes of 20-40 cm. Excellent dried flower: hang upside down in a dry, dark location. Retains colour after drying.',
    },
    sun: 'full-sun',
  },

  // ─── Antirrhinum majus 'Potomac Appleblossom' ───────────────────
  {
    id: 'antirrhinum-potomac-appleblossom',
    species: 'Antirrhinum majus',
    variety: 'Potomac Appleblossom',
    latinName: 'Antirrhinum majus',
    name: {
      nl: 'Leeuwenbek Potomac Appleblossom',
      en: 'Snapdragon Potomac Appleblossom',
    },
    type: 'flower',
    calendar: {
      indoorSowing: [1, 4],
      greenhouse: [3, 5],
      outdoor: null,
    },
    germination: 'light',
    colors: ['pink', 'white'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Antirrhinum_majus_Floral_Showers_Rose_Pink_1zz.jpg/500px-Antirrhinum_majus_Floral_Showers_Rose_Pink_1zz.jpg',
    maintenanceNotes: {
      nl: 'Rocket/single-stem type. Zaai oppervlakkig, niet bedekken; een dun laagje vermiculiet mag wel. Koude-stratificatie (2 dagen koelkast) bevordert kieming. Kiemt in 7-14 dagen bij 15-20°C. Niet toppen - eenstammig kweken voor lange, rechte stelen. Gevoelig voor roest en botrytis; zorg voor goede luchtcirculatie.',
      en: 'Rocket/single-stem type. Surface sow, do not cover; a thin layer of vermiculite is acceptable. Cold stratification (2 days refrigerator) improves germination. Germinates in 7-14 days at 15-20°C. Do not pinch - grow single stem for long, straight stems. Susceptible to rust and botrytis; ensure good air circulation.',
    },
    plantingConditions: ['tray', 'module-tray'],
    minDistanceCm: 10,
    stemTips: {
      nl: 'Oogst wanneer het onderste derde deel van de bloemen open is. Snij schuin af en zet direct in schoon water. Vaaslevensduur 7-10 dagen. Knip de stengeltop af om alle bloemen gelijkmatig te laten openen.',
      en: 'Harvest when the lower third of the florets are open. Cut at an angle and place directly in clean water. Vase life 7-10 days. Snip the stem tip to encourage all florets to open evenly.',
    },
    sun: 'full-sun',
  },

  // ─── Antirrhinum majus 'DoubleShot Peach F1' ───────────────────
  {
    id: 'antirrhinum-doubleshot-peach',
    species: 'Antirrhinum majus',
    variety: 'DoubleShot Peach F1',
    latinName: 'Antirrhinum majus',
    name: {
      nl: 'Leeuwenbek DoubleShot Peach',
      en: 'Snapdragon DoubleShot Peach',
    },
    type: 'flower',
    calendar: {
      indoorSowing: [1, 4],
      greenhouse: [3, 5],
      outdoor: null,
    },
    germination: 'light',
    colors: ['peach', 'apricot'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Antirrhinum_majus_Twinny_Peach_kz1.jpg/500px-Antirrhinum_majus_Twinny_Peach_kz1.jpg',
    maintenanceNotes: {
      nl: 'Dubbele/halfgevulde bloemen, goed vertakt. Zaai oppervlakkig bij 20-24°C. Kiemt in 10-21 dagen. Toppen wanneer zaailingen 10-15 cm hoog zijn voor meer vertakking en meerdere snijbloemen per plant. Hoogte 45-50 cm. Gevoelig voor wegval; gebruik goed drainerende grond.',
      en: 'Double/semi-double blooms, well branched. Surface sow at 20-24°C. Germinates in 10-21 days. Pinch when seedlings are 10-15 cm tall to encourage branching and multiple cut stems per plant. Height 45-50 cm. Sensitive to damping-off; use well-draining soil.',
    },
    plantingConditions: ['tray', 'module-tray', 'p9-pot'],
    minDistanceCm: 15,
    stemTips: {
      nl: 'Oogst wanneer de onderste helft van de bloemen open is. Dubbele bloemen houden langer dan enkele. Vaaslevensduur 7-10 dagen. Verwijder blad onder de waterlijn.',
      en: 'Harvest when the lower half of the florets are open. Double blooms last longer than singles. Vase life 7-10 days. Remove foliage below the waterline.',
    },
    sun: 'full-sun',
  },

  // ─── Scabiosa atropurpurea 'Summer Fruits' ─────────────────────
  {
    id: 'scabiosa-summer-fruits',
    species: 'Scabiosa atropurpurea',
    variety: 'Summer Fruits',
    latinName: 'Scabiosa atropurpurea',
    name: {
      nl: 'Duifkruid Summer Fruits',
      en: 'Pincushion Flower Summer Fruits',
    },
    type: 'flower',
    calendar: {
      indoorSowing: [2, 4],
      greenhouse: [3, 5],
      outdoor: [4, 6],
    },
    germination: 'light',
    colors: ['pink', 'red', 'lilac', 'purple', 'burgundy'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Scabiosa_atropurpurea_pincushion_flower_9854.jpg/500px-Scabiosa_atropurpurea_pincushion_flower_9854.jpg',
    maintenanceNotes: {
      nl: 'Zaai oppervlakkig of net bedekt bij 15-18°C. Kiemt in 7-14 dagen. Afharden en na laatste vorst uitplanten. Regelmatig uitgebloeide bloemen verwijderen verlengt de bloei aanzienlijk. Hoogte tot 90 cm. Zelf-zaaiend als bloemen blijven staan.',
      en: 'Surface sow or barely cover at 15-18°C. Germinates in 7-14 days. Harden off and plant out after last frost. Regular deadheading extends the flowering period significantly. Height up to 90 cm. Self-seeds if flowers are left on.',
    },
    plantingConditions: ['tray', 'module-tray', 'p9-pot', 'outside-direct'],
    minDistanceCm: 25,
    stemTips: {
      nl: 'Oogst wanneer de bloem net volledig open is. Vaaslevensduur 5-7 dagen. Ververs water regelmatig. De zaaddozen zijn ook decoratief in droogboeketten.',
      en: 'Harvest when the flower is just fully open. Vase life 5-7 days. Change water regularly. The seed pods are also decorative in dried arrangements.',
    },
    sun: 'full-sun',
  },

  // ─── Helianthus annuus 'ProCut Plum F1' ────────────────────────
  {
    id: 'helianthus-procut-plum',
    species: 'Helianthus annuus',
    variety: 'ProCut Plum F1',
    latinName: 'Helianthus annuus',
    name: {
      nl: 'Zonnebloem ProCut Plum',
      en: 'Sunflower ProCut Plum',
    },
    type: 'flower',
    calendar: {
      indoorSowing: [3, 4],
      greenhouse: null,
      outdoor: [5, 7],
    },
    germination: 'dark',
    colors: ['plum', 'burgundy', 'dark red'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Helianthus_ProCut_Plum.jpg/500px-Helianthus_ProCut_Plum.jpg',
    maintenanceNotes: {
      nl: 'Eenstammig, stuifmeelvrij. Zaai 1-1,5 cm diep bij 20-25°C. Kiemt in 7-14 dagen. Niet toppen. Direct buiten zaaien na laatste vorst of voorzaaien in diepe potten (wortel verstoring vermijden). Enkele stam, geen vertakking. Hoogte 140-180 cm. Ca. 60 dagen tot bloei in de zomer.',
      en: 'Single stem, pollenless. Sow 1-1.5 cm deep at 20-25°C. Germinates in 7-14 days. Do not pinch. Direct sow after last frost or start in deep pots (avoid root disturbance). Single stem, no branching. Height 140-180 cm. Approximately 60 days to bloom in summer.',
    },
    plantingConditions: ['outside-direct', 'p9-pot'],
    minDistanceCm: 15,
    stemTips: {
      nl: 'Oogst zodra de eerste bloemblaadjes beginnen te openen vanaf de bloemschijf. Verwijder 3/4 van de bladeren. Stuifmeelvrij = geen vlekken op tafellinnen. Vaaslevensduur 7-10 dagen.',
      en: 'Harvest as soon as the first petals begin to lift off the central disk. Strip three-quarters of the leaves. Pollenless = no stains on tablecloths. Vase life 7-10 days.',
    },
    sun: 'full-sun',
  },

  // ─── Craspedia globosa 'Drumstick' ─────────────────────────────
  {
    id: 'craspedia-drumstick',
    species: 'Craspedia globosa',
    variety: 'Drumstick',
    latinName: 'Craspedia globosa',
    name: {
      nl: 'Trommelstokjes Drumstick',
      en: 'Billy Buttons Drumstick',
    },
    type: 'flower',
    calendar: {
      indoorSowing: [2, 4],
      greenhouse: [3, 5],
      outdoor: null,
    },
    germination: 'light',
    colors: ['yellow', 'gold'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Craspedia_globosa.jpg/500px-Craspedia_globosa.jpg',
    maintenanceNotes: {
      nl: 'Lichtkiemer: zaai oppervlakkig, niet bedekken. Kiemt in 14-21 dagen bij 18-24°C. Houd vochtig maar niet drassig. Uitplanten na laatste vorst. Heeft minimaal 6-8 uur direct zonlicht nodig voor bloei. Droogtetolerant eenmaal gevestigd. Hoogte 50-70 cm.',
      en: 'Light germinator: surface sow, do not cover. Germinates in 14-21 days at 18-24°C. Keep moist but not waterlogged. Plant out after last frost. Needs at least 6-8 hours of direct sunlight for blooming. Drought tolerant once established. Height 50-70 cm.',
    },
    plantingConditions: ['tray', 'module-tray', 'p9-pot'],
    minDistanceCm: 25,
    stemTips: {
      nl: 'Oogst wanneer de bloemhoofden volledig open en goudgeel zijn. Uitstekende droogbloem: hang ondersteboven op een droge, donkere plek. Vaaslevensduur vers 7-10 dagen; gedroogd onbeperkt.',
      en: 'Harvest when flower heads are fully open and uniformly golden. Excellent dried flower: hang upside down in a dry, dark place. Vase life fresh 7-10 days; dried indefinitely.',
    },
    sun: 'full-sun',
  },

  // ─── Helianthus annuus 'Astra Rose Cream' ──────────────────────
  {
    id: 'helianthus-astra-rose-cream',
    species: 'Helianthus annuus',
    variety: 'Astra Rose Cream',
    latinName: 'Helianthus annuus',
    name: {
      nl: 'Zonnebloem Astra Rose Cream',
      en: 'Sunflower Astra Rose Cream',
    },
    type: 'flower',
    calendar: {
      indoorSowing: [3, 4],
      greenhouse: null,
      outdoor: [5, 6],
    },
    germination: 'dark',
    colors: ['rose', 'cream', 'pink', 'dusty pink'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Sunflower_%22Strawberry_Blonde%22_%283931552086%29.jpg/500px-Sunflower_%22Strawberry_Blonde%22_%283931552086%29.jpg',
    maintenanceNotes: {
      nl: 'Meerbloemig/vertakkend type - meerdere bloemen per plant. Zaai 1 cm diep bij 20-25°C. Kiemt in 7-14 dagen. Heeft stuifmeel (niet stuifmeelvrij). Direct zaaien na laatste vorst of voorzaaien. Hoogte ca. 100-150 cm. Bloeit langer dan eenstammige types. Regelmatig water geven tijdens groei.',
      en: 'Multi-branching type - multiple flowers per plant. Sow 1 cm deep at 20-25°C. Germinates in 7-14 days. Has pollen (not pollenless). Direct sow after last frost or start indoors. Height approx. 100-150 cm. Flowers over a longer period than single-stem types. Water regularly during growth.',
    },
    plantingConditions: ['outside-direct', 'p9-pot', 'big-pot'],
    minDistanceCm: 45,
    stemTips: {
      nl: 'Oogst wanneer bloemblaadjes net beginnen te openen. Vertakkend type geeft meerdere, kleinere bloemen - ideaal voor boeketten. Vaaslevensduur 7-10 dagen. Let op: heeft stuifmeel dat kan vlekken.',
      en: 'Harvest when petals just begin to open. Branching type yields multiple, smaller flowers - ideal for bouquets. Vase life 7-10 days. Note: has pollen that can stain.',
    },
    sun: 'full-sun',
  },

  // ─── Eschscholzia californica 'Thai Silk Pink Champagne' ───────
  {
    id: 'eschscholzia-thai-silk-pink-champagne',
    species: 'Eschscholzia californica',
    variety: 'Thai Silk Pink Champagne',
    latinName: 'Eschscholzia californica',
    name: {
      nl: 'Californische klaproos Thai Silk Pink Champagne',
      en: 'California Poppy Thai Silk Pink Champagne',
    },
    type: 'flower',
    calendar: {
      indoorSowing: null,
      greenhouse: null,
      outdoor: [3, 5],
    },
    germination: 'light',
    colors: ['pink', 'cream', 'apricot', 'peach'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Flower%2C_California_poppy_%22Purple_Cream%22_-_Flickr_-_nekonomania.jpg/500px-Flower%2C_California_poppy_%22Purple_Cream%22_-_Flickr_-_nekonomania.jpg',
    maintenanceNotes: {
      nl: 'Ter plaatse zaaien - verplanten verdragen klaprozen slecht door penwortel. Zaai oppervlakkig op geharkte grond. Koude stratificatie (1 week koelkast) bevordert kieming. Kiemt in 14-21 dagen bij 15-20°C. Dunnen op 15 cm. Droogtetolerant. Zelf-zaaiend. Hoogte 45-50 cm. Bloeit na ca. 75 dagen.',
      en: 'Direct sow in place - poppies transplant poorly due to taproot. Surface sow on raked soil. Cold stratification (1 week refrigerator) improves germination. Germinates in 14-21 days at 15-20°C. Thin to 15 cm. Drought tolerant. Self-seeding. Height 45-50 cm. Flowers after approx. 75 days.',
    },
    plantingConditions: ['outside-direct'],
    minDistanceCm: 15,
    stemTips: {
      nl: 'Beperkt bruikbaar als snijbloem. Oogst in gekleurd knopstadium. Individuele bloemen houden 3-4 dagen, maar nieuwe knoppen op de stengel openen daarna. Verschroei de stengeluiteinden kort met een vlam of heet water voor betere wateropname.',
      en: 'Limited use as cut flower. Harvest at colored bud stage. Individual flowers last 3-4 days, but new buds on the stem open afterwards. Sear the stem ends briefly with a flame or hot water for better water uptake.',
    },
    sun: 'full-sun',
  },

  // ─── Helianthus annuus 'ProCut White Nite F1' ──────────────────
  {
    id: 'helianthus-procut-white-nite',
    species: 'Helianthus annuus',
    variety: 'ProCut White Nite F1',
    latinName: 'Helianthus annuus',
    name: {
      nl: 'Zonnebloem ProCut White Nite',
      en: 'Sunflower ProCut White Nite',
    },
    type: 'flower',
    calendar: {
      indoorSowing: [3, 4],
      greenhouse: null,
      outdoor: [5, 7],
    },
    germination: 'dark',
    colors: ['ivory', 'white', 'cream'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Helianthus_annuus_%27Italian_White%27_kz1.jpg/500px-Helianthus_annuus_%27Italian_White%27_kz1.jpg',
    maintenanceNotes: {
      nl: 'Eenstammig, stuifmeelvrij. Zaai 1-1,5 cm diep bij 20-25°C. Kiemt in 7-14 dagen. Niet toppen. Ivoorkleurige bloemblaadjes met donkerbruin hart. Hoogte 150-180 cm. Ca. 60-65 dagen tot bloei. Successiezaai elke 2 weken voor doorlopende oogst.',
      en: 'Single stem, pollenless. Sow 1-1.5 cm deep at 20-25°C. Germinates in 7-14 days. Do not pinch. Ivory petals with dark chocolate-brown center. Height 150-180 cm. Approx. 60-65 days to bloom. Succession sow every 2 weeks for continuous harvest.',
    },
    plantingConditions: ['outside-direct', 'p9-pot'],
    minDistanceCm: 15,
    stemTips: {
      nl: 'Oogst zodra de eerste bloemblaadjes beginnen omhoog te komen van de bloemschijf. Verwijder 3/4 van de bladeren. Stuifmeelvrij = schoon in boeketten. Vaaslevensduur 7-10 dagen.',
      en: 'Harvest as soon as the first petals start to lift from the disk. Strip three-quarters of the leaves. Pollenless = clean in bouquets. Vase life 7-10 days.',
    },
    sun: 'full-sun',
  },

  // ─── Trachymene coerulea 'Lacy Blue' ───────────────────────────
  {
    id: 'trachymene-lacy-blue',
    species: 'Trachymene coerulea',
    variety: 'Lacy Blue',
    latinName: 'Trachymene coerulea',
    name: {
      nl: 'Kantbloem Lacy Blue',
      en: 'Blue Lace Flower Lacy Blue',
    },
    type: 'flower',
    calendar: {
      indoorSowing: [2, 4],
      greenhouse: [3, 5],
      outdoor: null,
    },
    germination: 'dark',
    colors: ['lavender', 'pale blue', 'blue'],
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/%E8%97%8D%E9%A3%BE%E5%B8%B6%E8%8A%B1_Trachymene_coerulea_%28Didiscus_coeruleus%29_-%E9%A6%99%E6%B8%AF%E8%8A%B1%E5%B1%95_Hong_Kong_Flower_Show-_%289198168557%29.jpg/500px-%E8%97%8D%E9%A3%BE%E5%B8%B6%E8%8A%B1_Trachymene_coerulea_%28Didiscus_coeruleus%29_-%E9%A6%99%E6%B8%AF%E8%8A%B1%E5%B1%95_Hong_Kong_Flower_Show-_%289198168557%29.jpg',
    maintenanceNotes: {
      nl: 'Donkerkiemer: bedek zaad volledig (3 mm diep) en dek af met krant tot kieming. Kiemt in 15-22 dagen bij 18-22°C. Alleen van onderaf water geven. Grondtemperatuur moet boven 20°C zijn voor kieming. Haat wortelstoring - voorzaaien in diepe modules of P9-potten. Hoogte 60-75 cm. Presteert beter bij koeler weer.',
      en: 'Dark germinator: cover seed completely (3 mm deep) and cover tray with newspaper until germination. Germinates in 15-22 days at 18-22°C. Water only from the base. Soil temperature must be above 20°C for germination. Dislikes root disturbance - start in deep modules or P9 pots. Height 60-75 cm. Performs better in cooler weather.',
    },
    plantingConditions: ['module-tray', 'p9-pot'],
    minDistanceCm: 20,
    stemTips: {
      nl: 'Oogst wanneer de helft van de bloemetjes in het scherm open is. Lange, stevige stelen - ideaal voor arrangementen. Vaaslevensduur tot 10 dagen. Snij in het koelste deel van de dag.',
      en: 'Harvest when half of the florets on the umbel are open. Long, stiff stems - ideal for arrangements. Vase life up to 10 days. Cut in the coolest part of the day.',
    },
    sun: 'full-sun',
  },
];

export default plants;

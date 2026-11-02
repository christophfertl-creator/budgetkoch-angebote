/**
 * Ordnet Angebotsprodukte den Rezept-Zutaten der App zu (Schlüssel wie in src/data/products.ts).
 * Jede Regel: Muster im Produktnamen, Ausschlusswörter, erwartete Einheit.
 * Lieber ein Produkt zu wenig zuordnen als ein falsches (z. B. "Knorr Basis für Faschiertes").
 */
const FIX_EXCLUDE = /knorr|maggi|basis f|fix f|würzmischung|cup\b|noodle|dip\b|chips|snack|\beis\b|eiscreme|pralinen|katze|hund/i;

const RULES = [
  ['huhn', 'g', /(h(ü|ue)hner|hendl|h(ä|ae)hnchen|maishendl|puten)[\s-]*(brust|filet|schnitzel|filetschnitzel)|filetschnitzel/i, /wurst|schinken|aufschnitt|nugget|backhendl|paniert|streifen|suppe|pastete|extrawurst|cordon/i],
  ['faschiertes', 'g', /faschiert/i, /laibchen|auflauf|lasagne|knödel/i],
  ['schwein', 'g', /schwein\w*[\s-]*(schnitzel|karree|lungenbraten|filet)|schnitzel vom schwein/i, /paniert|wurst|schinken/i],
  ['lachs', 'g', /lachs/i, /forelle|schinken|creme|aufstrich|ketakaviar|pastete/i],
  ['speck', 'g', /speck|bauchfleisch/i, /knödel|würfel vegan|pastete/i],
  ['wuerstel', 'g', /frankfurter|würstel|wiener\b|krainer|sacherwürstel/i, /senf|gusto|aufschnitt|schnitzel/i],
  ['nudeln', 'g', /spaghetti|penne|fusilli|nudeln|hörnchen|farfalle|tagliatelle|linguine|rigatoni|spiralen|fettuccine|conchiglie|castellane|treccine|fleckerl|maccheroni/i, /mohnnudeln|lasagne|suppe|spätzle|low carb|protein|fertig|frittaten|chilinudeln|knoblauchnudeln|fadennudeln/i],
  ['reis', 'g', /\breis\b|langkorn|basmati|rundkorn|jasmin\w* ?reis|risotto/i, /reisfleisch|waffel|milchreis|drink/i],
  ['kartoffeln', 'g', /erd(ä|ae)pfel|kartoffel/i, /salat|gratin|auflauf|püree|knödel|gulasch|puffer|rösti|pommes|kroketten|wedges/i],
  ['mehl', 'g', /mehl\b|mehl /i, /glutenfrei|pizzamix|backmischung|mandelmehl/i],
  ['brot', 'g', /baguette|brot\b|brot |wecken|semmel|ciabatta|sandwich/i, /knäcke|crisp|brösel|aufstrich|zwieback|brötle|chips/i],
  ['zwiebeln', 'g', /zwiebel/i, /senf|ketchup|rostbraten|ring|röst|creme/i],
  ['karotten', 'g', /karotte/i, /salat|saft|sellerie|erbsen/i],
  ['paprika', 'g', /paprika/i, /chili|creme|ketchup|rahm|pulver|hatschek|grilltaler|pute|salat|mark|edelsüß|gewürz|würz/i],
  ['tomaten', 'g', /paradeiser|tomate/i, /pesto|sauce|sugo|ketchup|passiert|mark|getrocknet|basilikum|mozzarella|provence|salsa|pizza|suppe|dose|stück/i],
  ['zucchini', 'g', /zucchini/i, /salat/i],
  ['brokkoli', 'g', /brokkoli|broccoli/i, /auflauf/i],
  ['champignons', 'g', /champignon/i, /aufschnitt|wurst|sauce|cremesuppe/i],
  ['spinat', 'g', /spinat/i, /pesto|knödel|strudel|tasche/i],
  ['salat', 'stk', /eisberg|häuptel|kopfsalat|salatherz|blattsalat|lollo|römersalat/i, /dressing/i],
  ['gurke', 'stk', /salatgurke|gurke\b/i, /gurkerl|gürkchen|salat|essig|primeur/i],
  ['kuerbis', 'g', /kürbis\b|hokkaido|butternuss/i, /kernöl|kerne|backhendl|suppe/i],
  ['eier', 'stk', /\beier\b|freilandeier|bodenhaltung|eier m\b|eier l\b/i, /nockerl|likör|teigwaren|nudeln|spätzle|salat|aufstrich/i],
  ['milch', 'ml', /vollmilch|frischmilch|haltbarmilch|leichtmilch|\bmilch\b/i, /schoko|brötle|reis|kaffee|kärntnermilch|tirol milch|milka|\beis\b|joghurt|dessert|drink|käse|pudding|kipferl|sandwich/i],
  ['obers', 'ml', /schlagobers|\bobers\b|kochobers|schlagrahm|sahne/i, /sauerrahm|\beis\b|dessert|sauce|torte|kuchen/i],
  ['sauerrahm', 'g', /sauerrahm/i, /dip|chips/i],
  ['kaese', 'g', /gouda|emmentaler|edamer|bergkäse|tilsiter|österkron|bergbaron|drautaler|käse gerieben|reibkäse|mozzarella gerieben/i, /wurst|leberkäse|crackets|cracker|sauce|goldfish|goldfischli|twister|grilltaler|knödel|spätzle|kuchen|gebäck/i],
  ['mozzarella', 'g', /mozzarella/i, /pizza|lasagne|sticks|gerieben/i],
  ['feta', 'g', /\bfeta\b|schafkäse|hirtenkäse|balkankäse/i, /creme|aufstrich/i],
  ['butter', 'g', /\bbutter\b|teebutter|kochbutter|almbutter|süßrahmbutter/i, /toast|croissant|keks|milch|brezel|kekse|schmalz|plunder|kuchen|streich/i],
  ['topfen', 'g', /topfen/i, /golatsche|tasche|strudel|knödel|kuchen|creme|dessert|palatschinken/i],
  ['joghurt', 'g', /joghurt/i, /dressing|drink|riegel|\beis\b|müsli|schoko/i],
  ['aepfel', 'g', /(?<!erd)äpfel|\bapfel\b/i, /salat|chips|saft|mus|strudel|essig|saurer|ketchup|kuchen|tasche|zimt|cider/i],
  ['bananen', 'g', /banane/i, /eis|chips|cremissimo|milch|brot/i],
  ['beeren', 'g', /beeren|himbeer|heidelbeer|erdbeer|brombeer/i, /konfitüre|marmelade|\beis\b|joghurt|tasche|knödel|goji|cran|sirup|saft|dessert|cheesecake|zitrone|aufstrich|tee/i],
  ['schokolade', 'g', /schokolade|kochschokolade|zartbitter|blockschokolade/i, /donut|dessert|brötle|streudekor|müsli|nutella|riegel|keks|pudding|drink/i],
  ['passata', 'ml', /passiert|passata/i, /suppe/i],
  ['linsen', 'g', /linsen/i, /suppe|eintopf|chips|nudeln/i],
  ['kichererbsen', 'g', /kichererbsen/i, /chips|snack|hummus/i],
  ['kokosmilch', 'ml', /kokosmilch|kokosnussmilch/i, /drink|eis/i],
];

/** g ↔ ml werden bei flüssigen bzw. passierten Zutaten gleich behandelt (1 g ≈ 1 ml). */
const COMPATIBLE = { g: ['g'], ml: ['ml', 'g'], stk: ['stk'] };

export function matchIngredient(offer) {
  const text = `${offer.name}`;
  if (FIX_EXCLUDE.test(text)) return null;
  for (const [key, unit, include, exclude] of RULES) {
    if (!include.test(text) || exclude.test(text)) continue;
    if (!COMPATIBLE[unit].includes(offer.unit)) continue;
    // Unrealistische Packungsgrößen aussortieren (Großgebinde, Fehler in den Daten)
    if (offer.unit !== 'stk' && (offer.packSize < 50 || offer.packSize > 5000)) continue;
    if (offer.unit === 'stk' && offer.packSize > 30) continue;
    return { key, unit };
  }
  return null;
}

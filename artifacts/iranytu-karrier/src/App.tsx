
declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          theme?: 'auto' | 'light' | 'dark';
        }
      ) => string;
      remove: (widgetId: string) => void;
      getResponse: (widgetId?: string) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, Router as WouterRouter, useLocation } from 'wouter';
import { ArrowRight, ChevronDown, Menu, X } from 'lucide-react';
import { videos } from './data/videos';
import { privacyPageCopy } from './data/privacy';

const TURNSTILE_SITE_KEY = "0x4AAAAAAFvbobTeN6uJCE6z";
const turnstileWidgetIds: Record<string, string> = {};

type Language = 'hu' | 'de' | 'en';
type PageKey = 'home' | 'about' | 'career' | 'mentoring' | 'supervision' | 'workshops' | 'prices' | 'articles' | 'videos' | 'faq' | 'contact' | 'privacy' | 'imprint';
type NonHomePage = Exclude<PageKey, 'home'>;
type NavPage = 'about' | 'prices' | 'contact';
type MenuPage = 'career' | 'supervision' | 'workshops' | 'articles' | 'videos' | 'faq';
type VideoResource = { title: string; description: string; url: string };

const contactAddress = 'michaela.kovacs2025@gmail.com';
const publicAsset = (file: string) => `${import.meta.env.BASE_URL}${file}`;

function getVideoEmbedUrl(source: string) {
  try {
    const url = new URL(source);
    const host = url.hostname.toLowerCase();
    const segments = url.pathname.split('/').filter(Boolean);

    if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'].includes(host)) {
      const markerIndex = segments.findIndex((segment) => segment === 'embed' || segment === 'shorts');
      const videoId = host === 'youtu.be'
        ? segments[0]
        : url.searchParams.get('v') || (markerIndex >= 0 ? segments[markerIndex + 1] : undefined);
      return videoId && /^[A-Za-z0-9_-]{11}$/.test(videoId)
        ? `https://www.youtube-nocookie.com/embed/${videoId}`
        : null;
    }

    if (['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'].includes(host)) {
      const videoId = host === 'player.vimeo.com' && segments[0] === 'video'
        ? segments[1]
        : segments[0];
      return videoId && /^\d+$/.test(videoId)
        ? `https://player.vimeo.com/video/${videoId}`
        : null;
    }
  } catch {
    return null;
  }

  return null;
}

const paths: Record<PageKey, string> = {
  home: '/', about: '/rolam', career: '/szolgaltatasok/karrier', mentoring: '/szolgaltatasok/mentoralas',
  supervision: '/szolgaltatasok/szupervizio', workshops: '/szolgaltatasok/csoportos-workshopok',
  prices: '/arak', articles: '/tudastar/cikkek', videos: '/tudastar/videok', faq: '/tudastar/gyakori-kerdesek',
  contact: '/kapcsolat', privacy: '/adatkezeles', imprint: '/impresszum',
};

const copy = {
  hu: {
    brand: 'Iránytű Neurodiverz Karrier Műhely', tagline: 'Karrier a saját utadon',
    nav: { about: 'Rólam', services: 'Szolgáltatások', career: 'Karrier mentorálás', mentoring: 'Mentorálás', supervision: 'Szupervízió', workshops: 'Csoportos workshopok', prices: 'Árak', library: 'Tudástár', articles: 'Cikkek', videos: 'Videók', faq: 'Gyakori kérdések', contact: 'Kapcsolat' },
    homeEyebrow: 'Karriertámogatás autista és ADHD-s felnőtteknek',
    homeTitle: 'Találd meg a hozzád illő irányt a munka világában.', 
    homeNote: 'Nem kell másnak lenned ahhoz, hogy megtaláld a helyed a munka világában.',
    homeIntro: 'Autista és ADHD-s felnőttek karrierútját támogatom abban, hogy jobban megismerjék a saját erősségeiket, felismerjék a számukra megfelelő munkakörnyezetet, és tudatosabban alakítsák a munka világában megtett útjukat.',
    introCta: 'Díjmentes első beszélgetést kérek',
    problemTitle: 'Amikor nem a képességeiddel van a probléma',
    problemText: 'Lehet, hogy vannak feladatok, amelyekben igazán jó vagy, mégis nehezen találod a helyed a munka világában. Számít a környezet, a feladatok jellege, az elvárások egyértelműsége, a kommunikáció, a társas és érzékszervi terhelés – és az is, mennyire dolgozhatsz a saját munkastílusod szerint.',
    methodTitle: 'A saját működésedből indulunk ki.',
    methodText: 'Nem azt keressük, hogyan kellene másokhoz alkalmazkodnod, hanem azt, hogy milyen feladatok, körülmények és munkavégzési módok segíthetik, hogy a képességeidet jobban ki tudd bontakoztatni.',
    servicesTitle: 'Miben segíthet az Iránytű?',
    servicesIntro: 'A közös munka a te helyzetedből és kérdéseidből indul ki. Egyéni folyamatban és csoportos alkalmakon is gyakorlati kapaszkodókat keresünk.',
    careerTitle: 'Egyéni karrier mentorálás',
    careerText: 'Álláskeresés, pályaváltás vagy munkahelyi elakadások: együtt térképezzük fel az erősségeidet, céljaidat és a számodra fontos munkafeltételeket.',
    workshopTitle: 'Csoportos workshopok',
    workshopText: 'Gyakorlati feladatok, közös gondolkodás és mások tapasztalatai segíthetnek önmagad és a munka világának jobb megértésében.',
    readMore: 'Tovább olvasok', processTitle: 'Hogyan dolgozunk együtt?',
    process: ['A te kérdésedből indulunk.', 'Feltérképezzük az erősségeidet és munkastílusodat.', 'Megnézzük, mi segíti vagy nehezíti a működésedet.', 'Gyakorlati következő lépéseket fogalmazunk meg.'],
    processDesc: ['Nem kell kész válaszokkal érkezned.', 'Ami neked fontos, arra figyelünk.', 'A környezetet és az elvárásokat is számításba vesszük.', 'Olyan megoldást keresünk, amit a saját helyzetedben is használhatsz.'],
    quote: 'A cél nem az, hogy egy általános mintához igazodj. Azt keressük, milyen lehetőségek illenek hozzád.',
    whyTitle: 'Tapasztalat a munka világából, figyelem az egyéni működésre.',
    whyText: 'Kovács Michaela vagyok. Húszéves HR szakmai tapasztalattal és HR vezetői háttérrel ismerem a munkahelyek működését, a munkáltatói elvárásokat és a kiválasztási folyamatokat. Szupervizorként fontosnak tartom a reflektív gondolkodás támogatását, a saját működés mélyebb megértését és az egyéni megoldások megtalálásának elősegítését.',
    meet: 'Ismerj meg közelebbről', nextTitle: 'Találjuk meg a következő lépést!',
    nextText: 'Ha még nem tudod pontosan, milyen támogatásra lenne szükséged, egy 30 perces, díjmentes első beszélgetésen áttekinthetjük a helyzetedet, a céljaidat és a lehetséges együttműködést. Az első beszélgetés nem jelent elköteleződést.',
    page: {
      about: ['Kovács Michaela – karrier- és pályaorientációs mentor és szupervizor autista és ADHD-s személyek számára', 'HR-tapasztalattal és szupervizori szemlélettel támogatom a saját karrierutadat.'],
      career: ['Egyéni karrier mentorálás autista és ADHD-s felnőtteknek', 'Találd meg, milyen munkában és munkakörnyezetben tudsz jól működni.'],
      mentoring: ['Mentorálás, a saját kérdéseid mentén', 'Az egyéni folyamat a te helyzetedhez igazodik; a munkahelyi elakadásoktól a következő karrierlépésig.'],
      supervision: ['Egyéni és csoportos szupervízió autista és ADHD-s felnőtteknek', 'Értsd meg jobban a helyzeteidet, a reakcióidat és a saját lehetőségeidet!'],
      workshops: ['Csoportos programok és workshopok', 'Tanulj, gondolkodj és fedezd fel a saját lehetőségeidet – a saját tempódban.'],
      prices: ['Árak és keretek', 'Átlátható feltételek, elköteleződés nélkül induló első beszélgetés.'],
      articles: ['Neurodiverz Karrier – tudástár', 'Gondolatok és gyakorlati útmutatók a munka világához.'],
      videos: ['Videók', 'Rövid, hozzáférhető gondolatok a neurodiverz karrierút témáiról.'],
      faq: ['Gyakori kérdések', 'A kezdés előtt felmerülő kérdésekre itt találsz választ.'],
      contact: ['Tegyük meg együtt az első lépést!', 'Lehet, hogy már pontosan tudod, miben szeretnél előrelépni. Az is lehet, hogy még csak azt érzed, valami nem működik úgy, ahogyan szeretnéd. Mindkettő jó kiindulópont.'],
      privacy: ['Adatkezelési tájékoztató', 'Tájékoztató a weboldalon megadott adatok és a kapcsolatfelvétel kezeléséről.'],
      imprint: ['Impresszum', 'A vállalkozási és kapcsolattartási adatok megadása után véglegesíthető.'],
    },
    supervisionParagraphs: [
      'A szupervízió olyan reflektív folyamat, amelyben lehetőséged van megállni, és egy számodra fontos munkahelyi vagy szakmai élethelyzetre alaposabban ránézni. A fókusz azon van, hogyan éled meg az adott helyzetet, milyen érzések, gondolatok és reakciók jelennek meg benned, és milyen új nézőpontokat, lehetőségeket fedezhetsz fel.',
      'Az egyéni szupervízióban a saját kérdéseddel dolgozunk. Megvizsgálhatod például a munkahelyi konfliktusokat, a kommunikációs nehézségeket, a határaidat, a szerepeidet vagy a visszatérő helyzeteket, amelyek foglalkoztatnak. A közös gondolkodás segíthet jobban megérteni saját működésedet és tudatosabban alakítani a következő lépéseidet.',
      'A csoportos szupervízióban egy támogató közegben dolgozhatsz a téged foglalkoztató helyzeteken. Mások tapasztalatai és nézőpontjai új felismerésekhez vezethetnek, miközben te is hozzájárulhatsz a közös gondolkodáshoz.',
      'A szupervízió nem arról szól, hogy megmondjuk, mit kellene másképp csinálnod. Abban támogat, hogy jobban megértsd a saját helyzetedet, felismerd a lehetőségeidet, és megtaláld a számodra megfelelő megoldásokat.',
      'A középpontban te vagy: a tapasztalataid, a megéléseid és az, ahogyan a saját helyzeteidre ránézel.',
    ],
    sections: { about: 'Miért hoztam létre az Iránytűt?', approach: 'Hogyan gondolkodom a karrierről?', brings: 'Amivel támogatlak', forWhom: 'Kivel dolgozom együtt?', situations: 'Neked szólhat a karrier mentorálás, ha…', questions: 'Milyen kérdésekkel dolgozhatunk?', how: 'Hogyan zajlik a közös munkánk?', rates: 'Díjak és jelentkezés', goodToKnow: 'Amit érdemes tudnod', groups: 'Milyen csoportos alkalmak vannak?', blog: 'Olvass, gondolkodj, próbáld ki!', getInTouch: 'Hogyan veheted fel velem a kapcsolatot?', after: 'Mi történik a jelentkezés után?' },
    aboutText: 'Húsz éve dolgozom a HR területén, HR vezetőként pedig közelről ismertem meg a munkahelyek működését, a munkáltatói elvárásokat, a kiválasztási folyamatokat és azokat a helyzeteket, amelyekben a munkavállalóknak és a szervezeteknek egyaránt döntéseket kell hozniuk. Szupervizorként fontosnak tartom a reflektív gondolkodás támogatását, a saját működés mélyebb megértését és az egyéni megoldások megtalálásának elősegítését. Ezt a két szakmai nézőpontot kapcsolom össze az Iránytűben.',
    aboutWhy: 'Az Iránytűt azért hoztam létre, hogy támogatást nyújtsak a saját működés megértésében, a felmerülő kérdések átgondolásában és az egyéni megoldások megtalálásában, elfogadó és ítélkezésmentes szemlélettel.',
    experience: ['HR-tapasztalattal: Segítek eligazodni a munka világában, jobban megérteni a munkáltatói elvárásokat és átlátni a munkahelyi helyzeteket.', 'Önismerettel és reflektív gondolkodással: Közösen ránézünk arra, hogyan működsz, mi okoz nehézséget, és milyen erősségekre építhetsz.', 'Gyakorlati megoldásokkal: Abban támogatlak, hogy a felismeréseidből számodra megvalósítható lépések és tudatosabb karrierdöntések szülessenek.', 'A saját utad megtalálásában: Figyelembe vesszük az egyéni erősségeidet, céljaidat és szükségleteidet, hogy olyan munkát és munkahelyi környezetet találj, amelyben jól érezheted magad, és kibontakoztathatod a képességeidet.'],
    careerList: ['autista vagy ADHD-s felnőttként szeretnél állást találni;', 'pályaválasztás vagy pályaváltás előtt állsz;', 'nem tudod pontosan, milyen munkakörnyezet illik hozzád;', 'nehezen tudod megmutatni az erősségeidet az álláskeresés során;', 'az állásinterjúk vagy a munkahelyi kommunikáció kihívást jelentenek;', 'szeretnéd tudatosabban képviselni a saját szükségleteidet.'],
    topics: ['Saját erősségeim és képességeim', 'Munkakörnyezet és munkahelyi illeszkedés', 'Álláskeresés és álláshirdetések', 'Állásinterjú és önbemutatás', 'Munkahelyi önérvényesítés'],
    topicAnswers: ['Miben vagyok jó? Milyen feladatokban tudok elmélyülni, és hogyan tudom megmutatni a képességeimet?', 'Milyen munkatempó, struktúra, kommunikáció és környezet támogatja a működésemet?', 'Hogyan értelmezzem az elvárásokat, és mely lehetőségek illenek az igényeimhez?', 'Hogyan mutassam be a tapasztalataimat, és hogyan készüljek fel a nehéz kérdésekre?', 'Hogyan fogalmazzam meg a kéréseimet egyértelműen, és milyen megoldások jöhetnek szóba?'],
    steps: ['Először áttekintjük, miért kerestél meg és mit szeretnél elérni.', 'Feltérképezzük a releváns erősségeket, nehézségeket és körülményeket.', 'Gyakorlati feladatokkal, kérdésekkel és közös gondolkodással dolgozunk.', 'A végén megfogalmazzuk a számodra hasznos következő lépéseket.'],
    workshops: [
      ['Álláskeresési workshop', 'Saját erősségek, érdeklődés és munkastílus; álláshirdetések értelmezése; megfelelő munkakörnyezet; felkészülés az állásinterjúra; személyes következő lépések.'],
      ['Önismeret és munkahelyi önérvényesítés', 'Gyakorlati helyzetekben gondolkodunk a kérések megfogalmazásáról, a határok kijelöléséről, a világos kommunikációról és a megfelelő munkahelyi megoldások kereséséről.'],
      ['Energiamenedzsment a munkahelyen', 'Feltérképezzük, mi tölt fel és mi merít ki, hogyan hat ránk a környezet és a kommunikáció, és milyen változtatások segíthetik a fenntarthatóbb munkavégzést.'],
      ['Csoportos szupervízió neurodivergens felnőtteknek', 'Bizalmi keretek között gondolkodunk a tapasztalatokról, dilemmákról és lehetséges nézőpontokról. A szupervízió nem tanácsadás és nem terápia.'],
    ],
    pricesTitle: 'Egyéni karrier mentorálás', price: 'Bruttó 15 000 Ft', priceUnit: '/ 60 perces alkalom',
    priceExplain: 'Ha még nem tudod pontosan, milyen támogatásra lenne szükséged, egy 30 perces, díjmentes első beszélgetésen áttekinthetjük a helyzetedet, a céljaidat és a lehetséges együttműködést. Az első beszélgetés nem jelent elköteleződést.',
    trust: 'A karrier mentorálás nem állásközvetítés, nem garantál elhelyezkedést, és nem helyettesíti a pszichológiai vagy egészségügyi ellátást.',
    knowledge: ['Munkahelyi illeszkedés', 'Erősségek és önismeret', 'Álláskeresés és állásinterjú', 'Munkahelyi jóllét és energiamenedzsment'],
    knowledgeText: ['Nemcsak az számít, mire vagy képes. Az is fontos, milyen körülmények között tudod a legjobban használni a képességeidet.', 'A saját erősségeid felismerése segíthet tudatosabban választani, és megfogalmazni, mit tudsz hozzáadni egy szervezethez.', 'Gyakorlati szempontok az álláshirdetések értelmezéséhez, a felkészüléshez és a tapasztalataid bemutatásához.', 'A terhelés, a környezet, a kommunikáció és a regenerálódás lehetőségei is meghatározóak.'],
    faqs: [
      ['Csak diagnózissal lehet hozzád fordulni?', 'A szolgáltatás elsődleges célcsoportja az autista és ADHD-s felnőttek köre. Ha bizonytalan vagy, az első beszélgetés során áttekinthetjük az igényeidet és a szolgáltatás kereteit. A kapcsolatfelvételi űrlapon nem szükséges diagnózisadatot megadnod.'],
      ['Mennyibe kerül a karrier mentorálás?', 'Egy 60 perces alkalom díja bruttó 15 000 Ft. Az első beszélgetés 30 percig tart, és díjmentes.'],
      ['Kötelező folytatnom az első beszélgetés után?', 'Nem. Az első beszélgetés célja a helyzet és a lehetséges együttműködés áttekintése. Utána te döntöd el, szeretnéd-e folytatni.'],
      ['Hány alkalomra lesz szükségem?', 'Ez a kérdésedtől és a céljaidtól függ. A folyamatot közösen alakítjuk ki.'],
      ['Online vagy személyesen zajlik a mentorálás?', 'A pontos lehetőségeket és az elérhető formákat a kapcsolatfelvételkor egyeztetjük.'],
      ['Segítesz konkrét állást találni?', 'Segítek az álláskeresési stratégia kialakításában, az álláshirdetések elemzésében, az erősségeid megfogalmazásában és az interjúra való felkészülésben. A szolgáltatás nem állásközvetítés, és nem garantálja az elhelyezkedést.'],
      ['Segítesz az önéletrajzommal és az állásinterjúval?', 'Igen, ezek a témák a közös munka részét képezhetik, amennyiben kapcsolódnak a céljaidhoz.'],
      ['Mi történik, ha nem tudom pontosan megfogalmazni, miben kérek segítséget?', 'Nem szükséges kész kérdéssel érkezned. Az első beszélgetésen közösen áttekintjük, mi foglalkoztat.'],
      ['A karrier mentorálás terápia?', 'Nem. A karrier mentorálás a munkával, pályával, álláskereséssel és munkahelyi működéssel kapcsolatos önismeretet és döntéseket támogatja. Nem helyettesíti a pszichológiai vagy egészségügyi ellátást.'],
    ],
    contactStep: 'Ha még nem tudod pontosan, milyen támogatásra lenne szükséged, egy 30 perces, díjmentes első beszélgetésen áttekinthetjük a helyzetedet, a céljaidat és a lehetséges együttműködést. Az első beszélgetés nem jelent elköteleződést.',
    formTitle: 'Üzenetküldés', name: 'Név', email: 'E-mail-cím', need: 'Miben szeretnél segítséget kapni?', preference: 'Kapcsolattartási preferencia (opcionális)', emailPref: 'E-mail', phonePref: 'Telefon', consent: 'Elolvastam az adatkezelési tájékoztatót.', submit: 'Jelentkezés elküldése',
    formNotice: 'A kitöltött levél a saját e-mail-alkalmazásodban nyílik meg. Az üzenet elküldéséhez ott még nyomd meg a Küldés gombot.',
    newsletterTitle: 'Hírlevél',
    newsletterText: 'Szeretnél e-mailben értesülni az új cikkekről, videókról és programokról? Add meg a nevedet és az e-mail-címedet. A feliratkozási kérelem kitöltött levélként nyílik meg a levelezőalkalmazásodban.',
    newsletterSubmit: 'Feliratkozási kérelem',
    newsletterNotice: 'A levelezőalkalmazásodban megnyílt egy előkészített levél. A kérelem csak akkor érkezik meg, ha ott a Küldésre is kattintasz.',
    newsletterRequest: 'Szeretnék feliratkozni az Iránytű hírlevelére, és hozzájárulok ahhoz, hogy a megadott e-mail-címre híreket küldj.',
    contactEmail: contactAddress, noDiagnosis: 'Nem szükséges diagnózist vagy részletes egészségügyi információt megadnod.',
    comingTitle: 'A videóid itt jelennek meg.', comingText: 'Töltsd fel a videót YouTube-ra vagy Vimeo-ra, majd add hozzá a nyilvános linket a videólistához. A GitHubra mentett módosítás után az oldal automatikusan frissül.',
    videoInstructions: 'Új videó hozzáadásához a GitHubon szerkeszd a src/data/videos.ts fájlt, és mentsd el a videó címét, leírását és nyilvános linkjét.',
    videoOpenOriginal: 'Videó megnyitása a szolgáltatónál',
    youtubeUpload: 'Videó feltöltése YouTube-ra', vimeoUpload: 'Videó feltöltése Vimeo-ra',
    legalDraft: 'Fontos: az adatkezelési tájékoztató és az impresszum adatok hiányában csak előkészítési vázlatként kezelhető. Ez a szöveg nem végleges jogi tájékoztatás; publikálás előtt a tényleges adatkezelési folyamatokhoz kell igazítani és szakértővel ellenőriztetni.',
    footerLine: 'Iránytű Neurodiverz Karrier Műhely', explore: 'Felfedezés', footerContact: 'Kapcsolat', copyright: 'Minden jog fenntartva.', cookie: 'Adatkezelési tájékoztató', imprint: 'Impresszum',
    linkIntro: 'Díjmentes első beszélgetést kérek', linkContact: 'Kapcsolatfelvétel', allServices: 'Szolgáltatások megtekintése', available: 'Az időpontokat, helyszínt, létszámot és díjat az egyes programok meghirdetésekor tesszük közzé.', interest: 'Érdeklődöm a programokról',
  },
  en: {
    brand: 'Iránytű Neurodiverz Karrier Műhely', tagline: 'A career on your own terms',
    nav: { about: 'About me', services: 'Services', career: 'Career mentoring', mentoring: 'Mentoring', supervision: 'Supervision', workshops: 'Group workshops', prices: 'Pricing', library: 'Resources', articles: 'Articles', videos: 'Videos', faq: 'FAQs', contact: 'Contact' },
    homeEyebrow: 'Career support for autistic and ADHD adults', homeTitle: 'Find a direction in work that feels right for you.',
    homeNote: 'You do not have to become someone else to find your place in the world of work.',
    homeIntro: 'I support autistic and ADHD adults as they get to know their strengths, recognise the working environments that suit them, and shape a more intentional path through the world of work.',
    introCta: 'Request a free introductory call', problemTitle: 'When your abilities are not the problem',
    problemText: 'You may be good at what you do and still struggle to find your place at work. The environment, the nature of tasks, clear expectations, communication, social and sensory demands—and the freedom to work in your own way—all matter.',
    methodTitle: 'We begin with how you work best.', methodText: 'Rather than asking how you should adapt to everyone else, we explore the tasks, conditions and ways of working that can help you use your abilities more fully.',
    servicesTitle: 'How can Iránytű help?', servicesIntro: 'We start with your situation and questions. Together we look for practical ways forward, one-to-one or in a group.',
    careerTitle: 'Individual career mentoring', careerText: 'Job searching, a career change or a workplace challenge: we explore your strengths, goals and the working conditions that matter to you.',
    workshopTitle: 'Group workshops', workshopText: 'Practical activities, shared reflection and other people’s experiences can offer new ways to understand yourself and work.',
    readMore: 'Explore this service', processTitle: 'How we work together',
    process: ['We begin with your question.', 'We map your strengths and working style.', 'We explore what helps or makes work harder.', 'We identify practical next steps.'],
    processDesc: ['You do not need to arrive with all the answers.', 'We focus on what matters to you.', 'We take the environment and expectations into account.', 'We look for approaches you can use in your own situation.'],
    quote: 'The goal is not to fit you into a standard mould. We look for the possibilities that fit you.',
    whyTitle: 'Experience of work. Attention to the individual.',
    whyText: 'I am Kovács Michaela. With 20 years of HR experience and a background as an HR leader, I understand how workplaces operate, what employers expect and how hiring works. As a qualified supervisor, I value reflection and finding individual solutions.',
    meet: 'Get to know me', nextTitle: 'Let’s find your next step!', nextText: 'If you are not yet sure what kind of support you need, we can use a free 30-minute introductory call to discuss your situation, goals and possible ways of working together. The conversation does not commit you to anything.',
    page: {
      about: ['Kovács Michaela — Career and Vocational Guidance Mentor and Supervisor for autistic and ADHD people', 'I bring HR experience and a supervisory perspective to your career journey.'],
      career: ['One-to-one career mentoring for autistic and ADHD adults', 'Find the kind of work and working environment where you can thrive.'],
      mentoring: ['Mentoring shaped around your questions', 'A one-to-one process tailored to your situation—from workplace difficulties to your next career move.'],
      supervision: ['Individual and group supervision for autistic and ADHD adults', 'Understand your situations, reactions and possibilities more clearly.'],
      workshops: ['Group programmes and workshops', 'Learn, reflect and explore your options—at your own pace.'],
      prices: ['Fees and format', 'Clear terms, with no commitment required after the introductory call.'],
      articles: ['Neurodiverse careers: resources', 'Reflections and practical guides for the world of work.'],
      videos: ['Videos', 'Short, accessible perspectives on neurodivergent career journeys.'],
      faq: ['Frequently asked questions', 'Answers to questions you may have before getting started.'],
      contact: ['Let’s take the first step together.', 'Perhaps you know exactly what you want to work on. Or perhaps you only know that something is not working as you would like. Both are good places to begin.'],
      privacy: ['Privacy information', 'How information shared through this website and its contact forms is handled.'],
      imprint: ['Imprint', 'Business and contact details must be added before this page can be finalised.'],
    },
    supervisionParagraphs: [
      'Supervision is a reflective process that gives you space to pause and take a closer look at a work-related or professional situation that matters to you. We focus on how you experience it, what feelings, thoughts and reactions arise, and what new perspectives and possibilities you might discover.',
      'In individual supervision, we work with a question of your own. This might include workplace conflict, communication difficulties, boundaries, roles or recurring situations on your mind. Reflecting together can help you understand how you work and shape your next steps more intentionally.',
      'In group supervision, you can explore situations that matter to you in a supportive setting. Other people’s experiences and perspectives may lead to new insights, and you can also contribute to the group’s reflection.',
      'Supervision is not about telling you what you should do differently. It supports you to understand your situation, recognise your possibilities and find approaches that work for you.',
      'You are at the centre: your experiences, how you make sense of them and the way you look at your own situations.',
    ],
    sections: { about: 'Why I created Iránytű', approach: 'How I think about careers', brings: 'How I support you', forWhom: 'Who I work with', situations: 'Career mentoring may be for you if…', questions: 'Questions we can explore', how: 'What does the process look like?', rates: 'Fees and getting started', goodToKnow: 'A few important boundaries', groups: 'Group sessions and workshops', blog: 'Read, reflect, try what helps', getInTouch: 'How to get in touch', after: 'What happens next?' },
    aboutText: 'I have worked in HR for 20 years. As an HR leader, I have seen how workplaces operate, what employers expect, how recruitment works, and the decisions employees and organisations face. As a supervisor, I value supporting reflective thinking, a deeper understanding of how we work, and helping people find individual solutions. I bring these two professional perspectives together at Iránytű.',
    aboutWhy: 'I created Iránytű to support people in understanding how they work, reflecting on the questions that arise, and finding individual solutions—with an accepting, non-judgemental approach.',
    experience: ['With HR experience: I help you navigate work, better understand employer expectations and make sense of workplace situations.', 'With self-understanding and reflection: We explore together how you work, what feels difficult and which strengths you can draw on.', 'With practical solutions: I support you in turning insights into achievable steps and more intentional career decisions.', 'In finding your own path: We take your strengths, goals and needs into account so you can find work and a workplace where you feel well and develop your abilities.'],
    careerList: ['you are an autistic or ADHD adult looking for work;', 'you are choosing a career or considering a change;', 'you are unsure what kind of work environment suits you;', 'it is hard to communicate your strengths while job hunting;', 'interviews or workplace communication feel challenging;', 'you want to advocate for your needs more confidently.'],
    topics: ['Strengths and abilities', 'Work environment and fit', 'Job searching and job adverts', 'Interviews and presenting yourself', 'Self-advocacy at work'],
    topicAnswers: ['What am I good at? Which tasks absorb me, and how can I communicate my abilities?', 'What pace, structure, communication and environment support the way I work?', 'How can I read between the lines of a job advert and find roles that fit?', 'How can I talk about my experience and prepare for difficult questions?', 'How can I make a clear request and explore possible workplace adjustments?'],
    steps: ['We clarify what brought you here and what you hope to achieve.', 'We explore the relevant strengths, difficulties and circumstances.', 'We work through questions and practical activities together.', 'We identify next steps that make sense for your situation.'],
    workshops: [
      ['Job-search workshop', 'Explore your strengths, interests and working style; read job adverts; think about a good-fit environment; prepare for interviews; and identify your next steps.'],
      ['Self-understanding and self-advocacy at work', 'Use practical situations to think about requests, boundaries, clear communication and finding workable solutions.'],
      ['Managing energy at work', 'Notice what replenishes or drains you, how surroundings and communication affect your energy, and what may support more sustainable work.'],
      ['Group supervision for neurodivergent adults', 'A confidential setting to reflect on experiences, dilemmas and new perspectives. Supervision is neither advice-giving nor therapy.'],
    ],
    pricesTitle: 'Individual career mentoring', price: 'HUF 15,000 gross', priceUnit: '/ 60-minute session',
    priceExplain: 'If you are unsure what kind of support you need, we can use a free 30-minute introductory call to talk through your situation, goals and possible ways of working together. The first call does not commit you to anything.',
    trust: 'Career mentoring is not a recruitment service, does not guarantee a job, and is not a substitute for psychological or healthcare support.',
    knowledge: ['Workplace fit', 'Strengths and self-understanding', 'Job search and interviews', 'Wellbeing and energy at work'],
    knowledgeText: ['It is not only what you can do. The conditions in which you can use those abilities matter too.', 'Recognising your strengths can help you choose more deliberately and describe what you bring to a team.', 'Practical perspectives on job adverts, preparation and communicating your experience.', 'Workload, surroundings, communication and opportunities to recover all matter.'],
    faqs: [
      ['Do I need a diagnosis to get in touch?', 'The service is primarily for autistic and ADHD adults. If you are unsure whether mentoring may suit you, we can talk through your needs and the service in the introductory call. You do not need to share diagnosis information on the contact form.'],
      ['How much does career mentoring cost?', 'A 60-minute session costs HUF 15,000 gross. The first 30-minute conversation is free.'],
      ['Do I have to continue after the first call?', 'No. The call is an opportunity to discuss your situation and see whether working together may be a good fit. You decide what happens next.'],
      ['How many sessions will I need?', 'That depends on your question and goals. We shape the process together.'],
      ['Are sessions online or in person?', 'We can discuss the available format when you get in touch.'],
      ['Can you find me a specific job?', 'I can support your job-search strategy, review job adverts, help you describe your strengths and prepare for interviews. This is not a recruitment service and does not guarantee employment.'],
      ['Can you help with my CV and interview preparation?', 'Yes, these can be part of our work when they connect with your goals.'],
      ['What if I do not know exactly what help I need?', 'You do not need a perfectly formed question. We can work out what is on your mind together during the introductory call.'],
      ['Is career mentoring therapy?', 'No. It supports reflection and decisions about work, careers, job seeking and workplace functioning. It does not replace psychological or healthcare support.'],
    ],
    contactStep: 'If you are not yet sure what kind of support you need, we can use a free 30-minute introductory call to discuss your situation, goals and possible ways of working together. The conversation does not commit you to anything.',
    formTitle: 'Send a message', name: 'Name', email: 'Email address', need: 'What would you like support with?', preference: 'Preferred way to get in touch (optional)', emailPref: 'Email', phonePref: 'Phone', consent: 'I have read the privacy information.', submit: 'Send enquiry',
    formNotice: 'A draft email opens in your email app with the form details filled in. Press Send there to deliver your message.',
    newsletterTitle: 'Newsletter',
    newsletterText: 'Would you like occasional email updates about new articles, videos and programmes? Enter your name and email address. A pre-filled request will open in your email app.',
    newsletterSubmit: 'Request subscription',
    newsletterNotice: 'A pre-filled email has opened in your email app. The request will only arrive after you press Send there.',
    newsletterRequest: 'I would like to subscribe to the Iránytű newsletter and consent to receiving occasional updates at the email address below.',
    contactEmail: contactAddress, noDiagnosis: 'You do not need to share a diagnosis or detailed health information.',
    comingTitle: 'Your videos will appear here.', comingText: 'Upload a video to YouTube or Vimeo, then add its public link to the video list. Once you save the change to GitHub, the site updates automatically.',
    videoInstructions: 'To add a video, edit src/data/videos.ts on GitHub and save its title, description and public link.',
    videoOpenOriginal: 'Open video on its platform',
    youtubeUpload: 'Upload a video to YouTube', vimeoUpload: 'Upload a video to Vimeo',
    legalDraft: 'Important: the privacy information and imprint are only preparation drafts because business details and actual data practices have not been supplied. This is not final legal guidance; the pages must be completed for the real service and reviewed before publication.',
    footerLine: 'Iránytű Neurodiverz Karrier Műhely', explore: 'Explore', footerContact: 'Contact', copyright: 'All rights reserved.', cookie: 'Privacy information', imprint: 'Imprint',
    linkIntro: 'Request a free introductory call', linkContact: 'Get in touch', allServices: 'Explore services', available: 'Dates, venue, group size and fees will be shared when each programme is announced.', interest: 'Ask about group programmes',
  },
  de: {
    brand: 'Iránytű Neurodiverz Karrier Műhely', tagline: 'Beruflich den eigenen Weg finden',
    nav: { about: 'Über mich', services: 'Angebote', career: 'Karriere-Mentoring', mentoring: 'Mentoring', supervision: 'Supervision', workshops: 'Gruppenworkshops', prices: 'Preise', library: 'Wissenswertes', articles: 'Artikel', videos: 'Videos', faq: 'Häufige Fragen', contact: 'Kontakt' },
    homeEyebrow: 'Berufliche Unterstützung für autistische Erwachsene und Erwachsene mit ADHS',
    homeTitle: 'Finde eine berufliche Richtung, die zu dir passt.',
    homeNote: 'Du musst dich nicht verändern, um deinen Platz in der Arbeitswelt zu finden.',
    homeIntro: 'Ich unterstütze autistische Erwachsene und Erwachsene mit ADHS dabei, ihre Stärken besser kennenzulernen, ein passendes Arbeitsumfeld zu erkennen und ihren beruflichen Weg bewusster zu gestalten.',
    introCta: 'Kostenloses Erstgespräch anfragen', problemTitle: 'Wenn nicht deine Fähigkeiten das Problem sind',
    problemText: 'Vielleicht bist du in bestimmten Aufgaben richtig gut und findest trotzdem schwer deinen Platz im Berufsleben. Auch Arbeitsumfeld, Aufgaben, klare Erwartungen, Kommunikation, soziale und sensorische Belastung sowie die eigene Arbeitsweise spielen eine Rolle.',
    methodTitle: 'Wir gehen von deiner Arbeitsweise aus.', methodText: 'Wir fragen nicht, wie du dich stärker an andere anpassen solltest. Wir erkunden, welche Aufgaben, Bedingungen und Arbeitsweisen dir helfen, deine Fähigkeiten besser einzusetzen.',
    servicesTitle: 'Wie kann Iránytű dich unterstützen?', servicesIntro: 'Wir beginnen mit deiner Situation und deinen Fragen. Gemeinsam suchen wir nach praktischen nächsten Schritten – einzeln oder in der Gruppe.',
    careerTitle: 'Individuelles Karrierementoring', careerText: 'Jobsuche, berufliche Veränderung oder Schwierigkeiten am Arbeitsplatz: Wir erkunden deine Stärken, Ziele und wichtigen Arbeitsbedingungen.',
    workshopTitle: 'Gruppenworkshops', workshopText: 'Praktische Übungen, gemeinsames Nachdenken und Erfahrungen anderer können neue Perspektiven auf dich und die Arbeitswelt eröffnen.',
    readMore: 'Mehr erfahren', processTitle: 'So arbeiten wir zusammen',
    process: ['Wir beginnen mit deiner Frage.', 'Wir erkunden deine Stärken und Arbeitsweise.', 'Wir schauen, was die Arbeit erleichtert oder erschwert.', 'Wir entwickeln praktische nächste Schritte.'],
    processDesc: ['Du musst nicht schon alle Antworten haben.', 'Wir richten uns nach dem, was für dich wichtig ist.', 'Umfeld und Erwartungen beziehen wir mit ein.', 'Wir suchen nach Lösungen für deinen Alltag.'],
    quote: 'Es geht nicht darum, dich in eine allgemeine Norm zu pressen. Wir suchen nach Möglichkeiten, die zu dir passen.',
    whyTitle: 'Erfahrung aus der Arbeitswelt. Aufmerksamkeit für den einzelnen Menschen.',
    whyText: 'Ich bin Kovács Michaela. Mit 20 Jahren HR-Erfahrung und meiner Erfahrung als HR-Leiterin kenne ich Arbeitsabläufe, Erwartungen von Arbeitgebern und Auswahlverfahren. Als qualifizierte Supervisorin schätze ich Reflexion und individuelle Lösungen.',
    meet: 'Lerne mich kennen', nextTitle: 'Finden wir deinen nächsten Schritt!', nextText: 'Wenn du noch nicht genau weißt, welche Unterstützung du brauchst, können wir in einem kostenlosen 30-minütigen Erstgespräch deine Situation, Ziele und eine mögliche Zusammenarbeit besprechen. Das Gespräch verpflichtet dich zu nichts.',
    page: {
      about: ['Kovács Michaela – Mentorin für Karriere- und Berufsorientierung sowie Supervisorin für autistische Menschen und Menschen mit ADHS', 'Mit HR-Erfahrung und supervisorischer Haltung unterstütze ich deinen eigenen beruflichen Weg.'],
      career: ['Individuelles Karrierementoring für autistische Erwachsene und Erwachsene mit ADHS', 'Finde heraus, welche Arbeit und welches Umfeld zu dir passen.'],
      mentoring: ['Mentoring entlang deiner Fragen', 'Der individuelle Prozess orientiert sich an deiner Situation – von beruflichen Schwierigkeiten bis zum nächsten Karriereschritt.'],
      supervision: ['Einzel- und Gruppensupervision für autistische Erwachsene und Erwachsene mit ADHS', 'Verstehe deine Situationen, Reaktionen und eigenen Möglichkeiten besser.'],
      workshops: ['Gruppenangebote und Workshops', 'Lerne, reflektiere und entdecke deine Möglichkeiten – in deinem Tempo.'],
      prices: ['Preise und Rahmen', 'Klare Bedingungen. Das Erstgespräch ist unverbindlich.'],
      articles: ['Neurodiverse Karriere: Wissenswertes', 'Gedanken und praktische Orientierung für die Arbeitswelt.'],
      videos: ['Videos', 'Kurze, zugängliche Impulse zu neurodiversen Berufswegen.'],
      faq: ['Häufige Fragen', 'Antworten auf Fragen, die vor dem Start auftauchen können.'],
      contact: ['Gehen wir den ersten Schritt gemeinsam.', 'Vielleicht weißt du schon genau, was du verändern möchtest. Vielleicht spürst du nur, dass etwas nicht so funktioniert, wie du es dir wünschst. Beides ist ein guter Anfang.'],
      privacy: ['Datenschutzhinweise', 'Informationen zum Umgang mit Daten, die über diese Website und ihre Kontaktformulare mitgeteilt werden.'],
      imprint: ['Impressum', 'Geschäfts- und Kontaktdaten müssen ergänzt werden, bevor diese Seite fertiggestellt werden kann.'],
    },
    supervisionParagraphs: [
      'Supervision ist ein reflexiver Prozess, in dem du innehalten und eine wichtige berufliche Situation genauer betrachten kannst. Im Mittelpunkt steht, wie du die Situation erlebst, welche Gefühle, Gedanken und Reaktionen dabei entstehen und welche neuen Perspektiven und Möglichkeiten du entdecken kannst.',
      'In der Einzelsupervision arbeiten wir mit deiner eigenen Frage. Dabei können wir zum Beispiel Konflikte am Arbeitsplatz, Kommunikationsschwierigkeiten, Grenzen, Rollen oder wiederkehrende Situationen betrachten. Das gemeinsame Nachdenken kann dir helfen, deine eigene Arbeitsweise besser zu verstehen und nächste Schritte bewusster zu gestalten.',
      'In der Gruppensupervision kannst du deine Themen in einem unterstützenden Rahmen bearbeiten. Die Erfahrungen und Perspektiven anderer können neue Erkenntnisse eröffnen, während auch du zum gemeinsamen Nachdenken beiträgst.',
      'In der Supervision geht es nicht darum, dir vorzuschreiben, was du anders machen solltest. Sie unterstützt dich dabei, deine Situation besser zu verstehen, deine Möglichkeiten zu erkennen und passende Lösungen zu finden.',
      'Im Mittelpunkt stehst du: deine Erfahrungen, dein Erleben und die Art, wie du auf deine eigenen Situationen blickst.',
    ],
    sections: { about: 'Warum ich Iránytű gegründet habe', approach: 'Wie ich über Karriere denke', brings: 'So unterstütze ich dich', forWhom: 'Mit wem ich arbeite', situations: 'Karrierementoring kann passen, wenn du…', questions: 'Fragen, die wir erkunden können', how: 'Wie läuft die Zusammenarbeit ab?', rates: 'Preise und Einstieg', goodToKnow: 'Wichtige Rahmenbedingungen', groups: 'Gruppenangebote und Workshops', blog: 'Lies, denke nach und probiere aus', getInTouch: 'So kannst du mich erreichen', after: 'Was passiert danach?' },
    aboutText: 'Seit 20 Jahren arbeite ich im HR-Bereich. Als HR-Leiterin habe ich Arbeitsabläufe, Erwartungen von Arbeitgebern, Auswahlverfahren und die Entscheidungen von Beschäftigten und Organisationen aus nächster Nähe kennengelernt. Als Supervisorin ist es mir wichtig, Reflexion zu unterstützen, ein tieferes Verständnis der eigenen Arbeitsweise zu fördern und individuelle Lösungen zu ermöglichen. Diese beiden beruflichen Perspektiven verbinde ich bei Iránytű.',
    aboutWhy: 'Ich habe Iránytű gegründet, um Menschen dabei zu unterstützen, die eigene Arbeitsweise besser zu verstehen, Fragen zu reflektieren und individuelle Lösungen zu finden – wertschätzend und ohne zu urteilen.',
    experience: ['Mit HR-Erfahrung: Ich unterstütze dich dabei, dich in der Arbeitswelt zurechtzufinden, Erwartungen von Arbeitgebern besser zu verstehen und Situationen am Arbeitsplatz einzuordnen.', 'Mit Selbstreflexion: Gemeinsam schauen wir darauf, wie du arbeitest, was schwierig ist und auf welche Stärken du aufbauen kannst.', 'Mit praktischen Lösungen: Ich unterstütze dich dabei, Erkenntnisse in umsetzbare Schritte und bewusstere Karriereentscheidungen zu übersetzen.', 'Auf deinem eigenen Weg: Wir berücksichtigen deine Stärken, Ziele und Bedürfnisse, damit du Arbeit und ein Umfeld findest, in dem du dich wohlfühlst und deine Fähigkeiten entfalten kannst.'],
    careerList: ['du als autistische Person oder Person mit ADHS eine Stelle suchst;', 'du vor einer Berufswahl oder beruflichen Veränderung stehst;', 'du nicht sicher bist, welches Arbeitsumfeld zu dir passt;', 'es dir schwerfällt, deine Stärken bei der Jobsuche zu zeigen;', 'Bewerbungsgespräche oder Kommunikation am Arbeitsplatz herausfordernd sind;', 'du deine Bedürfnisse selbstbewusster vertreten möchtest.'],
    topics: ['Eigene Stärken und Fähigkeiten', 'Arbeitsumfeld und Passung', 'Jobsuche und Stellenanzeigen', 'Bewerbungsgespräch und Selbstpräsentation', 'Selbstvertretung am Arbeitsplatz'],
    topicAnswers: ['Worin bin ich gut? Bei welchen Aufgaben kann ich mich vertiefen, und wie zeige ich meine Fähigkeiten?', 'Welches Tempo, welche Struktur, Kommunikation und Umgebung unterstützen mich?', 'Wie ordne ich Anforderungen ein und finde passende Möglichkeiten?', 'Wie stelle ich meine Erfahrung dar und bereite mich auf schwierige Fragen vor?', 'Wie formuliere ich Anliegen klar und welche Lösungen kann ich prüfen?'],
    steps: ['Wir besprechen, warum du dich meldest und was du erreichen möchtest.', 'Wir erkunden wichtige Stärken, Herausforderungen und Rahmenbedingungen.', 'Wir arbeiten mit praktischen Übungen, Fragen und gemeinsamem Nachdenken.', 'Zum Schluss formulieren wir passende nächste Schritte.'],
    workshops: [
      ['Workshop zur Jobsuche', 'Stärken, Interessen und Arbeitsweise erkunden; Stellenanzeigen verstehen; ein passendes Umfeld erkennen; Bewerbungsgespräche vorbereiten; nächste Schritte festlegen.'],
      ['Selbstkenntnis und Selbstvertretung im Beruf', 'An konkreten Situationen beschäftigen wir uns mit Anliegen, Grenzen, klarer Kommunikation und passenden Lösungen am Arbeitsplatz.'],
      ['Energiemanagement am Arbeitsplatz', 'Wir schauen, was Energie gibt oder nimmt und welche Veränderungen nachhaltigeres Arbeiten unterstützen können.'],
      ['Gruppensupervision für neurodivergente Erwachsene', 'Ein vertraulicher Rahmen für Erfahrungen, Fragen und neue Perspektiven. Supervision ist weder Beratung noch Therapie.'],
    ],
    pricesTitle: 'Individuelles Karrierementoring', price: '15.000 HUF brutto', priceUnit: '/ 60-minütige Sitzung',
    priceExplain: 'Wenn du noch nicht genau weißt, welche Unterstützung du brauchst, können wir deine Situation, Ziele und eine mögliche Zusammenarbeit in einem kostenlosen 30-minütigen Erstgespräch besprechen. Das Gespräch verpflichtet dich zu nichts.',
    trust: 'Karrierementoring ist keine Arbeitsvermittlung, garantiert keine Beschäftigung und ersetzt keine psychologische oder medizinische Versorgung.',
    knowledge: ['Passung am Arbeitsplatz', 'Stärken und Selbsterkenntnis', 'Jobsuche und Bewerbung', 'Wohlbefinden und Energie im Beruf'],
    knowledgeText: ['Nicht nur deine Fähigkeiten zählen. Wichtig ist auch, unter welchen Bedingungen du sie gut einsetzen kannst.', 'Eigene Stärken zu erkennen hilft bei bewussten Entscheidungen und dabei, den eigenen Beitrag zu beschreiben.', 'Praktische Impulse zu Stellenanzeigen, Vorbereitung und Darstellung deiner Erfahrung.', 'Arbeitsbelastung, Umfeld, Kommunikation und Erholung sind ebenfalls wichtig.'],
    faqs: [
      ['Brauche ich eine Diagnose, um mich zu melden?', 'Das Angebot richtet sich vor allem an autistische Erwachsene und Erwachsene mit ADHS. Wenn du unsicher bist, können wir deine Bedürfnisse und den Rahmen im Erstgespräch besprechen. Im Kontaktformular musst du keine Diagnose angeben.'],
      ['Was kostet das Karrierementoring?', 'Eine 60-minütige Sitzung kostet 15.000 HUF brutto. Das erste 30-minütige Gespräch ist kostenlos.'],
      ['Muss ich nach dem Erstgespräch weitermachen?', 'Nein. Wir besprechen deine Situation und eine mögliche Zusammenarbeit. Danach entscheidest du selbst.'],
      ['Wie viele Termine brauche ich?', 'Das hängt von deiner Frage und deinen Zielen ab. Den Prozess gestalten wir gemeinsam.'],
      ['Findet das Mentoring online oder persönlich statt?', 'Welche Möglichkeiten verfügbar sind, klären wir bei der Kontaktaufnahme.'],
      ['Hilfst du mir, eine konkrete Stelle zu finden?', 'Ich unterstütze bei Suchstrategie, Stellenanzeigen, der Beschreibung deiner Stärken und der Vorbereitung auf Gespräche. Es handelt sich nicht um Arbeitsvermittlung und eine Stelle kann nicht garantiert werden.'],
      ['Hilfst du bei Lebenslauf und Bewerbungsgespräch?', 'Ja, wenn diese Themen zu deinen Zielen passen, können sie Teil unserer Zusammenarbeit sein.'],
      ['Was, wenn ich noch nicht genau weiß, wobei ich Unterstützung brauche?', 'Du musst keine fertige Frage mitbringen. Im Erstgespräch finden wir gemeinsam heraus, was dich beschäftigt.'],
      ['Ist Karrierementoring eine Therapie?', 'Nein. Es unterstützt Reflexion und Entscheidungen zu Beruf, Jobsuche und Arbeitsalltag. Es ersetzt keine psychologische oder medizinische Versorgung.'],
    ],
    contactStep: 'Wenn du noch nicht genau weißt, welche Unterstützung du brauchst, können wir deine Situation, Ziele und eine mögliche Zusammenarbeit in einem kostenlosen 30-minütigen Erstgespräch besprechen. Das Gespräch verpflichtet dich zu nichts.',
    formTitle: 'Nachricht senden', name: 'Name', email: 'E-Mail-Adresse', need: 'Wobei wünschst du dir Unterstützung?', preference: 'Bevorzugter Kontaktweg (optional)', emailPref: 'E-Mail', phonePref: 'Telefon', consent: 'Ich habe die Datenschutzhinweise gelesen.', submit: 'Anfrage senden',
    formNotice: 'Ein E-Mail-Entwurf mit den Formularangaben wird in deinem E-Mail-Programm geöffnet. Zum Senden musst du dort noch auf „Senden“ klicken.',
    newsletterTitle: 'Newsletter',
    newsletterText: 'Möchtest du gelegentlich per E-Mail Neuigkeiten zu Artikeln, Videos und Angeboten erhalten? Gib deinen Namen und deine E-Mail-Adresse ein. Eine vorausgefüllte Anfrage öffnet sich in deiner E-Mail-App.',
    newsletterSubmit: 'Anmeldung anfragen',
    newsletterNotice: 'Eine vorausgefüllte E-Mail wurde in deiner E-Mail-App geöffnet. Die Anfrage wird erst gesendet, wenn du dort auf Senden klickst.',
    newsletterRequest: 'Ich möchte den Iránytű-Newsletter abonnieren und willige ein, gelegentliche Neuigkeiten an die unten angegebene E-Mail-Adresse zu erhalten.',
    contactEmail: contactAddress, noDiagnosis: 'Du musst keine Diagnose oder ausführlichen Gesundheitsinformationen mitteilen.',
    comingTitle: 'Deine Videos erscheinen hier.', comingText: 'Lade ein Video auf YouTube oder Vimeo hoch und füge anschließend den öffentlichen Link zur Videoliste hinzu. Nach dem Speichern der Änderung auf GitHub wird die Website automatisch aktualisiert.',
    videoInstructions: 'Um ein Video hinzuzufügen, bearbeite src/data/videos.ts auf GitHub und speichere Titel, Beschreibung und öffentlichen Link.',
    videoOpenOriginal: 'Video auf der Plattform öffnen',
    youtubeUpload: 'Video auf YouTube hochladen', vimeoUpload: 'Video auf Vimeo hochladen',
    legalDraft: 'Wichtig: Datenschutzhinweise und Impressum sind mangels Geschäftsdaten und Informationen zu tatsächlichen Datenverarbeitungen nur Entwürfe. Dies ist keine abschließende Rechtsberatung; vor der Veröffentlichung müssen die Texte angepasst und geprüft werden.',
    footerLine: 'Iránytű Neurodiverz Karrier Műhely', explore: 'Entdecken', footerContact: 'Kontakt', copyright: 'Alle Rechte vorbehalten.', cookie: 'Datenschutzhinweise', imprint: 'Impressum',
    linkIntro: 'Kostenloses Erstgespräch anfragen', linkContact: 'Kontakt aufnehmen', allServices: 'Angebote ansehen', available: 'Termine, Ort, Gruppengröße und Preise werden bei der Ausschreibung des jeweiligen Angebots bekanntgegeben.', interest: 'Interesse an Gruppenangeboten',
  },
} as const;

const pageNames = Object.keys(paths) as PageKey[];
const serviceItems: MenuPage[] = ['career', 'supervision', 'workshops'];
const resourceItems: MenuPage[] = ['articles', 'videos', 'faq'];

function resolvePath(path: string): { lang: Language; key: PageKey } {
  const parts = path.split('/').filter(Boolean);
  let lang: Language = 'hu';
  if (parts[0] === 'en' || parts[0] === 'de') lang = parts.shift() as Language;
  const remaining = `/${parts.join('/')}`;
  const key = remaining === paths.mentoring ? 'career' : pageNames.find((candidate) => paths[candidate] === remaining) || 'home';
  return { lang, key };
}

function localizedPath(lang: Language, key: PageKey) {
  const base = paths[key];
  return lang === 'hu' ? base : `/${lang}${base === '/' ? '' : base}`;
}

function AppLink({ lang, page, className, children, ...props }: { lang: Language; page: PageKey; className?: string; children: ReactNode; [key: string]: unknown }) {
  return <Link href={localizedPath(lang, page)} className={className} {...props}>{children}</Link>;
}

function Site() {
  const [location] = useLocation();
  const { lang, key } = resolvePath(location);
  const t = copy[lang];
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<'services' | 'library' | null>(null);
  const [formSent, setFormSent] = useState(false);
  const [newsletterPrepared, setNewsletterPrepared] = useState(false);
  const dropdownCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelDropdownClose = () => {
    if (dropdownCloseTimer.current !== null) {
      clearTimeout(dropdownCloseTimer.current);
      dropdownCloseTimer.current = null;
    }
  };
  const openDropdown = (id: 'services' | 'library') => {
    cancelDropdownClose();
    setOpenMenu(id);
  };
  const closeDropdown = () => {
    cancelDropdownClose();
    setOpenMenu(null);
  };
  const scheduleDropdownClose = () => {
    cancelDropdownClose();
    dropdownCloseTimer.current = setTimeout(() => {
      setOpenMenu(null);
      dropdownCloseTimer.current = null;
    }, 350);
  };

  useEffect(() => () => {
    if (dropdownCloseTimer.current !== null) clearTimeout(dropdownCloseTimer.current);
  }, []);

  useEffect(() => {
    cancelDropdownClose();
    setMobileOpen(false);
    setOpenMenu(null);
    setFormSent(false);
    setNewsletterPrepared(false);
    const titles: Record<PageKey, string> = {
      home: t.homeTitle, about: t.page.about[0], career: t.page.career[0], mentoring: t.page.mentoring[0],
      supervision: t.page.supervision[0], workshops: t.page.workshops[0], prices: t.page.prices[0],
      articles: t.page.articles[0], videos: t.page.videos[0], faq: t.page.faq[0], contact: t.page.contact[0],
      privacy: t.page.privacy[0], imprint: t.page.imprint[0],
    };
    document.title = `${titles[key]} | ${t.brand}`;
    const desc = key === 'home' ? t.homeIntro : t.page[key][1];
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.setAttribute('name', 'description'); document.head.appendChild(meta); }
    meta.setAttribute('content', desc);
    let og = document.querySelector('meta[property="og:title"]');
    if (!og) { og = document.createElement('meta'); og.setAttribute('property', 'og:title'); document.head.appendChild(og); }
    og.setAttribute('content', `${titles[key]} | ${t.brand}`);
    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) { ogDescription = document.createElement('meta'); ogDescription.setAttribute('property', 'og:description'); document.head.appendChild(ogDescription); }
    ogDescription.setAttribute('content', desc);
    let twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (!twitterTitle) { twitterTitle = document.createElement('meta'); twitterTitle.setAttribute('name', 'twitter:title'); document.head.appendChild(twitterTitle); }
    twitterTitle.setAttribute('content', `${titles[key]} | ${t.brand}`);
    let twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (!twitterDescription) { twitterDescription = document.createElement('meta'); twitterDescription.setAttribute('name', 'twitter:description'); document.head.appendChild(twitterDescription); }
    twitterDescription.setAttribute('content', desc);
    document.documentElement.lang = lang;
  }, [key, lang, t]);

  
  
const submit = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  const form = event.currentTarget;
  const values = new FormData(form);
  const turnstileToken = window.turnstile?.getResponse(
  turnstileWidgetIds["contact-turnstile"]
);

  if (!turnstileToken) {
    alert(
      "Kérlek, végezd el a biztonsági ellenőrzést az üzenet elküldése előtt."
    );
    return;
  }

  try {
    const response = await fetch(
      "https://iranytu-kapcsolat.michaela-kovacs2025.workers.dev/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "contact",
          name: String(values.get("name") ?? ""),
          email: String(values.get("email") ?? ""),
          message: String(values.get("need") ?? ""),
          preference: String(values.get("preference") ?? "email"),
          turnstileToken,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Az üzenetküldés sikertelen.");
    }

    setFormSent(true);
    form.reset();
    window.turnstile?.reset(
  turnstileWidgetIds["contact-turnstile"]
);
  } catch (error) {
    console.error("Kapcsolatfelvételi hiba:", error);
    alert(
      "Nem sikerült elküldeni az üzenetet. Kérlek, próbáld újra később."
    );
    window.turnstile?.reset(
  turnstileWidgetIds["contact-turnstile"]
);
  }
};


  
const submitNewsletter = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  const form = event.currentTarget;
  const values = new FormData(form);

  const name = String(values.get("name") ?? "").trim();
  const email = String(values.get("email") ?? "").trim();
  const consent = values.get("newsletterConsent") === "on";

  if (!consent) {
    alert("A feliratkozáshoz hozzájárulás szükséges.");
    return;
  }

  const turnstileToken = window.turnstile?.getResponse(
  turnstileWidgetIds["newsletter-turnstile"]
);

  if (!turnstileToken) {
    alert("Kérlek, végezd el a biztonsági ellenőrzést.");
    return;
  }

  try {
    const response = await fetch(
      "https://iranytu-kapcsolat.michaela-kovacs2025.workers.dev/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "newsletter",
          name,
          email,
          newsletterConsent: consent,
          turnstileToken,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Sikertelen feliratkozási kérelem.");
    }

    setNewsletterPrepared(true);
    form.reset();
    window.turnstile?.reset(
  turnstileWidgetIds["newsletter-turnstile"]
);

    alert("A feliratkozási kérelmedet sikeresen elküldtük!");
  } catch (error) {
    console.error("Hírlevélküldési hiba:", error);
    alert("Nem sikerült elküldeni a kérelmet. Próbáld újra később.");
    window.turnstile?.reset(
  turnstileWidgetIds["contact-turnstile"]
);
  }
};


  const menuLinks = (items: MenuPage[]) => items.map((item) => (
    <AppLink key={item} lang={lang} page={item} data-testid={`menu-link-${item}`}>{t.nav[item]}</AppLink>
  ));

  const desktopDropdown = (id: 'services' | 'library', label: string, items: MenuPage[]) => (
    <div className="nav-group" onMouseEnter={() => openDropdown(id)} onMouseLeave={scheduleDropdownClose}>
      <button className="nav-trigger" type="button" aria-expanded={openMenu === id} aria-haspopup="true" onClick={() => openMenu === id ? closeDropdown() : openDropdown(id)} onKeyDown={(e) => { if (e.key === 'Escape') closeDropdown(); }} data-testid={`menu-${id}`}>
        {label}<span aria-hidden="true">⌄</span>
      </button>
      {openMenu === id && <div className="dropdown" role="menu">{menuLinks(items)}</div>}
    </div>
  );

  const navLink = (page: NavPage) => <AppLink key={page} lang={lang} page={page} className="nav-link" aria-current={key === page ? 'page' : undefined} data-testid={`nav-${page}`}>{t.nav[page]}</AppLink>;

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">{lang === 'hu' ? 'Ugrás a tartalomhoz' : lang === 'de' ? 'Zum Inhalt springen' : 'Skip to content'}</a>
      <header className="topbar">
        <div className="container header-inner">
          <AppLink lang={lang} page="home" className="brand" aria-label={t.brand} data-testid="brand-home">
            <img src={publicAsset('logo-iranytu.png')} alt="" />
            <span><span className="brand-title">Iránytű Neurodiverz<br />Karrier Műhely</span><span className="brand-sub">{t.tagline}</span></span>
          </AppLink>
          <nav className="desktop-nav" aria-label={lang === 'hu' ? 'Fő navigáció' : 'Main navigation'}>
            {navLink('about')}
            {desktopDropdown('services', t.nav.services, serviceItems)}
            {navLink('prices')}
            {desktopDropdown('library', t.nav.library, resourceItems)}
            {navLink('contact')}
            <div className="lang-switch" aria-label="Language">
              {(['hu', 'de', 'en'] as Language[]).map((code) => <AppLink key={code} lang={code} page={key} className={lang === code ? 'active' : ''} aria-label={code === 'hu' ? 'Magyar' : code === 'de' ? 'Deutsch' : 'English'} aria-current={lang === code ? 'page' : undefined} data-testid={`language-${code}`}>{code.toUpperCase()}</AppLink>)}
            </div>
          </nav>
          <button className="menu-toggle" type="button" aria-label={mobileOpen ? (lang === 'hu' ? 'Navigáció bezárása' : lang === 'de' ? 'Navigation schließen' : 'Close navigation') : (lang === 'hu' ? 'Navigáció megnyitása' : lang === 'de' ? 'Navigation öffnen' : 'Open navigation')} aria-expanded={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)} data-testid="button-mobile-menu">{mobileOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
        {mobileOpen && <nav className="mobile-nav" aria-label="Mobile navigation">
          {navLink('about')}
          <span className="mobile-nav-label">{t.nav.services}</span>
          {serviceItems.map((page) => <AppLink key={page} lang={lang} page={page} className="mobile-sub" data-testid={`mobile-link-${page}`}>{t.nav[page]}</AppLink>)}
          {navLink('prices')}
          <span className="mobile-nav-label">{t.nav.library}</span>
          {resourceItems.map((page) => <AppLink key={page} lang={lang} page={page} className="mobile-sub" data-testid={`mobile-link-${page}`}>{t.nav[page]}</AppLink>)}
          {navLink('contact')}
          <div className="mobile-lang">{(['hu', 'de', 'en'] as Language[]).map((code) => <AppLink key={code} lang={code} page={key} aria-label={code === 'hu' ? 'Magyar' : code === 'de' ? 'Deutsch' : 'English'} aria-current={lang === code ? 'page' : undefined} data-testid={`mobile-language-${code}`}>{code.toUpperCase()}</AppLink>)}</div>
        </nav>}
      </header>
      <main id="main" tabIndex={-1}>
        {key === 'home' ? <Home lang={lang} t={t} /> : <Page lang={lang} t={t} page={key} onSubmit={submit} formSent={formSent} onNewsletterSubmit={submitNewsletter} newsletterPrepared={newsletterPrepared} />}
      </main>
      <Footer lang={lang} t={t} />
    </div>
  );
}

type Translation = (typeof copy)[Language];

function Home({ lang, t }: { lang: Language; t: Translation }) {
  return <>
    <section className="hero">
      <div className="container hero-grid">
        <div className="animate-in">
          <div className="eyebrow">{t.homeEyebrow}</div>
          <h1>{t.homeTitle}</h1>
          <p className="hero-note">{t.homeNote}</p>
          <p className="hero-copy">{t.homeIntro}</p>
        </div>
        <div className="hero-art" aria-label={t.brand} role="img">
          <div className="orbit"><div className="compass-card"><img src={publicAsset('logo-iranytu.png')} alt="" /></div><div className="floating-label"><strong>{lang === 'hu' ? '20 év HR' : lang === 'de' ? '20 Jahre HR' : '20 years in HR'}</strong>{lang === 'hu' ? 'Szakmai tapasztalat, emberi figyelem.' : lang === 'de' ? 'Berufserfahrung, menschliche Aufmerksamkeit.' : 'Professional experience, human attention.'}</div></div>
        </div>
      </div>
    </section>
    <section className="section white">
      <div className="container split">
        <div><span className="eyebrow">{lang === 'hu' ? 'Másképp is lehet' : lang === 'de' ? 'Es darf anders sein' : 'A different perspective'}</span><h2 className="section-heading" style={{ display: 'block' }}><span>{t.problemTitle}</span></h2><div className="side-kicker">{t.methodTitle}</div></div>
        <div className="content"><p>{t.problemText}</p><p>{t.methodText}</p><AppLink lang={lang} page="career" className="button secondary small" data-testid="link-home-career">{t.allServices}<ArrowRight size={16} /></AppLink></div>
      </div>
    </section>
        <section className="section soft">
      <div className="container">
        <div className="section-heading home-services-heading">
      <div>
        <span className="eyebrow">
          {lang === 'hu'
            ? 'Támogatás a saját utadhoz'
            : lang === 'de'
              ? 'Unterstützung für deinen Weg'
              : 'Support for your own path'}
        </span>
        <h2>{t.servicesTitle}</h2>
      </div>

      <div className="home-services-logo">
        <img
          src={publicAsset('logo-iranytu.png')}
          alt={t.brand}
          loading="lazy"
        />
      </div>
    </div>

        <div className="offer-grid">
          <article className="offer-card featured"><span className="eyebrow">{lang === 'hu' ? 'Egyéni folyamat' : lang === 'de' ? 'Individuell' : 'One-to-one'}</span><h3>{t.careerTitle}</h3><p>{t.careerText}</p><AppLink lang={lang} page="career" className="text-link" data-testid="link-offer-career">{t.readMore}<ArrowRight size={14} /></AppLink></article>
          <article className="offer-card"><span className="eyebrow">{lang === 'hu' ? 'Közös gondolkodás' : lang === 'de' ? 'Gemeinsam reflektieren' : 'Learn together'}</span><h3>{t.workshopTitle}</h3><p>{t.workshopText}</p><AppLink lang={lang} page="workshops" className="text-link" data-testid="link-offer-workshops">{t.readMore}<ArrowRight size={14} /></AppLink></article>
        </div>
      </div>
    </section>
    <section className="section white">
      <div className="container"><div className="section-heading"><div><span className="eyebrow">{lang === 'hu' ? 'Közösen, lépésről lépésre' : lang === 'de' ? 'Schritt für Schritt' : 'Together, step by step'}</span><h2>{t.processTitle}</h2></div></div>
        <div className="steps">{t.process.map((step, index) => <article className="step" key={step}><h3>{step}</h3><p>{t.processDesc[index]}</p></article>)}</div>
      </div>
    </section>
    <section className="quote-band"><div className="container quote-inner"><blockquote>“{t.quote}”</blockquote><span>— Kovács Michaela</span></div></section>
    <section className="section white">
      <div className="container split"><div><span className="eyebrow">{lang === 'hu' ? 'Szakmai háttér' : lang === 'de' ? 'Beruflicher Hintergrund' : 'Professional background'}</span><h2>{t.whyTitle}</h2></div><div className="content"><p>{t.whyText}</p><AppLink lang={lang} page="about" className="button secondary small" data-testid="link-meet">{t.meet}<ArrowRight size={16} /></AppLink></div></div>
    </section>
    <CTA lang={lang} t={t} disclaimer={t.trust} />
  </>;
}


function Page({
  lang,
  t,
  page,
  onSubmit,
  formSent,
  onNewsletterSubmit,
  newsletterPrepared,
}: {
  lang: Language;
  t: Translation;
  page: NonHomePage;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  formSent: boolean;
  onNewsletterSubmit: (event: FormEvent<HTMLFormElement>) => void;
  newsletterPrepared: boolean;
}) {

  
useEffect(() => {
  if (page !== 'contact') return;

  let cancelled = false;
  const widgetIds: string[] = [];
  const widgetIdsByContainer: Record<string, string> = {};

  const initializeTurnstile = () => {
    if (cancelled || !window.turnstile) return;

    const containers = [
      'contact-turnstile',
      'newsletter-turnstile',
    ];

    for (const containerId of containers) {
      const container = document.getElementById(containerId);

      if (!container) continue;

      const widgetId = window.turnstile.render(container, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: 'auto',
      });

      widgetIds.push(widgetId);
      widgetIdsByContainer[containerId] = widgetId;
      turnstileWidgetIds[containerId] = widgetId;
    }
  };

  const interval = window.setInterval(() => {
    if (
      window.turnstile &&
      document.getElementById('contact-turnstile') &&
      document.getElementById('newsletter-turnstile')
    ) {
      window.clearInterval(interval);
      initializeTurnstile();
    }
  }, 200);

  return () => {
    cancelled = true;
    delete turnstileWidgetIds["contact-turnstile"];
delete turnstileWidgetIds["newsletter-turnstile"];
    window.clearInterval(interval);

    for (const widgetId of widgetIds) {
      window.turnstile?.remove(widgetId);
    }
  };
}, [page]);
const [youtubeVideos, setYoutubeVideos] = useState<
  {
    id: string;
    title: string;
    thumbnail: string;
    url: string;
    published: string;
  }[]
>([]);

useEffect(() => {
  if (page !== "videos") return;

  const controller = new AbortController();

  const loadVideos = async () => {
    try {
      const response = await fetch(
        "https://iranytu-youtube.michaela-kovacs2025.workers.dev/",
        { signal: controller.signal }
      );

      if (!response.ok) {
        throw new Error("Nem sikerült lekérni a videókat.");
      }

      const data = await response.json();

      if (!controller.signal.aborted) {
        setYoutubeVideos(data.videos);
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        console.error("YouTube-videók lekérési hibája:", error);
      }
    }
  };

  loadVideos();

  return () => controller.abort();
}, [page]);

  const title = t.page[page][0];
  const subtitle = t.page[page][1];
  const playableVideos = (videos as VideoResource[]).flatMap((video) => {
    const embedUrl = getVideoEmbedUrl(video.url);
    return embedUrl ? [{ ...video, embedUrl }] : [];
  });
  
  return <>
    <section className="hero">
      <div
        className="container hero-grid"
        style={page === 'about'
          ? { gridTemplateColumns: 'minmax(0, 1fr)' }
          : undefined}
      >
        <div className="animate-in">
          <div className="eyebrow">{t.brand}</div>
          
<h1
  style={page === 'supervision' ? {
    fontSize: 'clamp(18px, 2.4vw, 34px)',
    whiteSpace: 'nowrap',
    maxWidth: '100%',
    lineHeight: 1.12
  } : page === 'about' ? {
    fontSize: 'clamp(32px, 3.5vw, 52px)',
    maxWidth: '100%',
    width: '100%',
    lineHeight: 1.12
  } : undefined}
>
  {title}
</h1>

          <p className="hero-copy">{subtitle}</p>
        </div>
      </div>
    </section>

    <section className="section white">
      <div className="container">
        {page === 'about' && <Article aside={t.sections.about}>

          <div className="about-intro">
            <figure className="about-portrait">
              <img
                src={publicAsset('michaela-kovacs.jpg')}
                alt={lang === 'hu' ? 'Kovács Michaela portréja' : lang === 'de' ? 'Porträt von Kovács Michaela' : 'Portrait of Kovács Michaela'}
                loading="lazy"
                decoding="async"
              />
            </figure>
            <div className="about-intro-copy">
              <h2>{t.sections.about}</h2>
              <p>{t.aboutText}</p>
            </div>
          </div>
          <h2>{t.sections.approach}</h2><p>{t.aboutWhy}</p><h2>{t.sections.brings}</h2><ul className="check-list">{t.experience.map((x) => <li key={x}>{x}</li>)}</ul><h2>{t.sections.forWhom}</h2><p>{lang === 'hu' ? 'Elsősorban autista és ADHD-s felnőttekkel dolgozom, akik szeretnének tudatosabban eligazodni a munka világában: első állásukat keresik, pályát váltanának, vagy jobban megértenék saját munkahelyi működésüket.' : lang === 'de' ? 'Ich arbeite vor allem mit autistischen Erwachsenen und Erwachsenen mit ADHS, die sich bewusster in der Arbeitswelt orientieren möchten – beim Einstieg, bei einer beruflichen Veränderung oder beim besseren Verständnis des eigenen Arbeitsalltags.' : 'I work primarily with autistic and ADHD adults who want to navigate work more intentionally—whether looking for their first role, considering a change or trying to understand their current working life.'}</p><p>{lang === 'hu' ? 'Nem kell előre pontosan tudnod, mire van szükséged. Elég, ha van egy kérdésed, nehézséged vagy célod, amelyen szeretnél dolgozni.' : lang === 'de' ? 'Du musst noch nicht genau wissen, was du brauchst. Eine Frage, Herausforderung oder ein Ziel reicht als Anfang.' : 'You do not need to know exactly what you need yet. A question, challenge or goal is enough to begin.'}</p><AppLink lang={lang} page="contact" className="button" data-testid="button-about-contact">{t.introCta}<ArrowRight size={16} /></AppLink>
        </Article>}
        {page === 'career' && <Article aside={t.sections.situations}><h2>{t.sections.situations}</h2><p>{lang === 'hu' ? 'Nem mindig könnyű megtalálni a helyedet a munka világában. A közös munkánkba jobban megismerheted az erősségeidet, felismerheted a fontos munkafeltételeket, és tudatosabb döntéseket hozhatsz.' : lang === 'de' ? 'Den eigenen Platz im Berufsleben zu finden, ist nicht immer leicht. Gemeinsam erkunden wir deine Stärken und wichtigen Arbeitsbedingungen, damit du bewusster entscheiden kannst.' : 'It is not always easy to find your place at work. Together, we explore your strengths and the conditions that matter, so you can make more informed choices.'}</p><ul className="check-list">{t.careerList.map((item) => <li key={item}>{item}</li>)}</ul><p>{lang === 'hu' ? 'Nem kell minden felsorolt helyzetben magadra ismerned. A közös munkánk abból indul ki, ami számodra most a legfontosabb.' : lang === 'de' ? 'Du musst dich nicht in allen Punkten wiederfinden. Wir beginnen mit dem, was dir jetzt am wichtigsten ist.' : 'You do not need to identify with every point. We begin with what matters most to you right now.'}</p><h2>{t.sections.questions}</h2>{t.topics.map((topic, i) => <div key={topic}><h3>{i + 1}. {topic}</h3><p>{t.topicAnswers[i]}</p></div>)}<h2>{t.sections.how}</h2><ul className="check-list">{t.steps.map((step) => <li key={step}>{step}</li>)}</ul><p>{lang === 'hu' ? 'A cél nem az, hogy minden helyzetre egyetlen helyes választ találjunk. A lehetőségeket nézzük meg, és azt, melyik illik leginkább az élethelyzetedhez.' : lang === 'de' ? 'Es geht nicht um eine einzige richtige Antwort. Wir betrachten die Möglichkeiten und welche am besten zu deiner Lebenssituation passt.' : 'The aim is not to find one right answer for every situation. We explore the options and what fits your life best.'}</p><h2>{t.sections.rates}</h2><PricePanel t={t} /><p>{t.priceExplain}</p><p>{t.trust}</p><AppLink lang={lang} page="contact" className="button" style={{ marginTop: 24 }} data-tesid="button-career-contact">{t.introCta}<ArrowRight size={16} /></AppLink></Article>}
        {page === 'workshops' && <Article aside={t.sections.groups}><p>{lang === 'hu' ? 'A munka világában felmerülő kérdéseinkkel sokszor egyedül maradunk. Mások tapasztalatai, a közös gondolkodás és a gyakorlati feladatok új nézőpontokat adhatnak.' : lang === 'de' ? 'Mit Fragen aus dem Berufsleben bleiben wir oft allein. Erfahrungen anderer, gemeinsames Nachdenken und praktische Übungen eröffnen neue Perspektiven.' : 'We are often left alone with questions about work. Other people’s experiences, shared reflection and practical activities can open up new perspectives.'}</p><p>{lang === 'hu' ? 'A foglalkozásokon a mindennapi életből vett helyzetekkel dolgozunk, és olyan megoldásokat keresünk, amelyeket a résztvevők a saját helyzetükben is hasznosíthatnak.' : lang === 'de' ? 'Wir arbeiten mit Situationen aus dem Alltag und suchen nach Ansätzen, die Teilnehmende in ihrer eigenen Situation nutzen können.' : 'We work with situations from everyday life and look for approaches participants can use in their own context.'}</p><h2>{t.sections.groups}</h2><div className="resource-grid">{t.workshops.map(([name, text]) => <article className="resource-card" key={name}><span className="eyebrow">{t.nav.workshops}</span><h3>{name}</h3><p>{text}</p></article>)}</div><p style={{ marginTop: 28 }}>{t.available}</p><AppLink lang={lang} page="contact" className="button" data-testid="button-workshop-contact">{t.interest}<ArrowRight size={16} /></AppLink></Article>}
        {page === 'supervision' && <Article aside={t.page.supervision[0]}><h2 style={{ fontSize: 'clamp(18px, 2.3vw, 32px)', fontWeight: 700, whiteSpace: 'nowrap', letterSpacing: '-0.03em' }}>{t.page.supervision[0]}</h2><p className="supervision-lead">{t.page.supervision[1]}</p>{t.supervisionParagraphs.map((paragraph) => <p key={paragraph} style={{ marginBottom: '24px' }}>{paragraph}</p>)}<AppLink lang={lang} page="contact" className="button" style={{ marginTop: '32px' }} data-testid="button-supervision-contact">{t.linkContact}<ArrowRight size={16} /></AppLink></Article>}
        {page === 'prices' && <Article aside={t.sections.rates}><h2>{t.pricesTitle}</h2><PricePanel t={t} /><p>{t.priceExplain}</p><p>{lang === 'hu' ? 'Az első beszélgetés után te döntöd el, szeretnéd-e folytatni a közös munkát.' : lang === 'de' ? 'Nach dem Erstgespräch entscheidest du selbst, ob du die Zusammenarbeit fortsetzen möchtest.' : 'After the introductory call, you decide whether you would like to continue.'}</p><h2>{t.sections.goodToKnow}</h2><p>{t.trust}</p><AppLink lang={lang} page="contact" className="button" data-testid="button-pricing-contact">{t.linkIntro}<ArrowRight size={16} /></AppLink></Article>}
        {page === 'articles' && <Article aside={t.page.articles[0]}><p>{lang === 'hu' ? 'Hogyan találhatod meg a hozzád illő munkát? Hogyan ismerheted fel az erősségeidet? Mit tehetsz, ha a munkahelyi elvárások túl sok energiát igényelnek?' : lang === 'de' ? 'Wie findest du passende Arbeit? Wie erkennst du deine Stärken? Was kannst du tun, wenn berufliche Anforderungen zu viel Energie kosten?' : 'How can you find work that suits you? How can you recognise your strengths? What can help when work demands too much energy?'}</p><div className="resource-grid">{t.knowledge.map((name, i) => <article className="resource-card" key={name}><span className="eyebrow">{lang === 'hu' ? 'Útmutató' : lang === 'de' ? 'Perspektive' : 'Field note'} · 0{i + 1}</span><h3>{name}</h3><p>{t.knowledgeText[i]}</p></article>)}</div><h2>{t.sections.blog}</h2><p>{lang === 'hu' ? 'A cikkekben felvetett kérdéseket a saját helyzetedre is alkalmazhatod. Nem kell minden tanácsot magadra érvényesnek tekintened: azt keresd, ami neked valóban hasznos.' : lang === 'de' ? 'Du kannst die Fragen aus den Artikeln auf deine eigene Situation beziehen. Nicht jeder Hinweis muss für dich passen – nimm mit, was tatsächlich hilfreich ist.' : 'You can apply the questions in these articles to your own situation. Not every suggestion needs to fit; look for what is genuinely useful to you.'}</p><AppLink lang={lang} page="career" className="button secondary small" data-testid="link-articles-career">{t.allServices}<ArrowRight size={16} /></AppLink></Article>}
        
{page === 'videos' && (
  <div className="video-library">
    {youtubeVideos.length > 0 ? (
      <div
        className="video-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: '24px',
        }}
      >
        {youtubeVideos.map((video) => (
          <article
            className="video-card"
            key={video.id}
            data-testid="card-video"
          >
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  aspectRatio: '16 / 9',
                  overflow: 'hidden',
                  borderRadius: '14px',
                  background: '#ECF1F1',
                }}
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(0,0,0,0.75)',
                    color: '#fff',
                    padding: '12px 17px',
                    borderRadius: '12px',
                    fontSize: '20px',
                  }}
                  aria-hidden="true"
                >
                  ▶
                </span>
              </div>

              <div className="video-caption">
                <h2 style={{ fontSize: '17px', lineHeight: 1.4 }}>
                  {video.title}
                </h2>
                <p style={{ fontSize: '13px', opacity: 0.7 }}>
                  {video.published
                    ? new Date(video.published).toLocaleDateString(
                        lang === 'hu'
                          ? 'hu-HU'
                          : lang === 'de'
                          ? 'de-DE'
                          : 'en-US'
                      )
                    : ''}
                </p>
              </div>
            </a>
          </article>
        ))}
      </div>
    ) : (
      <div className="coming-soon">
        <span className="eyebrow">{t.nav.library}</span>
        <h2>{t.comingTitle}</h2>
        <p>
          {lang === 'hu'
            ? 'Hamarosan itt jelennek meg a YouTube-csatornánk videói.'
            : lang === 'de'
            ? 'Hier erscheinen bald die Videos unseres YouTube-Kanals.'
            : 'Videos from our YouTube channel will appear here soon.'}
        </p>
      </div>
    )}

    <div className="video-platform-links">
      <a
        className="button secondary small"
        href="https://www.youtube.com/channel/UC6Cc5M2KPhuKr3Z2A4dr-Hg"
        target="_blank"
        rel="noopener noreferrer"
      >
        {lang === 'hu'
          ? 'YouTube-csatorna megnyitása'
          : lang === 'de'
          ? 'YouTube-Kanal öffnen'
          : 'Open YouTube channel'}
        <ArrowRight size={15} />
      </a>
    </div>

    <AppLink
      lang={lang}
      page="articles"
      className="text-link video-articles"
      data-testid="link-videos-articles"
    >
      {t.nav.articles}
      <ArrowRight size={15} />
    </AppLink>
  </div>
)}

        {page === 'faq' && <Article aside={t.page.faq[0]}><p>{lang === 'hu' ? 'Nem találod a kérdésed? Nem szükséges kész kérdéssel érkezned az első beszélgetésre.' : lang === 'de' ? 'Deine Frage ist nicht dabei? Du musst keine fertige Frage zum Erstgespräch mitbringen.' : 'Did not find your question? You do not need to arrive with a perfectly formed question.'}</p><div className="faq-list">{t.faqs.map(([question, answer], index) => <details className="faq-item" key={question}><summary data-testid={`faq-question-${index}`}>{question}</summary><div className="faq-answer">{answer}</div></details>)}</div><AppLink lang={lang} page="contact" className="button" style={{ marginTop: 28 }} data-testid="button-faq-contact">{t.linkContact}<ArrowRight size={16} /></AppLink></Article>}
        {page === 'contact' && <div className="contact-grid"><aside className="contact-note"><span className="eyebrow" style={{ color: '#e1b6d9' }}>{t.introCta}</span><h2>{lang === 'hu' ? 'Díjmentes, 30 perces első beszélgetés' : lang === 'de' ? 'Kostenloses 30-minütiges Erstgespräch' : 'Free 30-minute introductory call'}</h2><p>{t.contactStep}</p><p>{t.noDiagnosis}</p><p><strong><a href={`mailto:${contactAddress}`}>{t.contactEmail}</a></strong></p><p><strong><a href="tel:+36305948322">+36 30 594 8322</a></strong></p></aside><form className="contact-form" onSubmit={onSubmit}><h2 style={{ font: "500 32px 'Newsreader',serif", color: 'var(--navy)', marginBottom: 22 }}>{t.formTitle}</h2><div className="field"><label htmlFor="contact-name">{t.name}</label><input id="contact-name" name="name" required autoComplete="name" data-testid="input-contact-name" /></div><div className="field"><label htmlFor="contact-email">{t.email}</label><input id="contact-email" type="email" name="email" required autoComplete="email" data-testid="input-contact-email" /></div><div className="field"><label htmlFor="contact-need">{t.need}</label><textarea id="contact-need" name="need" required data-testid="input-contact-message" /></div><div className="field"><label htmlFor="contact-pref">{t.preference}</label><select id="contact-pref" name="preference" data-testid="select-contact-preference"><option value="email">{t.emailPref}</option><option value="phone">{t.phonePref}</option></select></div><label className="consent"><input type="checkbox" required data-testid="checkbox-contact-consent" /><span>{t.consent} <AppLink lang={lang} page="privacy" data-testid="link-contact-privacy">{t.cookie}</AppLink></span></label><div
  id="contact-turnstile"
  style={{ marginTop: 16, marginBottom: 16 }}
/><button className="button" type="submit" data-testid="button-submit-contact">{t.submit}<ArrowRight size={16} /></button>{formSent && <p className="form-state" role="status" data-testid="status-form-demo">{t.formNotice}</p>}</form></div>}
        {page === 'contact' && <section style={{ marginTop: '60px', padding: '36px', background: '#ECF1F1', borderRadius: '20px' }}><h2>{t.newsletterTitle}</h2><p>{t.newsletterText}</p><form onSubmit={onNewsletterSubmit} style={{ display: 'grid', gap: '18px', maxWidth: '520px', marginTop: '24px' }}><div className="field"><label htmlFor="newsletter-name">{t.name}</label><input id="newsletter-name" name="name" required autoComplete="name" /></div><div className="field"><label htmlFor="newsletter-email">{t.email}</label><input id="newsletter-email" name="email" type="email" required autoComplete="email" /></div><label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
  <input
    type="checkbox"
    name="newsletterConsent"
    required
    style={{ marginTop: '4px' }}
  />
  <span>
    {lang === 'hu'
      ? 'Hozzájárulok, hogy az Iránytű Neurodiverz Karrier Műhely hírleveleket küldjön nekem e-mailben.'
      : lang === 'de'
      ? 'Ich stimme zu, E-Mail-Newsletter von Iránytű Neurodiverz Karrier Műhely zu erhalten.'
      : 'I agree to receive email newsletters from Iránytű Neurodiverz Karrier Műhely.'}
  </span>
  <div
  id="newsletter-turnstile"
  style={{ marginTop: '8px', marginBottom: '8px' }}
/>
</label>
<button type="submit" className="button">{t.newsletterSubmit}<ArrowRight size={16} /></button></form></section>}
        {page === 'privacy' && (
  <section className="privacy-document">
          <h2>Adatkezelési Tájékoztató</h2>

          <p>Kovács-Pajor Michaela e.v. (a továbbiakban: Szolgáltató, Adatkezelő) mint adatkezelő, magára nézve kötelezőnek ismeri el jelen jogi közlemény tartalmát.</p>

          <p>Adatkezelő fenntartja magának a jogot jelen tájékoztató megváltoztatására, ez esetben a módosított szabályzatot nyilvánosan közzéteszi.</p>

          <p>Jelen közleményhez kapcsolódó kérdések esetén e-mailben szívesen válaszolok.</p>

          <p>Adatkezelő elkötelezett ügyfelei és partnerei személyes adatainak védelmében, kiemelten fontosnak tartja ügyfelei információs önrendelkezési jogának tiszteletben tartását, a személyes adatokat bizalmasan kezeli, és megtesz minden olyan biztonsági, technikai és szervezési intézkedést, mely az adatok biztonságát garantálja.</p>

          <h2>1. Az Adatkezelési Tájékoztató célja</h2>

          <p>Jelen Adatkezelési Tájékoztató célja, hogy a www.kovacsmichaela.hu weboldal és a Kovács Michaela HR Mentor és Szupervizor Facebook és Instagram oldal felhasználói és egyéb úton kapcsolatba kerülő személyek (a továbbiakban együttesen: Felhasználók/Adatközlők) által, a weboldal, a facebook és instagram oldal használata során, valamint a kapcsolódó zárt csoportokra és meghirdetett eseményekre, konzultációkra vonatkozó jelentkezési lapok használata során megadott és a weboldal üzemeltetője által kezelt adatok kezelésére vonatkozó szabályokat meghatározza.</p>

          <p>Az Adatkezelési Tájékoztató a weboldalra látogatók által önkéntes hozzájárulással megadott, illetve a használatból eredő adatok (Cookiek) tárolására és kezelésére is vonatkozik.</p>
          <h2>2. Az adatkezelő adatai, elérhetőségei</h2>

          <p>Név: Kovács-Pajor Michaela (továbbiakban: Adatkezelő)</p>

          <p>Székhely: 2030 Érd, Iglice utca 1.</p>

          <p>Nyilvántartási szám: 51746449</p>

          <p>Adószám: 68437978-1-33</p>

          <p>Telefonszám: +36 30 594 8322</p>

          <p>E-mail: michaela.kovacs2025@gmail.com</p>
          <h2>3. A kezelt személyes adatok</h2>

          <p>A felhasználói önkéntes adatszolgáltatás során az alábbi személyes adatokat kezeli az Adatkezelő a kapcsolatfelvétel és kapcsolattartás, a programokra, eseményekre való jelentkezés illetve a számla kiállítása során:</p>

      <ul>
          <li>Név (vezetéknév és keresztnév): – cél: azonosítás</li>
          <li>E-mail cím: – cél: kapcsolatfelvétel és azonosítás, kapcsolattartás, értesítés programokról, eseményekről, hírekről, számlaküldés</li>
          <li>Tárgy: – cél: kapcsolatfelvétel céljának ismertetése</li>
          <li>Üzenet: – cél: a kapcsolatfelvétel céljának ismertetése</li>
      </ul>

      <ul>
          <li>Név: – cél: azonosítás</li>
          <li>Telefonszám – cél: kapcsolatfelvétel, kapcsolattartás</li>
          <li>Számlázási név, cím – cél: számla kiállításához szükséges adatok megadása</li>
      </ul>
          <h2>4. Cookie-k (sütik) kezelése</h2>

          <p>Amikor a Felhasználó a weboldalt olvassa, az azzal is járhat, hogy cookie-kkal vagy hasonló technológiákkal találkozik böngészőjének vagy eszközének azonosítása érdekében.</p>
          <h2>5. Az adatfeldolgozók személye</h2>
          <p>Adatfeldolgozó az a természetes, vagy jogi személy, amely az Adatkezelő nevében személyes adatokat kezel. A Felhasználók személyes adataival kapcsolatban adatfeldolgozóként (Adatfeldolgozó) az alábbi cégek, személyek járnak el (elérhetőségekkel együtt), illetve a személyes adatokhoz az alábbi cégek, személyek férhetnek hozzá:</p>

          <p>Adatkezelőként, minden adat tekintetében Kovács-Pajor Michaela e.v. (2030 Érd, Iglice utca 1, michaela.kovacs2025@gmail.com ),</p>

          <p>Folyószámlát vezető pénzintézet/fizetési szolgáltatásban résztvevő vállalkozásként, a számlázási adatok tekintetében:</p>

          <p>OTP Bank Nyrt.</p>
          <p>Székhelye: 1051 Budapest, Nádor u. 16.</p>
          <p>Cégjegyzékszáma: 01-10-041585</p>
          <p>Telefonszáma: +36 1 473 5000</p>
          <p>Honlap: www.otpbank.hu</p>
          <p>Számlázó program üzemeltetőiként, számlázásnál kezelt adatok tekintetében:</p>


          <p>www.szamlazz.hu</p>
          <p>Szolgáltatást nyújtó cég neve: KBOSS.hu Kft.</p>
          <p>Szolgáltatást nyújtó cég címe: 1031 Budapest, Záhony utca 7.</p>
          <p>Adószáma: 13421739-2-41</p>
          <p>Cégjegyzékszáma: 01-09-303201</p>
          <p>Honlap: https://www.szamlazz.hu/</p>
          <h2>6. Az adatok fizikai tárolási helyei</h2>
          <p>A Felhasználók személyes adatai a következő módon kerülhetnek az Adatkezelő kezelésébe: egyfelől az internetes kapcsolat fenntartásával összefüggésben a Felhasználók által használt számítógéppel, böngészőprogrammal, internetes címmel, a látogatott oldalakkal kapcsolatos technikai adatok automatikusan képződnek a számítógépes rendszerekben, másfelől az adatokat a Felhasználók is megadhatják a honlap használata során, email írás, messenger üzenet küldése során, ha személyes kapcsolatba kívánnak lépni az Adatkezelővel. Az adatokat az Adatkezelő számítógépe tartalmazza.</p>
          <h2>7. Az adatkezelés időtartama</h2>
          <p>A megadott adatokat határozatlan ideig vagy az érintett hozzájárulásának visszavonásáig kezeli az Adatkezelő.</p>
          <h2>8. Az adatkezelés célja, módja és jogalapja</h2>
          <h3>8.1. Általános adatkezelési irányelvek</h3>
          <p>A személyes adatok kezelését Adatkezelő az alábbi alapelvek betartása mellett végzi:</p>
          <p>Személyes adat kizárólag meghatározott célból, jog gyakorlása és kötelezettség teljesítése érdekében kezelhető. Az adatkezelésnek minden szakaszában meg kell felelnie az adatkezelés céljának, az adatok felvételének és kezelésének tisztességesnek és törvényesnek kell lennie.</p>
          <p>Csak olyan személyes adat kezelhető, amely az adatkezelés céljának megvalósításához elengedhetetlen, a cél elérésére alkalmas. A személyes adat csak a cél megvalósulásához szükséges mértékben és ideig kezelhető.</p>
          <p>Az adatkezelés során biztosítani kell az adatok pontosságát, teljességét és – ha az adatkezelés céljára tekintettel szükséges – naprakészségét, valamint azt, hogy az érintettet csak az adatkezelés céljához szükséges ideig lehessen azonosítani.</p>
          <p>Adatkezelő tevékenységének adatkezelései önkéntes hozzájáruláson, illetve törvényi felhatalmazáson alapulnak. Az önkéntes hozzájáruláson alapuló adatkezelések esetében a Felhasználók e hozzájárulásukat az adatkezelés bármely szakában visszavonhatják. Bizonyos esetekben a megadott adatok egy körének kezelését, tárolását, továbbítását jogszabályok teszik kötelezővé, melyről ügyfeleink külön értesítést kapnak. Felhívjuk az Anya-kapocs szerveződés részére adatközlők figyelmét, hogy amennyiben nem saját személyes adataikat adják meg, az adatközlő kötelessége az érintett hozzájárulásának beszerzése.</p>
          <p>Adatkezelő adatkezelési alapelvei összhangban vannak az adatvédelemmel kapcsolatos hatályos jogszabályokkal, így különösen az alábbiakkal:</p>
        <ul>
          <li>2011. évi CXII. törvény – az információs önrendelkezési jogról és az információ-szabadságról (Infotv.);</li>
          <li>Az Európai Parlament és a Tanács (EU) 2016/679 rendelete (2016. április 27.) – a természetes személyeknek a személyes adatok kezelése tekintetében történő védelméről és az ilyen adatok szabad áramlásáról, valamint a 95/46/EK rendelet hatályon kívül helyezéséről (általános adatvédelmi rendelet, GDPR);</li>
          <li>2017. évi LIII. törvény – a pénzmosás és terrorizmus finanszírozása megelőzéséről és megakadályozásáról (Pmt.);</li>
          <li>2013. évi CCXXXVII. törvény – a hitelintézetekről és a pénzügyi vállalkozásokról (Hpt.).</li>
        </ul>
          <h3>8.2. Az adatkezelés jogalapja:</h3>
          <p>az információs önrendelkezési jogról és az információszabadságról szóló 2011. évi CXII. törvény 5. § (1) bekezdés a) pontja alapján az érintett hozzájárulása.</p>

          <h3>8.3. Adatkezeléssel érintettek köre:</h3>
          <p>www.anyakapocs.hu weboldal, az Anya-kapocs Facebook oldalának, Instagram oldalának látogatói, az adatokat egyéb módon önkéntesen megadók köre.</p>

          <h3>8.4. Hozzájárulás az adatkezeléshez:</h3>
          <p>A honlap látogatói a honlap, valamint üzenetküldéssel, adatai megadásával adatközlők kifejezetten és önkéntesen hozzájárulnak ahhoz, hogy személyes adataikat az adatkezelő a jelen tájékoztatóban leírt módon kezelje.</p>

          <h3>8.5. Az adatkezelés módja:</h3>
          <p>Adatkezelő a beérkező adatokat harmadik fél számára nem hozzáférhető, kettős biztonsági beléptetésű levelezési rendszerében, a Google tárhelyén tárolja el annak törlésére vonatkozó kérés beérkezéséig.</p>

          <h3>8.6. Az adatkezelés célja:</h3>
          <p>kapcsolatfelvétel, kapcsolattartás, számlázás</p>
          <h2>9. Az adatközlők jogai</h2>

          <h3>9.1. Tájékoztatáshoz való jog</h3>

          <p>Adatkezelő megfelelő intézkedéseket hoz annak érdekében, hogy az érintettek részére a személyes adatok kezelésére vonatkozó, a GDPR 13. és a 14. cikkben említett valamennyi információt és a 15–22. és 34. cikk szerinti minden egyes tájékoztatást tömör, átlátható, érthető és könnyen hozzáférhető formában, világosan és közérthetően megfogalmazva nyújtsa.</p>

          <h3>9.2 Az érintett hozzáféréshez való joga</h3>

          <p>Az érintett jogosult arra, hogy az adatkezelőtől visszajelzést kapjon arra vonatkozóan, hogy személyes adatainak kezelése folyamatban van-e, és ha ilyen adatkezelés folyamatban van, jogosult arra, hogy a személyes adatokhoz és a következő információkhoz hozzáférést kapjon: az adatkezelés céljai; az érintett személyes adatok kategóriái; azon címzettek vagy címzettek kategóriái, akikkel, illetve amelyekkel a személyes adatokat közölték vagy közölni fogják, ideértve különösen a harmadik országbeli címzetteket, illetve a nemzetközi szervezeteket; a személyes adatok tárolásának tervezett időtartama; a helyesbítés, törlés vagy adatkezelés korlátozásának és a tiltakozás joga; a felügyeleti hatósághoz címzett panasz benyújtásának joga; az adatforrásokra vonatkozó információ; az automatizált döntéshozatal ténye, ideértve a profilalkotást is, valamint az alkalmazott logikára és arra vonatkozó érthető információk, hogy az ilyen adatkezelés milyen jelentőséggel bír, és az érintettre nézve milyen várható következményekkel jár. Az adatkezelő a kérelem benyújtásától számított legfeljebb egy hónapon belül adja meg a tájékoztatást.</p>

          <h3>9.3 Helyesbítés joga</h3>

          <p>Az érintett kérheti az Adatkezelő által kezelt, rá vonatkozó pontatlan személyes adatok helyesbítését és a hiányos adatok kiegészítését.</p>
          <h3>9.4 Törléshez való jog</h3>

<p>Az érintett az alábbi indokok valamelyikének fennállása esetén jogosult arra, hogy kérésére Adatkezelő indokolatlan késedelem nélkül törölje a rá vonatkozó személyes adatokat:</p>

<ul>
  <li>személyes adatokra már nincs szükség abból a célból, amelyből azokat gyűjtötték vagy más módon kezelték;</li>
  <li>az érintett visszavonja az adatkezelés alapját képező hozzájárulását, és az adatkezelésnek nincs más jogalapja;</li>
  <li>az érintett tiltakozik az adatkezelés ellen, és nincs elsőbbséget élvező jogszerű ok az adatkezelésre;</li>
  <li>a személyes adatokat jogellenesen kezelték;</li>
  <li>a személyes adatokat az adatkezelőre alkalmazandó uniós vagy tagállami jogban előírt jogi kötelezettség teljesítéséhez törölni kell;</li>
  <li>a személyes adatok gyűjtésére információs társadalommal összefüggő szolgáltatások kínálásával kapcsolatosan került sor.</li>
</ul>

<p>Az adatok törlése nem kezdeményezhető, ha az adatkezelés szükséges:</p>

<ul>
  <li>a véleménynyilvánítás szabadságához és a tájékozódáshoz való jog gyakorlása céljából;</li>
  <li>a személyes adatok kezelését előíró, az adatkezelőre alkalmazandó uniós vagy tagállami jog szerinti kötelezettség teljesítése, illetve közérdekből vagy az adatkezelőre ruházott közhatalmi jogosítvány gyakorlása keretében végzett feladat végrehajtása céljából;</li>
  <li>a népegészségügy területét érintő, vagy archiválási, tudományos és történelmi kutatási célból vagy statisztikai célból, közérdek alapján;</li>
  <li>vagy jogi igények előterjesztéséhez, érvényesítéséhez, illetve védelméhez.</li>
</ul>
<h3>9.5 Az adatkezelés korlátozásához való jog</h3>

<p>Az érintett kérésére adatkezelő korlátozza az adatkezelést, ha az alábbi feltételek valamelyike teljesül:</p>

<ul>
  <li>az érintett vitatja a személyes adatok pontosságát, ez esetben a korlátozás arra az időtartamra vonatkozik, amely lehetővé teszi, a személyes adatok pontosságának ellenőrzését;</li>

  <li>az adatkezelés jogellenes, és az érintett ellenzi az adatok törlését, és ehelyett kéri azok felhasználásának korlátozását;</li>

  <li>az adatkezelőnek már nincs szüksége a személyes adatokra adatkezelés céljából, de az érintett igényli azokat jogi igények előterjesztéséhez, érvényesítéséhez vagy védelméhez;</li>

  <li>vagy az érintett tiltakozott az adatkezelés ellen; ez esetben a korlátozás arra az időtartamra vonatkozik, amíg megállapításra nem kerül, hogy az adatkezelő jogos indokai elsőbbséget élveznek-e az érintett jogos indokaival szemben.</li>
</ul>

<p>Ha az adatkezelés korlátozás alá esik, a személyes adatokat a tárolás kivételével csak az érintett hozzájárulásával, vagy jogi igények előterjesztéséhez, érvényesítéséhez vagy védelméhez, vagy más természetes vagy jogi személy jogainak védelme érdekében, vagy az Unió, illetve valamely tagállam fontos közérdekéből lehet kezelni.</p>
<h3>9.6 Adathordozáshoz való jog</h3>

<p>Az érintett jogosult arra, hogy a rá vonatkozó, általa az adatkezelő rendelkezésére bocsátott személyes adatokat tagolt, széles körben használt, géppel olvasható formátumban megkapja, és ezeket az adatokat egy másik adatkezelőnek továbbítsa.</p>
<h3>9.7 Tiltakozás joga</h3>

<p>Az érintett jogosult arra, hogy a saját helyzetével kapcsolatos okokból bármikor tiltakozzon személyes adatainak közérdekű vagy az adatkezelőre ruházott közhatalmi jogosítvány gyakorlásának keretében végzett feladat végrehajtásához szükséges adatkezelés, vagy az adatkezelő vagy egy harmadik fél jogos érdekeinek érvényesítéséhez szükséges kezelése ellen, ideértve az említett rendelkezéseken alapuló profilalkotást is. Tiltakozás esetén az adatkezelő a személyes adatokat nem kezelheti tovább, kivéve, ha azt olyan kényszerítő erejű jogos okok indokolják, amelyek elsőbbséget élveznek az érintett érdekeivel, jogaival és szabadságaival szemben, vagy amelyek jogi igények előterjesztéséhez, érvényesítéséhez vagy védelméhez kapcsolódnak.</p>
<h3>9.8. Adatvédelmi incidens</h3>

<p>Egy esetleges adatvédelmi incidens esetén adatkezelő tájékoztatja Adatkezelőt az adatvédelmi incidens körülményeiről, hatásairól és az elhárítására megtett intézkedésekről, továbbá – az érintett személyes adatainak továbbítása esetén – az adattovábbítás jogalapjáról és címzettjéről.</p>

<p>Az adatkezelő az adatvédelmi incidenssel kapcsolatos intézkedések ellenőrzése, valamint az érintett tájékoztatása céljából nyilvántartást vezet, amely tartalmazza az érintett személyes adatok körét, az adatvédelmi incidenssel érintettek körét és számát, az adatvédelmi incidens időpontját, körülményeit, hatásait és az elhárítására megtett intézkedéseket, valamint az adatkezelést előíró jogszabályban meghatározott egyéb adatokat.</p>
<h3>9.9 Automatizált döntéshozatal egyedi ügyekben, beleértve a profilalkotást</h3>

<p>Az érintett jogosult arra, hogy ne terjedjen ki rá az olyan, kizárólag automatizált adatkezelésen – ideértve a profilalkotást is – alapuló döntés hatálya, amely rá nézve joghatással járna vagy őt hasonlóképpen jelentős mértékben érintené.</p>
<h3>9.10 Visszavonás joga</h3>

<p>Az érintett jogosult arra, hogy hozzájárulását bármikor visszavonja.</p>
<h3>9.11 Jogorvoslat</h3>

<p>Amennyiben az adatkezelő megsérti a személyes adatok védelméhez fűződő jogokat, az adatközlőnek, Felhasználónak joga van a jogorvoslathoz.</p>
<h3>9.12 Bírósághoz fordulás joga</h3>

<p>Az érintett a jogainak megsértése esetén az adatkezelő ellen bírósághoz fordulhat. A bíróság az ügyben soron kívül jár el.</p>
<h3>9.13 Adatvédelmi hatósági eljárás</h3>

<p>Panasszal a Nemzeti Adatvédelmi és Információszabadság Hatóságnál lehet élni:</p>

<p>Név: Nemzeti Adatvédelmi és Információszabadság Hatóság</p>

<p>Székhely: 1125 Budapest, Szilágyi Erzsébet fasor 22/C.</p>

<p>Levelezési cím: 1530 Budapest, Pf.: 5.</p>

<p>Telefon: 0613911400</p>

<p>E-mail: ugyfelszolgalat@naih.hu</p>

<p>Honlap: http://www.naih.hu</p>
<h2>10. Egyéb rendelkezések</h2>

<p>Az Adatkezelő fenntartja a jogot, hogy jelen Adatkezelési Tájékoztatót egyoldalúan módosítsa., a módosított szabályzat nyilvánossá tételével. A Felhasználó a honlap használatával elfogadja a módosított Adatkezelési Tájékoztatóban foglaltakat.</p>

<p>Amennyiben a Felhasználó a szolgáltatás igénybevételéhez harmadik fél adatait adta meg, vagy a honlap használata során bármilyen módon kárt okozott, az Adatkezelő jogosult a Felhasználóval szembeni kártérítés érvényesítésére.</p>

<p>Az Adatkezelő a neki megadott személyes adatokat nem ellenőrzi. A megadott adatok helyességéért, valódiságáért kizárólag az azt megadó személy a felelős. Bármely Felhasználó e-mail címének megadásakor egyben felelősséget vállal azért, hogy a megadott e-mail címről kizárólag ő veszi igénybe a szolgáltatást.</p>
      </section>
)}

      </div>
    </section>
    {page !== 'contact' && <CTA lang={lang} t={t} />}
  </>;
}

function Article({ aside, children }: { aside: string; children: ReactNode }) {
  return <div className="article-layout"><aside className="article-aside"><strong>Iránytű</strong>{aside}</aside><article className="content">{children}</article></div>;
}

function PricePanel({ t }: { t: Translation }) {
  return <div className="price-panel"><div><strong>{t.pricesTitle}</strong><span>{t.priceUnit}</span></div><strong className="price-amount">{t.price}</strong></div>;
}

function CTA({ lang, t, disclaimer }: { lang: Language; t: Translation; disclaimer?: string }) {
  return <section className="cta-band"><div className="container cta-inner"><div><h2>{t.nextTitle}</h2><p>{t.nextText}</p>{disclaimer && <p className="home-disclaimer">{disclaimer}</p>}</div><AppLink lang={lang} page="contact" className="button light" data-testid="button-cta-contact">{t.introCta}<ArrowRight size={16} /></AppLink></div></section>;
}

function Footer({ lang, t }: { lang: Language; t: Translation }) {
  return <footer className="footer"><div className="container"><div className="footer-grid"><div><div className="footer-brand">{t.footerLine}</div><p>{t.homeNote} {t.homeIntro}</p></div><div><h3>{t.explore}</h3><div className="footer-links"><AppLink lang={lang} page="about" data-testid="footer-about">{t.nav.about}</AppLink><AppLink lang={lang} page="career" data-testid="footer-career">{t.nav.career}</AppLink><AppLink lang={lang} page="workshops" data-testid="footer-workshops">{t.nav.workshops}</AppLink><AppLink lang={lang} page="prices" data-testid="footer-prices">{t.nav.prices}</AppLink><AppLink lang={lang} page="articles" data-testid="footer-articles">{t.nav.articles}</AppLink></div></div><div><h3>{t.footerContact}</h3><div className="footer-links"><AppLink lang={lang} page="contact" data-testid="footer-contact">{t.nav.contact}</AppLink><AppLink lang={lang} page="faq" data-testid="footer-faq">{t.nav.faq}</AppLink><AppLink lang={lang} page="privacy" data-testid="footer-privacy">{t.cookie}</AppLink><AppLink lang={lang} page="imprint" data-testid="footer-imprint">{t.imprint}</AppLink></div></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} {t.brand} · {t.copyright}</span><span>{lang === 'hu' ? 'Elfogadó, gyakorlatias karriertámogatás.' : lang === 'de' ? 'Wertschätzende, praktische Karrierebegleitung.' : 'Respectful, practical career support.'}</span></div></div></footer>;
}

function App() {
  return <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Site /></WouterRouter>;
}

export default App;

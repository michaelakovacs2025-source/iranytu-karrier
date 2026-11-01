export type PrivacyLanguage = 'hu' | 'en' | 'de';

export type PrivacySection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

type PrivacyPageCopy = {
  draft: string;
  sections: PrivacySection[];
};

export const privacyPageCopy: Record<PrivacyLanguage, PrivacyPageCopy> = {
  hu: {
    draft: 'Munkaváltozat: a feltöltött tájékoztató alapján az oldal jelenlegi működéséhez igazítottam. A vállalkozási adatok, az adatkezelés jogalapjai, a megőrzési idők és a szolgáltatók adatai közzététel előtt ellenőrzendők. Ez nem jogi tanácsadás.',
    sections: [
      {
        title: 'Adatkezelő és elérhetőségei',
        paragraphs: [
          'Adatkezelő: Kovács-Pajor Michaela e.v. Székhely: 2030 Érd, Iglice utca 1. Nyilvántartási szám: 51746449. Adószám: 68437978-1-33. Telefonszám: +36 30 594 8322. E-mail: michaela.kovacs2025@gmail.com.',
        ],
      },
      {
        title: 'Kapcsolatfelvételi űrlap',
        paragraphs: [
          'Az űrlap a nevedet, e-mail-címedet, üzenetedet és a választott kapcsolattartási módot kéri. Az elküldés egy előkészített levelet nyit meg a saját e-mail-alkalmazásodban. A weboldal nem küldi el és nem tárolja automatikusan az adatokat; az üzenet csak akkor érkezik meg, ha az e-mail-alkalmazásodban a Küldés gombra kattintasz.',
          'Kérjük, ne adj meg szükségtelen egészségügyi vagy diagnózisadatot. Az elküldött e-mailt az e-mail-szolgáltatók rendszerei továbbíthatják és tárolhatják.',
        ],
      },
      {
        title: 'Hírlevél-feliratkozás',
        paragraphs: [
          'A hírlevél-kérő űrlap csak a nevedet és az e-mail-címedet kéri. Kitöltése egy előkészített levelet nyit meg; a weboldal nem menti el és nem adja automatikusan hírlevél-listához az e-mail-címedet. A feliratkozási kérelem csak akkor jut el az adatkezelőhöz, ha a levelezőalkalmazásodban elküldöd a levelet. A későbbi leiratkozást e-mailben kérheted.',
        ],
      },
      {
        title: 'Technikai adatok, sütik és külső szolgáltatások',
        paragraphs: [
          'A weboldal betűtípusokat tölt be a Google Fonts szolgáltatásból, ezért a böngésződ kapcsolatba léphet a Google szervereivel. A tárhelyszolgáltató a weboldal kiszolgálásához és biztonságához szükséges technikai naplóadatokat kezelhet.',
          'A jelenlegi oldal nem használ Google Analytics- vagy hirdetési remarketing-kódot. Ha YouTube- vagy Vimeo-videó kerül beágyazásra, a videószolgáltató a tartalom betöltésekor adatokat kezelhet. A külső szolgáltatók adatkezelésére a saját tájékoztatóik vonatkoznak.',
        ],
      },
      {
        title: 'Szolgáltatások és számlázás',
        paragraphs: [
          'Fizetős szolgáltatás igénybevételekor a számla kiállításához jogszabály szerint szükséges számlázási adatok kezelése külön történik. A megküldött dokumentum a Számlázz.hu-t (KBOSS.hu Kft.) és az OTP Bank Nyrt.-t nevezi meg számlázási, illetve banki szolgáltatóként; ezek aktuális használatát közzététel előtt ellenőrizni kell.',
        ],
      },
      {
        title: 'Megőrzés és az érintettek jogai',
        paragraphs: [
          'A weboldal önmagában nem őrzi meg az űrlapadatokat. Ha elküldesz egy e-mailt, az adatkezelő a megkeresés megválaszolásához, a szolgáltatás egyeztetéséhez és az esetleges jogszabályi kötelezettségek teljesítéséhez szükséges ideig kezeli azt. A számlázási adatok megőrzésére jogszabályi határidők vonatkozhatnak.',
          'Az alkalmazandó feltételek szerint kérhetsz tájékoztatást és hozzáférést, helyesbítést, törlést vagy korlátozást, kérheted az adathordozhatóságot, tiltakozhatsz az adatkezelés ellen, és visszavonhatod a hozzájárulásodat. Kérelmedet a fenti e-mail-címre küldheted.',
        ],
      },
      {
        title: 'Panasz benyújtása',
        paragraphs: [
          'Nemzeti Adatvédelmi és Információszabadság Hatóság (NAIH): 1125 Budapest, Szilágyi Erzsébet fasor 22/C.; levelezési cím: 1530 Budapest, Pf. 5.; telefon: +36 1 391 1400; e-mail: ugyfelszolgalat@naih.hu; weboldal: https://www.naih.hu/.',
        ],
      },
    ],
  },
  en: {
    draft: 'Working draft: this notice adapts the supplied document to the website’s current behaviour. Please verify the business details, legal bases, retention periods and service providers before publication. This is not legal advice.',
    sections: [
      {
        title: 'Data controller and contact details',
        paragraphs: [
          'Controller: Kovács-Pajor Michaela e.v. Registered address: 2030 Érd, Iglice utca 1, Hungary. Registration number: 51746449. Tax number: 68437978-1-33. Phone: +36 30 594 8322. Email: michaela.kovacs2025@gmail.com.',
        ],
      },
      {
        title: 'Contact form',
        paragraphs: [
          'The form asks for your name, email address, message and preferred way to get in touch. Submitting it opens a pre-filled message in your own email app. The website does not send or store the information automatically; the message reaches the controller only if you press Send in your email app.',
          'Please do not include health or diagnostic information unless it is necessary. Email providers may transmit and store a message after you send it.',
        ],
      },
      {
        title: 'Newsletter request',
        paragraphs: [
          'The newsletter form asks only for your name and email address. It opens a pre-filled email; the website does not save your address or automatically add it to a mailing list. The request reaches the controller only after you send the email from your email app. You can ask to unsubscribe by email.',
        ],
      },
      {
        title: 'Technical data, cookies and external services',
        paragraphs: [
          'The website loads fonts from Google Fonts, so your browser may connect to Google servers. The hosting provider may process technical log data needed to serve and secure the website.',
          'The current website does not use Google Analytics or advertising remarketing code. If a YouTube or Vimeo video is embedded, the video provider may process data when the content loads. Those providers’ own privacy notices apply to their services.',
        ],
      },
      {
        title: 'Services and invoicing',
        paragraphs: [
          'If you purchase a paid service, billing details required by law are handled separately for invoicing. The supplied document names Számlázz.hu (KBOSS.hu Kft.) and OTP Bank Nyrt. as invoicing and banking providers; their current use should be confirmed before publication.',
        ],
      },
      {
        title: 'Retention and your rights',
        paragraphs: [
          'The website itself does not retain form entries. If you send an email, the controller keeps it only for as long as needed to respond, discuss the service and meet any legal obligations. Statutory retention periods may apply to invoice records.',
          'Where applicable, you may request information and access, correction, deletion or restriction, request data portability, object to processing, and withdraw consent. Send requests to the email address above.',
        ],
      },
      {
        title: 'Complaints',
        paragraphs: [
          'Hungarian National Authority for Data Protection and Freedom of Information (NAIH): 1125 Budapest, Szilágyi Erzsébet fasor 22/C, Hungary; postal address: 1530 Budapest, Pf. 5; phone: +36 1 391 1400; email: ugyfelszolgalat@naih.hu; website: https://www.naih.hu/.',
        ],
      },
    ],
  },
  de: {
    draft: 'Arbeitsentwurf: Dieser Hinweis wurde an das aktuelle Verhalten der Website angepasst. Bitte prüfe vor der Veröffentlichung die Unternehmensangaben, Rechtsgrundlagen, Speicherfristen und Dienstleister. Dies ist keine Rechtsberatung.',
    sections: [
      {
        title: 'Verantwortliche Person und Kontaktdaten',
        paragraphs: [
          'Verantwortliche: Kovács-Pajor Michaela e.v. Geschäftsanschrift: 2030 Érd, Iglice utca 1, Ungarn. Registrierungsnummer: 51746449. Steuernummer: 68437978-1-33. Telefon: +36 30 594 8322. E-Mail: michaela.kovacs2025@gmail.com.',
        ],
      },
      {
        title: 'Kontaktformular',
        paragraphs: [
          'Das Formular fragt nach deinem Namen, deiner E-Mail-Adresse, deiner Nachricht und dem bevorzugten Kontaktweg. Beim Absenden öffnet sich eine vorausgefüllte Nachricht in deinem eigenen E-Mail-Programm. Die Website versendet oder speichert die Angaben nicht automatisch; die Nachricht erreicht die verantwortliche Person erst, wenn du in deinem E-Mail-Programm auf Senden klickst.',
          'Bitte gib Gesundheits- oder Diagnosedaten nur an, wenn sie wirklich erforderlich sind. E-Mail-Anbieter können eine versendete Nachricht übertragen und speichern.',
        ],
      },
      {
        title: 'Newsletter-Anfrage',
        paragraphs: [
          'Das Newsletter-Formular fragt nur nach deinem Namen und deiner E-Mail-Adresse. Es öffnet eine vorausgefüllte E-Mail; die Website speichert deine Adresse nicht und trägt sie nicht automatisch in eine Mailingliste ein. Die Anfrage erreicht die verantwortliche Person erst, wenn du die E-Mail in deinem E-Mail-Programm absendest. Eine Abmeldung kannst du per E-Mail anfragen.',
        ],
      },
      {
        title: 'Technische Daten, Cookies und externe Dienste',
        paragraphs: [
          'Die Website lädt Schriftarten über Google Fonts. Daher kann dein Browser eine Verbindung zu Google-Servern herstellen. Der Hostinganbieter kann technische Protokolldaten verarbeiten, die für die Bereitstellung und Sicherheit der Website erforderlich sind.',
          'Die aktuelle Website verwendet weder Google Analytics noch Werbe-Remarketing-Code. Wenn ein YouTube- oder Vimeo-Video eingebettet wird, kann der Videodienst beim Laden des Inhalts Daten verarbeiten. Für diese Dienste gelten die jeweiligen Datenschutzhinweise der Anbieter.',
        ],
      },
      {
        title: 'Angebote und Rechnungsstellung',
        paragraphs: [
          'Bei der Buchung eines kostenpflichtigen Angebots werden die gesetzlich erforderlichen Rechnungsdaten getrennt für die Abrechnung verarbeitet. Das bereitgestellte Dokument nennt Számlázz.hu (KBOSS.hu Kft.) und OTP Bank Nyrt. als Rechnungs- beziehungsweise Bankdienstleister; ihre aktuelle Nutzung sollte vor der Veröffentlichung bestätigt werden.',
        ],
      },
      {
        title: 'Speicherdauer und deine Rechte',
        paragraphs: [
          'Die Website selbst speichert keine Formulareingaben. Wenn du eine E-Mail absendest, wird sie nur so lange aufbewahrt, wie es für die Beantwortung, die Abstimmung des Angebots und gesetzliche Pflichten erforderlich ist. Für Rechnungsunterlagen können gesetzliche Aufbewahrungsfristen gelten.',
          'Soweit anwendbar, kannst du Auskunft und Zugang, Berichtigung, Löschung oder Einschränkung verlangen, Datenübertragbarkeit beantragen, der Verarbeitung widersprechen und eine Einwilligung widerrufen. Anfragen kannst du an die oben genannte E-Mail-Adresse senden.',
        ],
      },
      {
        title: 'Beschwerden',
        paragraphs: [
          'Ungarische Behörde für Datenschutz und Informationsfreiheit (NAIH): 1125 Budapest, Szilágyi Erzsébet fasor 22/C, Ungarn; Postanschrift: 1530 Budapest, Pf. 5; Telefon: +36 1 391 1400; E-Mail: ugyfelszolgalat@naih.hu; Website: https://www.naih.hu/.',
        ],
      },
    ],
  },
};

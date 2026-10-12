# SdT Navigator

Eine schnelle, einfach zu bedienende Website zum Durchsuchen der Stand-der-Technik-Bibliothek.
Sie kommt ohne Server, Framework und Build-Werkzeuge aus.

## Nutzung

`index.html` im Browser öffnen (Doppelklick genügt). Alternativ lokal ausliefern:

```bash
python -m http.server 8000 --directory website
```

## Daten aktualisieren

Die Website liest ausschließlich `data.js`. Diese Datei wird aus den OSCAL-Dateien des
Repositorys erzeugt:

```bash
python website/build.py
```

Das Skript benötigt nur die Python-Standardbibliothek (ab Python 3.9).

## Funktionen

- **Suche** über ID, Titel, Anforderungstext, Hinweise, Schlagwörter, Zielobjekte und
  Gefährdungen. Umlaute werden toleriert. Eingaben wie `ISO 8.13`, `A.5.15` oder
  `OPS.1.1.3` führen direkt zum passenden Mapping.
- **Facettenfilter** mit Trefferzahlen: Verbindlichkeit, Aufwand, Sicherheitsniveau,
  Schutzziel, Praktik, Zielobjekt, Dokumentation, Schlagwort, Gefährdung, Tätigkeit,
  Kollektion, Herkunft und Verknüpfungen. Jeder Filterzustand hat eine teilbare URL.
- **Anforderungsseite**: Anforderungstext mit hervorgehobenen Parametern, Aufbau nach
  Satzschablone, Umsetzungshinweise, Unteranforderungen, Abhängigkeiten in beide
  Richtungen, verwandte Anforderungen, Entsprechungen in ISO 27001 und IT-Grundschutz 2023,
  Umsetzungsbeispiele, Anpassungen in Kollektionen und elementare Gefährdungen.
- **Kollektionen** (Grundschutz++, Lieferkettensicherheit, WLAN, Mindeststandard TLS,
  Risikomanagement) in ihrer eigenen Gliederung und Nummerierung.
- **Mappings** in beide Richtungen.
- **Umsetzungsbeispiele** aus dem Implementation Layer.
- **Glossar** aller Vokabulare aus `documentation/namespaces`.
- **Merkliste** im Browser mit CSV-Export und teilbarem Link. CSV-Export gibt es auch für
  jede Ergebnisliste.
- Helles und dunkles Farbschema, mobil nutzbar, Tastaturkürzel `/` für die Suche.

## Hinweise zur Datenaufbereitung

- Anforderungen mit derselben ID werden kollektionsübergreifend zusammengeführt.
  Abweichende Texte in Profilen, etwa eine höhere Verbindlichkeit im Mindeststandard TLS,
  erscheinen als „Anpassung“.
- Das Mapping IT-Grundschutz 2023 → Grundschutz++ verweist auf einen älteren Katalogstand.
  Die Ziel-IDs werden deshalb über die UUID (`oscal_uuid` bzw. `alt-identifier`) dem
  aktuellen Katalog zugeordnet. Nachgeführte IDs erscheinen als „vorher …“.
- Verweise, die sich nicht auflösen lassen, werden grau markiert statt verschwiegen.

Inoffizielle Ansicht. Maßgeblich sind die OSCAL-Dateien im Repository
(Lizenz der Inhalte: CC BY-SA 4.0).

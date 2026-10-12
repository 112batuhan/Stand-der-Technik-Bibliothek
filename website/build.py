#!/usr/bin/env python3
"""Baut website/data.js aus den OSCAL-Dateien der Stand-der-Technik-Bibliothek.

Aufruf (aus dem Repository-Wurzelverzeichnis oder von überall):
    python website/build.py

Das Skript liest ausschließlich Dateien im Repository und schreibt eine einzige
Datei ``website/data.js``. Die Website funktioniert danach ohne Server per
Doppelklick auf ``website/index.html``.
"""
from __future__ import annotations

import csv
import json
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = Path(__file__).resolve().parent / "data.js"
NS = ROOT / "documentation" / "namespaces"

PARAM_RE = re.compile(r"\{\{\s*insert:\s*param,\s*([^}\s]+)\s*\}\}")

# Kollektionen (Anwenderkataloge, Profile, Entwürfe). Die erste ist die Basis.
COLLECTIONS = [
    {
        "key": "gspp",
        "short": "Grundschutz++",
        "path": "control_layer/Grundschutz++/Grundschutz++-resolved_catalog.json",
        "kind": "Anwenderkatalog",
    },
    {
        "key": "lks",
        "short": "Lieferkettensicherheit",
        "path": "control_layer/Lieferkettensicherheit/Lieferkettensicherheit-resolved_catalog.json",
        "kind": "Anwenderkatalog",
    },
    {
        "key": "wlan",
        "short": "WLAN",
        "path": "control_layer/WLAN/WLAN-resolved_catalog.json",
        "kind": "Anwenderkatalog",
    },
    {
        "key": "tls",
        "short": "Mindeststandard TLS",
        "path": "control_layer/Mindeststandard-TLS/Entwurf-Mindeststandard-TLS-catalog.json",
        "kind": "Entwurf",
    },
    {
        "key": "risk",
        "short": "Risikomanagement",
        "path": "control_layer/Risikomanagement/BSI-Anforderungen-zum-Risikomanagement-catalog.json",
        "kind": "Katalog",
    },
]

# Zusätzliche Kataloge, nur um UUIDs (alt-identifier) aufzulösen.
UUID_SOURCES = [
    "control_layer/Grundschutz++/sources/catalogs/Kernel/BSI-Stand-der-Technik-Kernel-catalog.json",
    "control_layer/Grundschutz++/sources/catalogs/Kernel/BSI-Stand-der-Technik-Kernel-G0-catalog.json",
    "control_layer/Grundschutz++/sources/catalogs/Methodik-Grundschutz++/BSI-Methodik-Grundschutz++-catalog.json",
]

SOURCE_CLASSES = {
    "BSI-Stand-der-Technik-Kernel-G0": "kernel",
    "BSI-Stand-der-Technik-Kernel": "kernel",
    "BSI-Methodik-Grundschutz-plus-plus": "methodik",
    "BSI-Methodik-Grundschutz": "methodik",
    "BSI-Anforderungen-zum-Risikomanagement": "risiko",
    "Entwurf-Mindeststandard-Bund-TLS-E": "tls",
}


def load(rel: str) -> dict:
    with open(ROOT / rel, encoding="utf-8") as fh:
        return json.load(fh)


def read_csv(name: str) -> list[dict]:
    with open(NS / name, encoding="utf-8-sig", newline="") as fh:
        return [{k.strip(): (v or "").strip() for k, v in row.items() if k} for row in csv.DictReader(fh)]


def props(obj: dict) -> dict[str, str]:
    out: dict[str, str] = {}
    for p in obj.get("props", []) or []:
        out.setdefault(p["name"], p.get("value", ""))
    return out


def split_list(value: str | None) -> list[str]:
    if not value:
        return []
    return [v.strip() for v in value.split(",") if v.strip()]


def part(ctrl: dict, name: str) -> dict | None:
    for p in ctrl.get("parts", []) or []:
        if p.get("name") == name:
            return p
    return None


def as_list(v):
    if v is None:
        return []
    if isinstance(v, dict):
        return [v]
    return list(v)


def param_map(ctrl: dict) -> dict[str, dict]:
    out = {}
    for prm in ctrl.get("params", []) or []:
        values = prm.get("values") or []
        out[prm["id"]] = {"l": prm.get("label", ""), "v": values}
    return out


def render_prose(text: str | None, params: dict[str, dict]) -> str:
    """Ersetzt Parameter-Platzhalter durch {{Label}} bzw. {{Label=Wert}}."""
    if not text:
        return ""

    def repl(m):
        p = params.get(m.group(1))
        if not p:
            return "{{" + m.group(1) + "}}"
        if p["v"]:
            return "{{" + p["l"] + "=" + ", ".join(p["v"]) + "}}"
        return "{{" + p["l"] + "}}"

    return PARAM_RE.sub(repl, text)


def walk_controls(node: dict, cb, group_path=(), parent=None):
    for c in node.get("controls", []) or []:
        cb(c, group_path, parent)
        walk_controls(c, cb, group_path, c["id"])
    for g in node.get("groups", []) or []:
        walk_controls(g, cb, group_path + (g,), parent)


# ---------------------------------------------------------------- Vokabulare
def build_vocab():
    v = {}
    v["effort"] = {r["Aufwand"]: r["Definition"] for r in read_csv("effort_level.csv")}
    v["modal"] = {r["Begriff"]: r["Definition"] for r in read_csv("modal_verbs.csv")}
    v["secLevel"] = {r["Begriff"]: r["Definition"] for r in read_csv("security_level.csv")}
    v["goals"] = [{"t": r["Begriff"], "d": r["Definition"]} for r in read_csv("security_targets.csv")]
    v["goalLevels"] = {r["Wert"]: r["Definition"] for r in read_csv("security_targets_levels.csv")}
    v["threats"] = {r["ID"]: {"t": r["Begriff"], "d": r["Definition"]} for r in read_csv("basethreats.csv")}
    v["tags"] = {r["Tag"]: r["Bedeutung"] for r in read_csv("tags.csv")}
    v["targets"] = {
        r["Zielobjekt"]: {"d": r["Definition"], "ex": r.get("Beispiel", ""), "typ": r.get("Typ", ""), "kat": r.get("Kategorie", ""), "syn": r.get("Synonyme", "")}
        for r in read_csv("target_object_categories.csv")
    }
    v["docs"] = {
        r["Begriff"]: {"d": r["Definition"], "kat": r.get("Kategorie", ""), "zg": r.get("Zielgruppe", "")}
        for r in read_csv("documentation_guidelines.csv")
        if r["Begriff"] != "???"
    }
    v["actions"] = {
        r["Infinitiv"]: {"d": r["Definition"], "typ": r.get("Typ", ""), "syn": r.get("Synonyme", ""), "nom": r.get("Nominalisierung", "")}
        for r in read_csv("action_words.csv")
    }
    v["practices"] = {
        r["Kürzel"]: {"t": r["Begriff"], "d": r["Definition"], "fokus": r.get("Schwerpunkt", ""), "aka": r.get("auch bekannt als", "")}
        for r in read_csv("practices.csv")
    }
    v["topics"] = {r["Begriff"]: r["Definition"] for r in read_csv("topics.csv")}
    v["terms"] = [
        {"t": r["Begriff"], "d": r["Definition"], "syn": r.get("Synonyme", "")} for r in read_csv("result.csv")
    ]
    v["relations"] = {
        "required": (NS / "dependency.txt").read_text(encoding="utf-8").strip(),
        "enhancement": (NS / "enhancement.txt").read_text(encoding="utf-8").strip(),
        "related": (NS / "related.txt").read_text(encoding="utf-8").strip(),
    }
    return v


# ---------------------------------------------------------- Anforderungen
def make_req(c: dict, group_path, parent, vocab_docs) -> dict:
    p = props(c)
    params = param_map(c)
    stm = part(c, "statement") or {}
    gdn = part(c, "guidance") or {}
    sp = props(stm)
    docs_raw = sp.get("documentation", "")
    docs = [docs_raw] if docs_raw in vocab_docs or "," not in docs_raw else split_list(docs_raw)
    practice = group_path[0] if group_path else None
    topic = group_path[-1] if len(group_path) > 1 else None
    links = as_list(c.get("links"))
    r = {
        "id": c["id"],
        "t": c.get("title", ""),
        "src": SOURCE_CLASSES.get(c.get("class", ""), "other"),
        "pr": practice["id"] if practice else c["id"].split(".")[0],
        "tp": topic["id"] if topic else None,
        "par": parent,
        "s": render_prose(stm.get("prose"), params),
        "g": render_prose(gdn.get("prose"), params),
        "m": sp.get("modal_verb", ""),
        "a": sp.get("action_word", ""),
        "res": (sp.get("result", "") + (" " + sp["result_specification"] if sp.get("result_specification") else "")).strip(),
        "doc": [d for d in docs if d],
        "to": split_list(sp.get("target_object_categories")),
        "sl": p.get("sec_level", ""),
        "e": p.get("effort_level", ""),
        "tags": split_list(p.get("tags")),
        "thr": split_list(p.get("threats")),
        "rel": [l["href"].lstrip("#") for l in links if l.get("rel") == "related" and l.get("href", "").startswith("#")],
        "req": [l["href"].lstrip("#") for l in links if l.get("rel") == "required" and l.get("href", "").startswith("#")],
        "uuid": p.get("alt-identifier", ""),
    }
    if "confidentiality" in p:
        r["cia"] = [p.get("confidentiality", ""), p.get("integrity", ""), p.get("availability", ""), p.get("authenticity", "")]
    tax = [p[k] for k in ("Taxonomy-L1", "Taxonomy-L2", "Taxonomy-L3", "Taxonomy-L4") if p.get(k)]
    if tax:
        r["tax"] = tax
    if params:
        r["prm"] = [{"l": v["l"], "v": v["v"]} for v in params.values()]
    # Leere Felder weglassen, um die Datei klein zu halten.
    return {k: v for k, v in r.items() if v not in ("", [], None)}


def main():
    vocab = build_vocab()
    reqs: dict[str, dict] = {}
    order: list[str] = []
    practices: dict[str, dict] = {}
    topics: dict[str, dict] = {}
    uuid_to_id: dict[str, str] = {}
    collections = []

    for spec in COLLECTIONS:
        cat = load(spec["path"])["catalog"]
        md = cat["metadata"]
        coll = {
            "key": spec["key"],
            "short": spec["short"],
            "kind": spec["kind"],
            "title": md.get("title", ""),
            "version": md.get("version", ""),
            "modified": md.get("last-modified", ""),
            "remarks": md.get("remarks", ""),
            "file": spec["path"],
            "groups": [],
            "members": {},
            "refs": [],
        }
        for res in (cat.get("back-matter") or {}).get("resources", []) or []:
            hrefs = [l.get("href") for l in res.get("rlinks", []) or [] if l.get("href", "").startswith("http")]
            if res.get("title"):
                coll["refs"].append({"t": res["title"], "h": hrefs[0] if hrefs else ""})

        def visit_group(g, depth, coll=coll):
            gp = props(g)
            entry = {"id": g["id"], "t": g.get("title", ""), "items": [c["id"] for c in g.get("controls", []) or []]}
            if gp.get("label") and gp["label"] not in (g["id"], g["id"].split(".")[-1]):
                entry["label"] = gp["label"]
            sub = [visit_group(s, depth + 1) for s in g.get("groups", []) or []]
            if sub:
                entry["groups"] = sub
            return entry

        coll["groups"] = [visit_group(g, 0) for g in cat.get("groups", []) or []]

        def on_control(c, group_path, parent, spec=spec, coll=coll):
            r = make_req(c, group_path, parent, vocab["docs"])
            if r.get("uuid"):
                uuid_to_id.setdefault(r["uuid"], r["id"])
            label = props(c).get("label")
            member = {}
            if label and label != c["id"]:
                member["label"] = label
            children = [x["id"] for x in c.get("controls", []) or []]
            if children:
                member["ch"] = children
            if parent:
                member["par"] = parent
            base = reqs.get(c["id"])
            if base is None:
                if spec["key"] != "gspp":
                    r["only"] = spec["key"]
                reqs[c["id"]] = r
                order.append(c["id"])
            else:
                # Abweichungen gegenüber der Basis festhalten (Tailoring im Profil).
                for field, key in (("t", "t"), ("s", "s"), ("g", "g"), ("m", "m")):
                    if r.get(field) and r.get(field) != base.get(field):
                        member[key] = r[field]
            coll["members"][c["id"]] = member
            if spec["key"] == "gspp":
                for i, g in enumerate(group_path[:2]):
                    target = practices if i == 0 else topics
                    if g["id"] not in target:
                        target[g["id"]] = {
                            "id": g["id"],
                            "t": g.get("title", ""),
                            "d": next((p["remarks"] for p in g.get("props", []) if p["name"] == "label" and p.get("remarks")), ""),
                            "items": [],
                        }
                        if i == 1:
                            target[g["id"]]["pr"] = group_path[0]["id"]
                if len(group_path) >= 2 and parent is None:
                    topics[group_path[1]["id"]]["items"].append(c["id"])
            elif base is None:
                # Nur in dieser Kollektion vorhanden: anhand der ID in die
                # Grundschutz++-Gliederung einsortieren.
                parts_ = c["id"].split(".")
                r["pr"] = parts_[0]
                tid = ".".join(parts_[:2])
                if tid in topics:
                    r["tp"] = tid
                    if parent is None:
                        topics[tid]["items"].append(c["id"])
                else:
                    r.pop("tp", None)

        walk_controls(cat, on_control)
        collections.append(coll)

    # Kinder (Unteranforderungen) aus der Basis ableiten
    for rid in order:
        r = reqs[rid]
        if r.get("par") and r["par"] in reqs:
            reqs[r["par"]].setdefault("ch", [])
            if rid not in reqs[r["par"]]["ch"]:
                reqs[r["par"]]["ch"].append(rid)

    # Themen den Praktiken zuordnen
    for tid, t in topics.items():
        practices[t["pr"]]["items"].append(tid)

    # UUIDs aus Quellkatalogen ergänzen
    for rel in UUID_SOURCES:
        def add_uuid(c, gp, parent):
            u = props(c).get("alt-identifier")
            if u and c["id"] in reqs:
                uuid_to_id.setdefault(u, c["id"])
        walk_controls(load(rel)["catalog"], add_uuid)

    # Rückwärtsverweise
    for rid in order:
        r = reqs[rid]
        for t in r.get("req", []):
            if t in reqs:
                reqs[t].setdefault("reqBy", []).append(rid)
        for t in r.get("rel", []):
            if t in reqs and rid not in reqs[t].get("rel", []):
                reqs[t].setdefault("relBy", []).append(rid)

    # ------------------------------------------------------------- Mappings
    mappings = []
    stats = defaultdict(lambda: {"renamed": 0, "missing": 0})
    iso = load("control_layer/Mappings/ISO-27001-zu-GSpp/ISO27001-AnnexA-to-GS++-mapping_collection.json")["mapping-collection"]
    itgs = load("control_layer/Mappings/IT-GS2023-zu-GSpp/ITGS-to-GS++-mapping_collection.json")["mapping-collection"]
    for key, mc, title, src_title in (
        ("iso", iso, "ISO/IEC 27001:2022 Anhang A", "ISO 27001"),
        ("itgs", itgs, "IT-Grundschutz-Kompendium Edition 2023", "IT-Grundschutz 2023"),
    ):
        rows: dict[str, dict] = {}
        rows_order = []
        defaulted = 0
        for m in mc["mappings"]:
            for mp in m["maps"]:
                mprops = defaultdict(list)
                for p in mp.get("props", []) or []:
                    mprops[p["name"]].append(p["value"])
                is_default = mprops.get("relationship_defaulted", ["false"])[0] == "true"
                defaulted += is_default
                for s in mp["sources"]:
                    sid = s["id-ref"]
                    if sid not in rows:
                        rows[sid] = {"id": sid, "maps": []}
                        rows_order.append(sid)
                    row = rows[sid]
                    if mprops.get("elementare_gefaehrdung"):
                        row.setdefault("thr", [])
                        for g in mprops["elementare_gefaehrdung"]:
                            code = g.split(":")[0].strip()
                            if code not in row["thr"]:
                                row["thr"].append(code)
                    # Ziele bevorzugt über die stabile UUID auflösen: Die IDs im
                    # Mapping können aus einem älteren Katalogstand stammen.
                    targets, renamed = [], {}
                    for t in mp["targets"]:
                        tid = t["id-ref"]
                        u = next((p["value"] for p in t.get("props", []) or [] if p["name"] == "oscal_uuid"), None)
                        cur = uuid_to_id.get(u) if u else None
                        if cur and cur != tid:
                            renamed[cur] = tid
                            stats[key]["renamed"] += 1
                            tid = cur
                        if tid not in reqs:
                            stats[key]["missing"] += 1
                        targets.append(tid)
                    entry = {"r": mp["relationship"], "t": targets}
                    if renamed:
                        entry["o"] = renamed
                    if is_default:
                        entry["d"] = 1
                    row["maps"].append(entry)
                    for tid in targets:
                        if tid in reqs:
                            reqs[tid].setdefault(key, [])
                            pair = [sid, mp["relationship"]]
                            if pair not in reqs[tid][key]:
                                reqs[tid][key].append(pair)
        md = mc["metadata"]
        prov = mc.get("provenance", {})
        mappings.append({
            "key": key,
            "title": title,
            "src": src_title,
            "mtitle": md.get("title", ""),
            "version": md.get("version", ""),
            "modified": md.get("last-modified", ""),
            "remarks": md.get("remarks", "") or prov.get("mapping-description", ""),
            "status": prov.get("status", ""),
            "mode": next((p["value"] for p in prov.get("props", []) or [] if p["name"] == "mode"), ""),
            "defaulted": defaulted,
            "renamed": stats[key]["renamed"],
            "missing": stats[key]["missing"],
            "rows": [rows[k] for k in rows_order],
        })

    # ------------------------------------------------------- Umsetzungen
    impls = []
    for path in sorted((ROOT / "implementation_layer").glob("*/*.json")):
        cd = json.load(open(path, encoding="utf-8"))["component-definition"]
        md = cd["metadata"]
        resources = {}
        for res in (cd.get("back-matter") or {}).get("resources", []) or []:
            hrefs = [l.get("href", "") for l in res.get("rlinks", []) or []]
            web = next((h for h in hrefs if h.startswith("http")), "")
            resources[res["uuid"]] = {"t": res.get("title", ""), "h": web}
        key = re.sub(r"[^a-z0-9]+", "-", path.parent.name.lower()).strip("-")
        comps = []
        comp_titles = {}
        for comp in cd.get("components", []) or []:
            comp_titles[comp["uuid"]] = comp["title"]
            items = []
            for ci in comp.get("control-implementations", []) or []:
                for ir in ci.get("implemented-requirements", []) or []:
                    cid = ir["control-id"]
                    rid = cid if cid in reqs else uuid_to_id.get(cid.lstrip("_"))
                    refs = []
                    for l in as_list(ir.get("links")):
                        res = resources.get(l.get("href", "").lstrip("#"))
                        if res and res["t"] and res not in refs:
                            refs.append(res)
                    it = {"id": rid or cid, "d": ir.get("description", "")}
                    if not rid:
                        it["x"] = 1
                    if refs:
                        it["refs"] = refs
                    sp = [
                        {"p": s.get("param-id", ""), "v": s.get("values", [])}
                        for s in ir.get("set-parameters", []) or []
                    ]
                    if sp:
                        it["sp"] = sp
                    cmds = [p["value"] for p in ir.get("props", []) or [] if p["name"] == "config-commands"]
                    if cmds:
                        it["cmd"] = cmds
                    if ir.get("remarks"):
                        it["rm"] = ir["remarks"]
                    items.append(it)
                    if rid:
                        reqs[rid].setdefault("impl", [])
                        ref = [key, len(comps)]
                        if ref not in reqs[rid]["impl"]:
                            reqs[rid]["impl"].append(ref)
            cp = props(comp)
            tax = [cp[k] for k in ("Taxonomy-L1", "Taxonomy-L2", "Taxonomy-L3", "Taxonomy-L4") if cp.get(k)]
            entry = {"t": comp["title"], "type": comp.get("type", ""), "d": comp.get("description", ""), "items": items}
            if comp.get("purpose"):
                entry["purpose"] = comp["purpose"]
            if comp.get("remarks"):
                entry["rm"] = comp["remarks"]
            if tax:
                entry["tax"] = tax
            comps.append(entry)
        caps = []
        for cap in cd.get("capabilities", []) or []:
            caps.append({
                "t": cap.get("name", ""),
                "d": cap.get("description", ""),
                "comps": [comp_titles.get(ic["component-uuid"], "") for ic in cap.get("incorporates-components", []) or []],
            })
        imports = [i.get("remarks", "") for i in cd.get("import-component-definitions", []) or [] if i.get("remarks")]
        impls.append({
            "key": key,
            "title": md.get("title", ""),
            "version": md.get("version", ""),
            "modified": md.get("last-modified", ""),
            "remarks": md.get("remarks", ""),
            "file": str(path.relative_to(ROOT)).replace("\\", "/"),
            "draft": md.get("title", "").startswith("Entwurf"),
            "comps": comps,
            "caps": caps,
            "imports": imports,
            "refs": [r for r in resources.values() if r["h"]],
        })

    for r in reqs.values():
        r.pop("uuid", None)

    data = {
        "built": max(c["modified"] for c in collections),
        "order": order,
        "reqs": reqs,
        "practices": [practices[k] for k in practices],
        "topics": topics,
        "collections": collections,
        "mappings": mappings,
        "impls": impls,
        "vocab": vocab,
    }
    js = "window.SDT_DATA=" + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n"
    OUT.write_text(js, encoding="utf-8")
    print(f"{OUT.name}: {len(js) / 1024 / 1024:.2f} MB, {len(reqs)} Anforderungen, "
          f"{sum(len(m['rows']) for m in mappings)} Mapping-Quellen, {len(impls)} Umsetzungsdokumente")
    for m in mappings:
        print(f"  Mapping {m['key']}: {m['renamed']} Ziel-IDs über UUID nachgeführt, {m['missing']} Ziele nicht im Katalog")


if __name__ == "__main__":
    main()

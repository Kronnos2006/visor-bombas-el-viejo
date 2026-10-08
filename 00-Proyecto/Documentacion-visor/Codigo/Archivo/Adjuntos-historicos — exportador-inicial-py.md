# Adjuntos-historicos/exportador-inicial.py

Versión adjunta inicial: hash no estable y otras limitaciones históricas.

**Categoría:** Archivo. **Captura:** 2026-10-07.

Original: [abrir archivo](<<RUTA-LOCAL>/.codex/attachments/d0aa3c5d-8caa-4818-87f0-5b57d85d45fa/Texto pegado.txt>).

SHA-256: `0420caca0eca9ca672add25ce6e8c7311111da48f8c4ada0e5e2d2a6e590e878`

Esta es una copia documental. Código histórico; no ejecutar ni reponer sobre la aplicación actual.

````python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Exporta las fichas de bombas de Obsidian al formato estándar de un CMMS.

Genera cuatro tablas que son las que pide cualquier software de mantenimiento
(Atlas CMMS, openMAINT, Odoo Mantenimiento, Fracttal, SAP PM, Infraspeak):

    export/activos.csv          Equipos (assets)
    export/repuestos.csv        Catálogo de repuestos (parts / items)
    export/lista_materiales.csv Qué repuesto lleva cada equipo (BOM)
    export/ordenes.csv          Historial de intervenciones (work orders)

Más un export/activos.json con todo junto, para APIs.

No necesita librerías externas: trae su propio lector de frontmatter.

Uso:  python exportar_cmms.py
"""
import csv
import glob
import json
import os
import re

AQUI = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.dirname(AQUI)
NOTAS = os.path.join(BASE, "bombas")
SALIDA = os.path.join(BASE, "export")

# Taxonomía ISO 14224 — equipment class para bombas
ISO_CLASE = "PU"
ISO_TIPO = {
    "centrífuga": "CE",
    "centrifuga": "CE",
    "desplazamiento positivo": "RE",
    "dosificadora": "RE",
    "peristáltica": "RE",
    "peristaltica": "RE",
}

# Cómo se clasifica cada elemento sellante en el catálogo de repuestos
FAMILIAS = {
    "sello": "Sello mecánico",
    "oring": "O-ring",
    "empaque": "Empaquetadura",
    "reten": "Retén",
    "junta": "Junta",
}


# ----------------------------------------------------------------- frontmatter
def leer_frontmatter(ruta):
    """Lector mínimo de YAML plano + listas de diccionarios. Sin dependencias."""
    with open(ruta, encoding="utf-8") as fh:
        texto = fh.read()
    m = re.match(r"^---\r?\n(.*?)\r?\n---\r?\n(.*)$", texto, re.S)
    if not m:
        return {}, texto
    bloque, cuerpo = m.group(1), m.group(2)

    datos = {}
    clave_lista = None
    item = None

    for linea in bloque.split("\n"):
        if not linea.strip() or linea.strip().startswith("#"):
            continue

        # elemento de lista de diccionarios:  "  - posicion: tapa"
        md = re.match(r"^\s+-\s+(\w+)\s*:\s*(.*)$", linea)
        if md and clave_lista:
            item = {md.group(1): limpiar(md.group(2))}
            datos[clave_lista].append(item)
            continue

        # continuación de ese diccionario:  "    material: Viton"
        mc = re.match(r"^\s{4,}(\w+)\s*:\s*(.*)$", linea)
        if mc and clave_lista and item is not None:
            item[mc.group(1)] = limpiar(mc.group(2))
            continue

        # elemento de lista simple:  "  - PID1401"
        ms = re.match(r"^\s+-\s+(.*)$", linea)
        if ms and clave_lista:
            datos[clave_lista].append(limpiar(ms.group(1)))
            continue

        # clave normal
        mk = re.match(r"^(\w+)\s*:\s*(.*)$", linea)
        if mk:
            k, v = mk.group(1), mk.group(2).strip()
            if v in ("", "[]"):
                datos[k] = [] if v == "[]" else ""
                clave_lista = k if v == "" else None
                if v == "[]":
                    clave_lista = None
                item = None
                if v == "":
                    datos[k] = []
            else:
                datos[k] = limpiar(v)
                clave_lista = None
                item = None
    # las claves que quedaron como lista vacía y nunca recibieron items
    for k, v in list(datos.items()):
        if v == []:
            pass
    return datos, cuerpo


def limpiar(v):
    v = v.strip()
    if v.startswith("#"):
        return ""
    v = re.sub(r"\s+#.*$", "", v)          # comentario al final
    v = v.strip().strip('"').strip("'")
    return v


def txt(d, k):
    v = d.get(k, "")
    return v if isinstance(v, str) else ""


# ------------------------------------------------------------------ historial
def leer_historial(cuerpo):
    """Saca las filas de la tabla markdown de intervenciones."""
    filas = []
    dentro = False
    for linea in cuerpo.split("\n"):
        if linea.strip().startswith("## Historial"):
            dentro = True
            continue
        if dentro and linea.strip().startswith("##"):
            break
        if not dentro or not linea.strip().startswith("|"):
            continue
        celdas = [c.strip() for c in linea.strip().strip("|").split("|")]
        if not celdas or set("".join(celdas)) <= set("-: "):
            continue
        if celdas[0].lower() in ("fecha", ""):
            continue
        while len(celdas) < 6:
            celdas.append("")
        filas.append(celdas[:6])
    return filas


# ------------------------------------------------------------------- exportar
def main():
    rutas = [r for r in sorted(glob.glob(os.path.join(NOTAS, "*.md")))
             if not os.path.basename(r).startswith("_")]
    if not rutas:
        raise SystemExit("No encontré fichas en " + NOTAS)
    os.makedirs(SALIDA, exist_ok=True)

    activos, repuestos, bom, ordenes, completo = [], [], [], [], []
    vistos = set()
    n_orden = 0

    for ruta in rutas:
        d, cuerpo = leer_frontmatter(ruta)
        tag = txt(d, "tag")
        if not tag or tag == "P-XXXX":
            continue

        tipo_b = txt(d, "tipo_bomba").lower()
        activos.append({
            "tag": tag,
            "nombre": txt(d, "nombre") or txt(d, "servicio"),
            "descripcion": txt(d, "servicio"),
            "ubicacion_funcional": txt(d, "area"),
            "clase_iso14224": ISO_CLASE,
            "tipo_iso14224": ISO_TIPO.get(tipo_b, ""),
            "fabricante": txt(d, "marca"),
            "modelo": txt(d, "modelo"),
            "numero_serie": txt(d, "serie"),
            "anio": txt(d, "anio"),
            "criticidad": txt(d, "criticidad"),
            "estado": txt(d, "estado"),
            "fluido": txt(d, "fluido"),
            "caudal_m3h": txt(d, "caudal_m3h"),
            "potencia_kw": txt(d, "potencia_kw"),
            "rpm": txt(d, "rpm"),
            "referencia_documental": ";".join(d.get("pid", []) if isinstance(d.get("pid"), list) else []),
            "fuente_datos": txt(d, "fuente_datos"),
            "confianza": txt(d, "confianza"),
        })

        # --- repuestos derivados de la ficha ---
        items = []

        if txt(d, "sello_modelo") or txt(d, "sello_marca"):
            items.append({
                "familia": FAMILIAS["sello"],
                "descripcion": " ".join(filter(None, [
                    "Sello mecánico", txt(d, "sello_tipo"),
                    txt(d, "sello_diametro_mm") and txt(d, "sello_diametro_mm") + " mm"])).strip(),
                "fabricante": txt(d, "sello_marca"),
                "numero_parte": txt(d, "sello_modelo"),
                "medida": txt(d, "sello_diametro_mm"),
                "material": "/".join(filter(None, [txt(d, "sello_cara_rotativa"),
                                                   txt(d, "sello_cara_estatica")])),
                "elastomero": txt(d, "sello_elastomero"),
                "cantidad": "1",
                "posicion": "cámara de sellado",
            })

        if txt(d, "empaque_seccion_mm"):
            items.append({
                "familia": FAMILIAS["empaque"],
                "descripcion": "Empaquetadura " + txt(d, "empaque_tipo"),
                "fabricante": txt(d, "empaque_marca"),
                "numero_parte": "",
                "medida": txt(d, "empaque_seccion_mm") + " mm",
                "material": txt(d, "empaque_tipo"),
                "elastomero": "",
                "cantidad": txt(d, "empaque_anillos") or "",
                "posicion": "prensaestopas",
            })

        for o in (d.get("orings") or []):
            if not isinstance(o, dict):
                continue
            med = o.get("medida", "")
            if not med:
                continue
            items.append({
                "familia": FAMILIAS["oring"],
                "descripcion": "O-ring " + med + " " + o.get("material", ""),
                "fabricante": "",
                "numero_parte": o.get("codigo", ""),
                "medida": med,
                "material": o.get("material", ""),
                "elastomero": o.get("material", ""),
                "cantidad": str(o.get("cantidad", "1")),
                "posicion": o.get("posicion", ""),
            })

        for it in items:
            clave = (it["familia"], it["medida"], it["material"], it["numero_parte"])
            codigo = txt(d, "codigo_bodega") or ("AUTO-" + str(abs(hash(clave)) % 100000))
            if clave not in vistos:
                vistos.add(clave)
                repuestos.append({
                    "codigo": codigo,
                    "familia": it["familia"],
                    "descripcion": it["descripcion"],
                    "fabricante": it["fabricante"],
                    "numero_parte": it["numero_parte"],
                    "medida": it["medida"],
                    "material": it["material"],
                    "unidad": "UN",
                    "stock_minimo": txt(d, "stock_minimo"),
                    "proveedor": txt(d, "proveedor"),
                })
            bom.append({
                "tag_activo": tag,
                "codigo_repuesto": codigo,
                "posicion": it["posicion"],
                "cantidad": it["cantidad"],
            })

        # --- historial ---
        for f in leer_historial(cuerpo):
            n_orden += 1
            ordenes.append({
                "id": "OT-%04d" % n_orden,
                "tag_activo": tag,
                "fecha": f[0],
                "tipo": f[1],
                "descripcion": f[2],
                "repuesto_usado": f[3],
                "responsable": f[4],
                "horas_parada": f[5],
            })

        completo.append({"activo": activos[-1], "repuestos": items})

    def escribir(nombre, filas, cols):
        ruta = os.path.join(SALIDA, nombre)
        with open(ruta, "w", newline="", encoding="utf-8-sig") as fh:
            w = csv.DictWriter(fh, cols, extrasaction="ignore")
            w.writeheader()
            w.writerows(filas)
        print("  %-24s %3d filas" % (nombre, len(filas)))

    print("Exportando a", SALIDA)
    escribir("activos.csv", activos, list(activos[0].keys()) if activos else ["tag"])
    escribir("repuestos.csv", repuestos,
             ["codigo", "familia", "descripcion", "fabricante", "numero_parte",
              "medida", "material", "unidad", "stock_minimo", "proveedor"])
    escribir("lista_materiales.csv", bom,
             ["tag_activo", "codigo_repuesto", "posicion", "cantidad"])
    escribir("ordenes.csv", ordenes,
             ["id", "tag_activo", "fecha", "tipo", "descripcion",
              "repuesto_usado", "responsable", "horas_parada"])

    with open(os.path.join(SALIDA, "activos.json"), "w", encoding="utf-8") as fh:
        json.dump(completo, fh, ensure_ascii=False, indent=2)
    print("  %-24s %3d activos" % ("activos.json", len(completo)))

    faltan = [a["tag"] for a in activos if not a["fabricante"]]
    if faltan:
        print("\nSin dato de placa todavía (%d): %s" % (len(faltan), ", ".join(faltan)))


if __name__ == "__main__":
    main()
````

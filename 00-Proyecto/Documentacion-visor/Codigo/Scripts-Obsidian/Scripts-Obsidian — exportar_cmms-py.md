# Scripts-Obsidian/exportar_cmms.py

Exportador independiente; ver limitaciones de integración.

**Categoría:** Scripts-Obsidian. **Captura:** 2026-10-07.

Original: [abrir archivo](<C:/Users/Isabella GM/vocatus/auto cad/autocad el vieno vovatus/00-Proyecto/scripts/exportar_cmms.py>).

SHA-256: `1c70c1c3adadcfdf0a382fbdd7b81e64c5b5446f63a8b758d9382648547bc3fc`

Esta es una copia documental. Editar el original para cambiar el programa.

````python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Exporta las fichas de bombas de Obsidian a cuatro tablas de intercambio
pensadas para cargar en un CMMS.

    export/activos.csv          Equipos
    export/repuestos.csv        Catálogo de repuestos
    export/lista_materiales.csv Qué repuesto lleva cada equipo
    export/ordenes.csv          Intervenciones
    export/activos.json         Todo junto, para APIs
    export/_revision.txt        Qué quedó incompleto y por qué

NO es un formato universal: cada CMMS pide su propio mapeo de columnas,
relaciones e identificadores. Esto es una base de intercambio limpia.

Reglas de integridad que respeta:
  - Los códigos de repuesto son DETERMINISTAS (md5 de la identidad del
    repuesto). La misma pieza da el mismo código en toda corrida y en
    cualquier máquina.
  - El código de bodega de la bomba NO se usa como código de repuesto.
  - Dos repuestos son el mismo solo si coinciden familia, fabricante,
    número de parte, medida, material, elastómero y dureza.
  - La lista de materiales solo referencia códigos que existen en el catálogo.
  - No se inventan cantidades: si no está documentada, queda vacía.
  - No se asigna tipo ISO 14224 por suposición.

Sin dependencias externas.

Uso:  python exportar_cmms.py
"""
import csv
import glob
import hashlib
import json
import os
import re

AQUI = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.dirname(AQUI)
NOTAS = os.path.join(BASE, "bombas")
INFORMES = os.path.join(BASE, "informes-mantenimiento")   # opcional
SALIDA = os.path.join(BASE, "export")

# ISO 14224 — solo la clase de equipo, que para una bomba no admite duda.
# El TIPO (centrífuga / desplazamiento positivo) se declara explícitamente
# en la ficha o queda vacío. No se deduce del nombre del servicio.
ISO_CLASE = "PU"
ISO_TIPO_DECLARADO = {
    "centrifuga": "CE",
    "centrífuga": "CE",
    "desplazamiento positivo": "RE",
    "reciprocante": "RE",
}

COLS_ACTIVOS = [
    "tag", "nombre", "descripcion", "ubicacion_funcional",
    "clase_iso14224", "tipo_iso14224", "fabricante", "modelo",
    "numero_serie", "anio", "criticidad", "estado", "fluido",
    "caudal_m3h", "potencia_kw", "rpm", "codigo_bodega_equipo",
    "referencia_documental", "fuente_datos", "confianza",
]

FAM_SELLO = "Sello mecánico"
FAM_EMPAQUE = "Empaquetadura"
FAM_ORING = "O-ring"

avisos = []


# ----------------------------------------------------------------- frontmatter
def leer_nota(ruta):
    with open(ruta, encoding="utf-8") as fh:
        texto = fh.read()
    m = re.match(r"^---\r?\n(.*?)\r?\n---\r?\n?(.*)$", texto, re.S)
    if not m:
        return {}, texto
    return parsear_yaml(m.group(1)), m.group(2)


def parsear_yaml(bloque):
    """Lector mínimo: claves planas, listas simples y listas de diccionarios."""
    datos, lista_actual, item = {}, None, None
    for linea in bloque.split("\n"):
        if not linea.strip() or linea.lstrip().startswith("#"):
            continue

        md = re.match(r"^\s+-\s+([A-Za-z_]\w*)\s*:\s*(.*)$", linea)
        if md and lista_actual is not None:
            item = {md.group(1): limpiar(md.group(2))}
            datos[lista_actual].append(item)
            continue

        mc = re.match(r"^\s{4,}([A-Za-z_]\w*)\s*:\s*(.*)$", linea)
        if mc and lista_actual is not None and isinstance(item, dict):
            item[mc.group(1)] = limpiar(mc.group(2))
            continue

        ms = re.match(r"^\s+-\s+(.*)$", linea)
        if ms and lista_actual is not None:
            datos[lista_actual].append(limpiar(ms.group(1)))
            continue

        mk = re.match(r"^([A-Za-z_]\w*)\s*:\s*(.*)$", linea)
        if mk:
            k, v = mk.group(1), mk.group(2).strip()
            item = None
            if v == "":                      # abre lista en bloque
                datos[k] = []
                lista_actual = k
            elif v == "[]":                  # lista vacía explícita
                datos[k] = []
                lista_actual = None
            else:
                datos[k] = limpiar(v)
                lista_actual = None
    return datos


def limpiar(v):
    v = v.strip()
    v = re.sub(r"\s+#.*$", "", v)
    return v.strip().strip('"').strip("'").strip()


def txt(d, k):
    v = d.get(k, "")
    return v.strip() if isinstance(v, str) else ""


def lista(d, k):
    v = d.get(k, [])
    return v if isinstance(v, list) else []


# ------------------------------------------------------- código determinista
def codigo_repuesto(ident):
    """
    ident: tupla con la identidad completa del repuesto.
    Devuelve un código estable: mismo repuesto -> mismo código, siempre.
    Si hay número de parte del fabricante, se usa ese como raíz.
    """
    familia, fabricante, num_parte, medida, material, elastomero, dureza = ident
    if num_parte:
        raiz = re.sub(r"[^A-Za-z0-9]+", "-", num_parte).strip("-").upper()
        return "MP-" + raiz[:24]
    crudo = "|".join(x.lower().strip() for x in ident)
    h = hashlib.md5(crudo.encode("utf-8")).hexdigest()[:8].upper()
    pref = {FAM_SELLO: "SM", FAM_EMPAQUE: "EM", FAM_ORING: "OR"}.get(familia, "RP")
    return pref + "-" + h


# ------------------------------------------------------------ repuestos
def repuestos_de(d, tag):
    """Deriva los repuestos de una ficha. Solo lo documentado; nada inventado."""
    out = []

    tipo_sellado = txt(d, "tipo_sellado").lower()

    # --- sello mecánico ---
    marca = txt(d, "sello_marca")
    modelo = txt(d, "sello_modelo")
    diam = txt(d, "sello_diametro_mm")
    if marca or modelo or diam:
        caras = "/".join(x for x in [txt(d, "sello_cara_rotativa"),
                                     txt(d, "sello_cara_estatica")] if x)
        desc = " ".join(x for x in ["Sello mecánico", txt(d, "sello_tipo"),
                                    (diam + " mm") if diam else ""] if x)
        out.append({
            "familia": FAM_SELLO,
            "descripcion": desc,
            "fabricante": marca,
            "numero_parte": modelo,
            "medida": diam,
            "material": caras,
            "elastomero": txt(d, "sello_elastomero"),
            "dureza": "",
            "cantidad": "",          # no se inventa; va en la ficha si se midió
            "posicion": "cámara de sellado",
        })
    elif "sello" in tipo_sellado:
        avisos.append("%s: dice sellado mecánico pero no hay marca, modelo ni diámetro." % tag)

    # --- empaquetadura ---
    secc = txt(d, "empaque_seccion_mm")
    if secc or txt(d, "empaque_marca"):
        out.append({
            "familia": FAM_EMPAQUE,
            "descripcion": " ".join(x for x in ["Empaquetadura", txt(d, "empaque_tipo"),
                                                (secc + " mm") if secc else ""] if x),
            "fabricante": txt(d, "empaque_marca"),
            "numero_parte": "",
            "medida": secc,
            "material": txt(d, "empaque_tipo"),
            "elastomero": "",
            "dureza": "",
            "cantidad": txt(d, "empaque_anillos"),   # solo si está declarado
            "posicion": "prensaestopas",
        })
    elif "empaquetadura" in tipo_sellado:
        avisos.append("%s: dice empaquetadura pero no hay sección ni marca." % tag)

    # --- o-rings ---
    for o in lista(d, "orings"):
        if not isinstance(o, dict):
            continue
        med = str(o.get("medida", "")).strip()
        mat = str(o.get("material", "")).strip()
        if not med:
            avisos.append("%s: o-ring sin medida, no se exporta." % tag)
            continue
        cant = str(o.get("cantidad", "")).strip()
        out.append({
            "familia": FAM_ORING,
            "descripcion": " ".join(x for x in ["O-ring", med, mat] if x),
            "fabricante": str(o.get("fabricante", "")).strip(),
            "numero_parte": str(o.get("codigo", "")).strip(),
            "medida": med,
            "material": mat,
            "elastomero": mat,
            "dureza": str(o.get("dureza_shore", "")).strip(),
            "cantidad": cant,
            "posicion": str(o.get("posicion", "")).strip(),
        })

    return out


# ------------------------------------------------------------- historial
FILA_RE = re.compile(r"^\s*\|")


def filas_tabla(cuerpo, encabezado="## Historial"):
    filas, dentro = [], False
    for linea in cuerpo.split("\n"):
        s = linea.strip()
        if s.startswith(encabezado):
            dentro = True
            continue
        if dentro and s.startswith("##"):
            break
        if not dentro or not FILA_RE.match(linea):
            continue
        celdas = [c.strip() for c in s.strip("|").split("|")]
        if not any(celdas):
            continue
        if set("".join(celdas)) <= set("-: "):
            continue
        if celdas[0].lower() in ("fecha",):
            continue
        while len(celdas) < 6:
            celdas.append("")
        filas.append(celdas[:6])
    return filas


def historial_externo():
    """
    Informes sueltos en 00-Proyecto/informes-mantenimiento/*.md
    Cada archivo con frontmatter: tag, fecha, tipo, repuesto_usado,
    responsable, horas_parada; y el cuerpo como descripción.
    La carpeta es opcional: si no existe, se ignora.
    """
    out = []
    if not os.path.isdir(INFORMES):
        return out
    for ruta in sorted(glob.glob(os.path.join(INFORMES, "*.md"))):
        d, cuerpo = leer_nota(ruta)
        tag = txt(d, "tag")
        if not tag:
            avisos.append("Informe sin tag, se omite: " + os.path.basename(ruta))
            continue
        desc = txt(d, "descripcion") or " ".join(cuerpo.split())[:300]
        out.append({
            "tag_activo": tag,
            "fecha": txt(d, "fecha"),
            "tipo": txt(d, "tipo"),
            "descripcion": desc,
            "repuesto_usado": txt(d, "repuesto_usado"),
            "responsable": txt(d, "responsable"),
            "horas_parada": txt(d, "horas_parada"),
            "fuente": os.path.basename(ruta),
        })
    return out


# -------------------------------------------------------------------- main
def main():
    rutas = [r for r in sorted(glob.glob(os.path.join(NOTAS, "*.md")))
             if not os.path.basename(r).startswith("_")]
    if not rutas:
        raise SystemExit("No encontré fichas en " + NOTAS)
    os.makedirs(SALIDA, exist_ok=True)

    activos, bom, ordenes, completo = [], [], [], []
    catalogo = {}          # codigo -> fila del repuesto
    por_identidad = {}      # identidad -> codigo   (evita códigos huérfanos)

    for ruta in rutas:
        d, cuerpo = leer_nota(ruta)
        tag = txt(d, "tag")
        if not tag or tag == "P-XXXX":
            continue

        # Fichas de demostración: nunca entran al export. Un activo ficticio
        # dentro de un CMMS real termina en una orden de compra equivocada.
        if txt(d, "demostracion").lower() in ("true", "si", "sí", "1"):
            avisos.append("%s: ficha de demostración, excluida del export." % tag)
            continue

        tipo_decl = txt(d, "tipo_bomba").lower()
        iso_tipo = ISO_TIPO_DECLARADO.get(tipo_decl, "")
        if tipo_decl and not iso_tipo:
            avisos.append("%s: tipo_bomba '%s' no mapea a ISO 14224; queda vacío."
                          % (tag, txt(d, "tipo_bomba")))

        activo = {
            "tag": tag,
            "nombre": txt(d, "nombre") or txt(d, "servicio"),
            "descripcion": txt(d, "servicio"),
            "ubicacion_funcional": txt(d, "area"),
            "clase_iso14224": ISO_CLASE,
            "tipo_iso14224": iso_tipo,
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
            "codigo_bodega_equipo": txt(d, "codigo_bodega"),
            "referencia_documental": ";".join(str(x) for x in lista(d, "pid")),
            "fuente_datos": txt(d, "fuente_datos"),
            "confianza": txt(d, "confianza"),
        }
        activos.append(activo)

        items = repuestos_de(d, tag)
        for it in items:
            ident = (it["familia"], it["fabricante"], it["numero_parte"],
                     it["medida"], it["material"], it["elastomero"], it["dureza"])
            cod = por_identidad.get(ident)
            if cod is None:
                cod = codigo_repuesto(ident)
                if cod in catalogo:                 # colisión de número de parte
                    cod = cod + "-" + hashlib.md5(
                        "|".join(ident).encode("utf-8")).hexdigest()[:4].upper()
                por_identidad[ident] = cod
                catalogo[cod] = {
                    "codigo": cod,
                    "familia": it["familia"],
                    "descripcion": it["descripcion"],
                    "fabricante": it["fabricante"],
                    "numero_parte": it["numero_parte"],
                    "medida": it["medida"],
                    "material": it["material"],
                    "elastomero": it["elastomero"],
                    "dureza_shore": it["dureza"],
                    "unidad": "UN",
                    "stock_minimo": "",
                    "proveedor": txt(d, "proveedor"),
                }
            bom.append({
                "tag_activo": tag,
                "codigo_repuesto": cod,
                "posicion": it["posicion"],
                "cantidad": it["cantidad"],
            })
            it["codigo"] = cod

        for f in filas_tabla(cuerpo):
            ordenes.append({
                "tag_activo": tag, "fecha": f[0], "tipo": f[1], "descripcion": f[2],
                "repuesto_usado": f[3], "responsable": f[4], "horas_parada": f[5],
                "fuente": os.path.basename(ruta),
            })

        completo.append({"activo": activo, "repuestos": items})

    ordenes.extend(historial_externo())
    ordenes.sort(key=lambda o: (o.get("fecha") or "", o["tag_activo"]))
    for i, o in enumerate(ordenes, 1):
        o["id"] = "OT-%04d" % i

    # --- integridad: ningún BOM apunta a un código inexistente ---
    huerfanos = [b for b in bom if b["codigo_repuesto"] not in catalogo]
    if huerfanos:
        raise SystemExit("ERROR de integridad: %d relaciones sin repuesto." % len(huerfanos))

    def escribir(nombre, filas, cols):
        with open(os.path.join(SALIDA, nombre), "w", newline="", encoding="utf-8-sig") as fh:
            w = csv.DictWriter(fh, cols, extrasaction="ignore")
            w.writeheader()
            w.writerows(filas)
        print("  %-24s %4d filas" % (nombre, len(filas)))

    print("Exportando a", SALIDA)
    escribir("activos.csv", activos, COLS_ACTIVOS)
    escribir("repuestos.csv", sorted(catalogo.values(), key=lambda r: r["codigo"]),
             ["codigo", "familia", "descripcion", "fabricante", "numero_parte",
              "medida", "material", "elastomero", "dureza_shore", "unidad",
              "stock_minimo", "proveedor"])
    escribir("lista_materiales.csv", bom,
             ["tag_activo", "codigo_repuesto", "posicion", "cantidad"])
    escribir("ordenes.csv", ordenes,
             ["id", "tag_activo", "fecha", "tipo", "descripcion",
              "repuesto_usado", "responsable", "horas_parada", "fuente"])

    with open(os.path.join(SALIDA, "activos.json"), "w", encoding="utf-8") as fh:
        json.dump(completo, fh, ensure_ascii=False, indent=2)
    print("  %-24s %4d activos" % ("activos.json", len(completo)))

    # --- informe de revisión ---
    sin_placa = [a["tag"] for a in activos if not a["fabricante"]]
    sin_rep = sorted({a["tag"] for a in activos} -
                     {b["tag_activo"] for b in bom})
    sin_cant = [b for b in bom if not b["cantidad"]]

    lineas = ["REVISIÓN DEL EXPORT", "=" * 60, ""]
    if not activos:
        lineas.append("NINGÚN ACTIVO EXPORTABLE.")
        lineas.append("Las tablas salen con encabezado y sin filas.")
        lineas.append("Causa probable: la bóveda apuntada solo tiene fichas de")
        lineas.append("demostración (demostracion: true), o no tiene fichas de bomba.")
        lineas.append("Revisar OBSIDIAN_VAULT y la carpeta 00-Proyecto/bombas.")
        lineas.append("")
    lineas.append("Activos: %d  ·  Repuestos: %d  ·  Relaciones: %d  ·  Intervenciones: %d"
                  % (len(activos), len(catalogo), len(bom), len(ordenes)))
    lineas.append("")
    if sin_placa:
        lineas.append("Sin dato de placa (%d): %s" % (len(sin_placa), ", ".join(sin_placa)))
    if sin_rep:
        lineas.append("Sin ningún repuesto documentado (%d): %s" % (len(sin_rep), ", ".join(sin_rep)))
    if sin_cant:
        lineas.append("Relaciones sin cantidad declarada: %d (se deja vacío, no se asume 1)"
                      % len(sin_cant))
    if avisos:
        lineas.append("")
        lineas.append("AVISOS")
        for a in sorted(set(avisos)):
            lineas.append("  - " + a)
    lineas.append("")
    lineas.append("Recordatorio: estos CSV son una base de intercambio, no un formato")
    lineas.append("universal. Cada CMMS exige su propio mapeo de columnas y relaciones.")

    texto = "\n".join(lineas)
    with open(os.path.join(SALIDA, "_revision.txt"), "w", encoding="utf-8") as fh:
        fh.write(texto + "\n")
    print("\n" + texto)


if __name__ == "__main__":
    main()

````

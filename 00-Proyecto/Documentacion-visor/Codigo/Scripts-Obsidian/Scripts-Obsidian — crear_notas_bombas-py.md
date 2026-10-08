# Scripts-Obsidian/crear_notas_bombas.py

Generador de fichas a partir de CSV; conserva notas existentes.

**Categoría:** Scripts-Obsidian. **Captura:** 2026-10-07.

Original: [abrir archivo](<<RUTA-LOCAL>/vocatus/auto cad/autocad el vieno vovatus/00-Proyecto/scripts/crear_notas_bombas.py>).

SHA-256: `3de86231f16b1a529899e84b97683fdcc878c409a9231581b0f05e7b0c369075`

Esta es una copia documental. Editar el original para cambiar el programa.

````python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Genera una nota de Obsidian por bomba, a partir de bombas.csv y la plantilla.
No sobrescribe notas que ya existen.

Uso:   python crear_notas_bombas.py
"""
import csv
import os

AQUI = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.dirname(AQUI)                 # 00-Proyecto/
CSV = os.path.join(BASE, "bombas.csv")
DEST = os.path.join(BASE, "bombas")

PLANTILLA = """---
tipo: bomba
tag: {tag}
nombre: ""
area: {area}
servicio: "{servicio}"
estado: operando
criticidad: media

marca: ""
modelo: ""
serie: ""
anio: ""
tipo_bomba: ""
fluido: ""
temperatura_c: ""
caudal_m3h: ""
altura_m: ""
presion_bar: ""
potencia_kw: ""
rpm: ""
diametro_eje_mm: ""
succion_dn: ""
descarga_dn: ""

tipo_sellado: ""
sello_marca: ""
sello_modelo: ""
sello_tipo: ""
sello_diametro_mm: ""
sello_cara_rotativa: ""
sello_cara_estatica: ""
sello_elastomero: ""
sello_resorte: ""
empaque_marca: ""
empaque_tipo: ""
empaque_seccion_mm: ""
empaque_anillos: ""
empaque_linterna: ""

orings: []

codigo_bodega: ""
proveedor: ""
plazo_entrega: ""
stock_minimo: ""

pid:
{pid_yaml}
planos: []
fotos: []
verificado_por: ""
fecha_verificacion: ""
fuente_datos: "LEGEND del PFD"
confianza: media
---

# {tag} — {servicio}

## Qué hace
<Pendiente: qué mueve, de dónde a dónde, por qué importa.>

## Sellado — resumen rápido
> **Pendiente de levantamiento.**
> Esta línea debe terminar diciendo, en concreto, qué sello y qué o-rings
> hay que pedir a bodega.

## Historial de intervenciones

| Fecha | Tipo | Qué se hizo | Repuesto usado | Quién | Horas parada |
|---|---|---|---|---|---|
| | | | | | |

## Modos de falla observados
- Pendiente.

## Documentos
- **P&ID:** {pid_texto}

## Observaciones
"""


def main():
    if not os.path.exists(CSV):
        raise SystemExit("No encuentro bombas.csv en " + BASE)
    os.makedirs(DEST, exist_ok=True)

    creadas, saltadas = [], []
    with open(CSV, encoding="utf-8") as fh:
        for fila in csv.DictReader(fh):
            tag = (fila.get("tag") or "").strip()
            if not tag:
                continue
            destino = os.path.join(DEST, tag + ".md")
            if os.path.exists(destino):
                saltadas.append(tag)
                continue

            laminas = [p.strip() for p in (fila.get("pid") or "").split(";") if p.strip()]
            pid_yaml = "\n".join("  - " + l for l in laminas) or "  []"
            pid_texto = ", ".join("`" + l + "`" for l in laminas) or "pendiente"

            texto = PLANTILLA.format(
                tag=tag,
                area=(fila.get("area") or "").strip(),
                servicio=(fila.get("servicio") or "").strip(),
                pid_yaml=pid_yaml,
                pid_texto=pid_texto,
            )
            with open(destino, "w", encoding="utf-8") as out:
                out.write(texto)
            creadas.append(tag)

    print("Creadas:", len(creadas), creadas)
    print("Ya existían (sin tocar):", len(saltadas), saltadas)


if __name__ == "__main__":
    main()

````

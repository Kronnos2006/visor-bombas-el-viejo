# Scripts-Obsidian/consultar_bombas.py

Consulta CLI anterior; no es el backend del visor.

**Categoría:** Scripts-Obsidian. **Captura:** 2026-10-07.

Original: [abrir archivo](<C:/Users/Isabella GM/vocatus/auto cad/autocad el vieno vovatus/00-Proyecto/scripts/consultar_bombas.py>).

SHA-256: `d5b5cac1b45bd94f2f19f2ee9933ccfc30a19e9b17b8402703567a482d4e0f0c`

Esta es una copia documental. Editar el original para cambiar el programa.

````python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Consulta en lenguaje natural sobre las bombas de la planta El Viejo.

Lee las notas de Obsidian de 00-Proyecto/bombas/, arma el contexto y se lo
manda a un modelo. Soporta Gemini, Claude y OpenAI.

Instalar lo que vayas a usar:
    pip install google-generativeai      # Gemini
    pip install anthropic                # Claude
    pip install openai                   # ChatGPT

Poner la llave como variable de entorno:
    GEMINI_API_KEY   /  ANTHROPIC_API_KEY  /  OPENAI_API_KEY

Uso:
    python consultar_bombas.py "que o-ring usa la P-1401"
    python consultar_bombas.py --motor claude "cuales bombas llevan sello de Viton"
    python consultar_bombas.py --bomba P-1401 "dame todo lo que sepas de esta bomba"
    python consultar_bombas.py            # modo interactivo
"""
import argparse
import glob
import os
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.dirname(AQUI)
NOTAS = os.path.join(BASE, "bombas")

SISTEMA = """Eres el asistente técnico de la planta de alcohol El Viejo
(Vocatus Holding, Filadelfia, Guanacaste, Costa Rica). Proyecto de ingeniería
Praj Industries, código D-18033.

Respondes consultas de mantenimiento sobre las bombas de la planta usando
ÚNICAMENTE las fichas que se te entregan abajo.

Reglas:
1. Si el dato está en la ficha, respondelo directo y con la medida exacta.
   Para repuestos, dá siempre: tipo de sello, diámetro, materiales de caras,
   elastómero, y la medida y material de cada o-ring.
2. Si el dato NO está (campo vacío), decí exactamente "ese dato todavía no
   está levantado" y nombrá qué campo falta. NUNCA inventes una medida,
   una marca ni un código de repuesto: un o-ring equivocado para una planta
   de alcohol es una fuga de producto inflamable.
3. Si te preguntan por planos, dá las rutas y láminas que aparecen en la ficha.
4. Si la pregunta abarca varias bombas, compará y mostrá una tabla.
5. Respondé en español de Costa Rica, directo y corto. Sos un apoyo para el
   mecánico que está parado frente a la bomba.
"""


def cargar(filtro=None):
    """Lee las notas .md de las bombas y devuelve (texto, cuantas)."""
    if not os.path.isdir(NOTAS):
        sys.exit("No encuentro la carpeta de notas: " + NOTAS)
    partes, n = [], 0
    for ruta in sorted(glob.glob(os.path.join(NOTAS, "*.md"))):
        nombre = os.path.basename(ruta)
        if nombre.startswith("_"):          # plantilla e índice
            continue
        if filtro and filtro.upper() not in nombre.upper():
            continue
        with open(ruta, encoding="utf-8") as fh:
            partes.append("===== FICHA: " + nombre + " =====\n" + fh.read())
        n += 1
    if not n:
        sys.exit("No encontré fichas" + (" para " + filtro if filtro else ""))
    return "\n\n".join(partes), n


def preguntar_gemini(sistema, contexto, pregunta):
    import google.generativeai as genai
    clave = os.environ.get("GEMINI_API_KEY")
    if not clave:
        sys.exit("Falta GEMINI_API_KEY")
    genai.configure(api_key=clave)
    modelo = genai.GenerativeModel(
        os.environ.get("GEMINI_MODEL", "gemini-2.0-flash"),
        system_instruction=sistema,
    )
    r = modelo.generate_content(contexto + "\n\nPREGUNTA: " + pregunta)
    return r.text


def preguntar_claude(sistema, contexto, pregunta):
    import anthropic
    clave = os.environ.get("ANTHROPIC_API_KEY")
    if not clave:
        sys.exit("Falta ANTHROPIC_API_KEY")
    c = anthropic.Anthropic(api_key=clave)
    r = c.messages.create(
        model=os.environ.get("CLAUDE_MODEL", "claude-sonnet-4-5"),
        max_tokens=2000,
        system=sistema,
        messages=[{"role": "user", "content": contexto + "\n\nPREGUNTA: " + pregunta}],
    )
    return "".join(b.text for b in r.content if getattr(b, "type", "") == "text")


def preguntar_openai(sistema, contexto, pregunta):
    from openai import OpenAI
    clave = os.environ.get("OPENAI_API_KEY")
    if not clave:
        sys.exit("Falta OPENAI_API_KEY")
    c = OpenAI(api_key=clave)
    r = c.chat.completions.create(
        model=os.environ.get("OPENAI_MODEL", "gpt-4o"),
        messages=[
            {"role": "system", "content": sistema},
            {"role": "user", "content": contexto + "\n\nPREGUNTA: " + pregunta},
        ],
    )
    return r.choices[0].message.content


MOTORES = {"gemini": preguntar_gemini, "claude": preguntar_claude, "openai": preguntar_openai}


def main():
    ap = argparse.ArgumentParser(description="Consulta técnica sobre las bombas de El Viejo")
    ap.add_argument("pregunta", nargs="*", help="la pregunta; vacío entra en modo interactivo")
    ap.add_argument("--motor", default="gemini", choices=sorted(MOTORES))
    ap.add_argument("--bomba", default=None, help="limitar a un TAG, ej. P-1401")
    args = ap.parse_args()

    contexto, n = cargar(args.bomba)
    fn = MOTORES[args.motor]

    if args.pregunta:
        print(fn(SISTEMA, contexto, " ".join(args.pregunta)))
        return

    print("Fichas cargadas: %d  ·  motor: %s" % (n, args.motor))
    print("Escribí tu pregunta. Enter vacío para salir.\n")
    while True:
        try:
            q = input("> ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            break
        if not q:
            break
        print()
        print(fn(SISTEMA, contexto, q))
        print()


if __name__ == "__main__":
    main()

````

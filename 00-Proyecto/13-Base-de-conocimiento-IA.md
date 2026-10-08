# 13 — Base de conocimiento consultable por IA

> [!info] Revisión documental 2026-10-07
> Alcance actualizado: Obsidian alimenta un visor 3D local; ambos forman el proyecto. Las 15 fichas ya existen. El script CLI descrito aquí es una alternativa anterior; el visor usa su propia integración Gemini. Ver [[Documentacion-visor/03-Arquitectura-y-datos]].

Cambio de enfoque: en vez de un visor 3D, el entregable central es una
**base de conocimiento en Obsidian** — una nota por bomba — que se puede
consultar en lenguaje natural con Claude, ChatGPT o Gemini.

## Por qué esto es mejor que el 3D

El mecánico no necesita girar un modelo. Necesita, parado frente a la bomba
con el celular en la mano, preguntar *"¿qué o-ring lleva la P-1401?"* y que
le contesten la medida exacta. Eso es lo que esto resuelve.

Además: una carpeta de archivos `.md` no vence, no depende de licencias,
se versiona, y la puede leer cualquier IA presente o futura.

## Estructura

```
00-Proyecto/
├── bombas/
│   ├── _plantilla-bomba.md     ← la estructura, no tocar
│   ├── _INDICE-bombas.md       ← tablas Dataview de estado
│   └── P-1401.md               ← una nota por bomba
├── scripts/
│   ├── crear_notas_bombas.py   ← genera las 14 restantes
│   └── consultar_bombas.py     ← pregunta en lenguaje natural
└── bombas.csv
```

## La ficha de cada bomba

Dos capas:

**1. Frontmatter YAML** — campos estructurados que la IA lee sin ambigüedad:
placa, sellado completo, lista de o-rings (posición, medida, material, dureza,
código), repuestos, trazabilidad (quién verificó, cuándo, de qué fuente, con
qué nivel de confianza).

**2. Cuerpo en markdown** — lo que no cabe en campos:
- **Qué hace** en lenguaje de planta
- **Sellado — resumen rápido**: la línea que el mecánico lee para pedir repuesto
- **Historial de intervenciones**: tabla fecha / tipo / qué se hizo / repuesto / quién / horas de parada
- **Modos de falla observados**
- **Documentos**: planos DWG, láminas P&ID, datasheets
- **Observaciones**

El campo `confianza` y `fuente_datos` son clave: distinguen un dato leído de
la placa de uno sacado de catálogo. Mantenimiento necesita saber la diferencia.

## Cómo generar las 14 restantes

```bash
cd 00-Proyecto/scripts
python crear_notas_bombas.py
```

Lee `bombas.csv`, crea una nota por bomba con TAG, área, servicio y láminas
ya cargados. **No sobrescribe** notas que ya existan, así que se puede correr
las veces que haga falta.

## Cómo consultarlo con IA

```bash
pip install google-generativeai        # o anthropic, o openai

# Windows:   set GEMINI_API_KEY=tu_llave
# Linux/Mac: export GEMINI_API_KEY=tu_llave

python consultar_bombas.py "que o-ring usa la P-1401"
python consultar_bombas.py --motor claude "cuales bombas llevan sello de Viton"
python consultar_bombas.py --bomba P-1401 "dame todo lo que sepas de esta bomba"
python consultar_bombas.py              # modo interactivo
```

El script arma el contexto con las fichas y se lo manda al modelo con
instrucciones estrictas. La más importante:

> Si el dato no está, decí "ese dato todavía no está levantado" y nombrá el
> campo que falta. **Nunca inventes una medida ni un código de repuesto.**

Eso no es un detalle: un o-ring equivocado en una planta de alcohol es una
fuga de producto inflamable. La IA tiene que saber callarse cuando no sabe.

## Tres formas de usarlo

| Forma | Para quién | Cómo |
|---|---|---|
| Obsidian directo | Vos, trabajando | Abrís la nota, buscás con Ctrl+F |
| Script de consulta | Mecánico desde la PC | `python consultar_bombas.py "..."` |
| Copiar y pegar | Cualquiera, sin instalar nada | Pegar la ficha en Claude/ChatGPT y preguntar |

La tercera es la que hace esto a prueba de todo: aunque nadie mantenga el
script, la ficha sigue siendo un texto que cualquier IA entiende.

## Estado

- [x] Plantilla definida
- [x] `P-1401` creada como modelo
- [x] Script generador
- [x] Script de consulta (Gemini / Claude / OpenAI)
- [x] Generar las 14 notas restantes — 15 fichas presentes en la revisión del 2026-10-07
- [ ] Llenar con el levantamiento de campo

Relacionado: [[10-Verificacion-bombas]] · [[03-Base-Activos-Bombas]] · [[12-Plan-segun-respuestas]]

# Verificación — 7 de octubre de 2026

Pruebas ejecutadas en Windows durante la organización documental. No se ejecutaron consultas reales de Gemini ni una nueva revisión visual.

## Visor

```text
✔ interpreta listas de o-rings sin ejecutar etiquetas YAML (15.1172ms)
✔ separa historial del ejemplo de sellado (0.9285ms)
✔ rechaza rutas fuera de la bóveda y TAG malicioso (1.5143ms)
✔ lee la ficha real sin convertir un ejemplo en un dato (50.7579ms)
✔ carga las 15 fichas y bloquea mutaciones sin token (241.8749ms)
ℹ tests 5
ℹ suites 0
ℹ pass 5
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 835.0029
OK: dos bombas demo, documento vinculado y creación/lectura de informe aislado. Registro temporal eliminado.
OK: bombas fuera de tanques, pedestales separados y dentro de la plataforma, en ambos modos.

```

## Exportador local vigente

Se ejecutó la versión de la bóveda real con salidas temporales aisladas. Las exportaciones existentes no se modificaron. Se probó sin informes externos; esto no valida la integración del historial del visor.

```text
OK exportador vigente: demo, 0 activos, _revision.txt generado. Sin informes externos en esta prueba.
OK exportador vigente: real, 15 activos, _revision.txt generado. Sin informes externos en esta prueba.

```

**Resultado:** el fallo de cero activos del adjunto anterior ya no se reproduce en el exportador local vigente. Persisten las limitaciones descritas en [[06-Pendientes-y-migracion]].


# Vocatus · Visor de bombas de Planta El Viejo

Lee [AGENTS.md](AGENTS.md) y la [guía de continuidad](00-Proyecto/Documentacion-visor/24-Continuidad-del-visor.md). Empieza desde la rama `main` de [GitHub](https://github.com/Kronnos2006/visor-bombas-el-viejo). El [visor de producción](https://visor-bombas-el-viejo.vercel.app/) usa Vercel y requiere iniciar sesión.

## Reglas para continuar

- Trabaja sobre el código activo en `visor-bombas/`. Los respaldos de código dentro de Obsidian sirven de referencia histórica.
- Conserva una sola plantilla de ficha para B1–B90. El Historial dentro de una bomba muestra únicamente su mantenimiento. Los reportes se guardan por TAG, el formulario inicia sin una bomba seleccionada y Responsable se completa con la cuenta activa.
- Identifica cada bomba por su TAG y por la evidencia más reciente. Mantén los cruces de placa, marca, variante y ubicación pendientes hasta confirmarlos. Conserva el 3D detallado de B48. Trata el CAD de referencia como geometría ilustrativa.
- Para probar Gemini en desarrollo, usa el transporte simulado. La prueba de producción previamente autorizada fue para B22.
- Trabaja con datos DEMO, bóvedas aisladas y una rama de trabajo. Corre `npm test` desde la raíz antes de publicar cambios. Para los flujos de usuario, usa `npm run test:ui` con Playwright.
- Mantén credenciales, respaldos de base, fotos privadas e informes reales fuera de Git. Las variables de entorno se administran en el servicio de despliegue o en el entorno local.

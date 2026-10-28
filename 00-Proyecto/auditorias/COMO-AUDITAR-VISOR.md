# Auditoría automática del visor

Ejecutar desde el proyecto:

```powershell
npm run audit:visor
```

También se puede abrir `Auditar visor.cmd`. Para elegir carpeta:

```powershell
npm run audit:visor -- --out "C:/ruta/a/informes" --max-ia 25
```

Comprueba sintaxis, recursos locales enlazados desde HTML, identidades y límites de referencias, lectura de fichas en una API DEMO de solo lectura y la suite completa de regresión. Genera `auditoria.md`, `auditoria.json` y `pruebas.txt`. Devuelve código 1 si falla un control y 2 si hay un error de ejecución o argumentos.

El límite solicitado se cumple mediante **cero llamadas a IA: uso real 0 %, máximo configurado 25 %**. No interpreta la cuota de la cuenta ni mide porcentajes de tokens o tiempo humano. No hay una fase de IA oculta; cualquier integración futura requerirá su propio control de presupuesto. El argumento `--max-ia` rechaza valores mayores de 25.

Los informes predeterminados quedan en `informes-auditoria/`, excluido de Git. No se envían informes ni código a servicios externos. La prueba de API fuerza DEMO/solo lectura en un proceso separado; la suite recibe una bóveda temporal con 15 fichas P sintéticas y copias de las referencias B del código; las pruebas que crean su propia bóveda conservan ese aislamiento. No ejecuta escrituras contra la bóveda real ni publica cambios.

Una auditoría aprobada solo cubre los controles ejecutados. El informe deja explícitamente pendientes los clics reales, la carga de fotos por interfaz, la revisión visual, el despliegue y los dispositivos físicos. No convierte una prueba simulada en evidencia de que el navegador funciona.

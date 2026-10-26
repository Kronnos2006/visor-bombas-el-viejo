import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import {temperaturaTrabajo} from './public/temperatura-trabajo.js';

export function safeText(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/[\r\n]+/g, ' ')
    .replace(/[—–]/g, '-')
    .replace(/[“”«»]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[•·]/g, '-')
    .replace(/[↗→]/g, '>')
    .replace(/[←]/g, '<')
    .replace(/[↑]/g, '^')
    .replace(/[↓]/g, 'v')
    .replace(/📘|📄|📐|✓|✔|★|☆|●/g, '')
    .replace(/[^\x00-\xFF]/g, ' ')
    .trim();
}

export async function generatePumpPDF(pump, { reportes = [] } = {}) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await doc.embedFont(StandardFonts.HelveticaOblique);

  const primaryColor = rgb(0.08, 0.22, 0.20);     // #143833
  const accentColor = rgb(0.20, 0.55, 0.45);      // #338c73
  const textDark = rgb(0.12, 0.16, 0.15);         // #1f2926
  const textMuted = rgb(0.40, 0.46, 0.44);        // #667570
  const bgHeader = rgb(0.94, 0.96, 0.95);         // #f0f5f2
  const bgRowAlt = rgb(0.97, 0.98, 0.98);         // #f7faf9
  const borderLight = rgb(0.82, 0.86, 0.85);      // #d1dcd9
  const alertColor = rgb(0.75, 0.35, 0.15);       // #bf5926

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const marginX = 40;
  const contentWidth = pageWidth - marginX * 2; // 515.28

  let page = doc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - 40;
  let pageNumber = 1;

  function checkPageBreak(neededHeight = 40) {
    if (y - neededHeight < 55) {
      drawFooter();
      page = doc.addPage([pageWidth, pageHeight]);
      pageNumber++;
      y = pageHeight - 40;
      // Draw minimal running header on subsequent pages
      page.drawText(safeText(`VOCATUS · RESUMEN TÉCNICO · ${tag}`), {
        x: marginX,
        y: y,
        size: 8,
        font: fontBold,
        color: textMuted
      });
      page.drawLine({
        start: { x: marginX, y: y - 5 },
        end: { x: marginX + contentWidth, y: y - 5 },
        thickness: 0.5,
        color: borderLight
      });
      y -= 25;
    }
  }

  function drawFooter() {
    page.drawLine({
      start: { x: marginX, y: 45 },
      end: { x: marginX + contentWidth, y: 45 },
      thickness: 0.5,
      color: borderLight
    });
    page.drawText(safeText('Vocatus · Atlas de mantenimiento · Azucarera El Viejo · Guanacaste, Costa Rica'), {
      x: marginX,
      y: 32,
      size: 7.5,
      font: fontOblique,
      color: textMuted
    });
    page.drawText(safeText(`Página ${pageNumber}`), {
      x: marginX + contentWidth - 45,
      y: 32,
      size: 7.5,
      font,
      color: textMuted
    });
  }

  const tag = pump.tag || 'EQUIPO';
  const data = pump.data || {};
  const isSector = Boolean(data.specs || data.variant);
  const nowStr = new Date().toLocaleDateString('es-CR', { year: 'numeric', month: 'long', day: 'numeric' });

  // 1. Top Banner
  page.drawRectangle({
    x: marginX,
    y: y - 55,
    width: contentWidth,
    height: 55,
    color: primaryColor
  });

  page.drawText('VOCATUS  |  ATLAS DE MANTENIMIENTO', {
    x: marginX + 16,
    y: y - 22,
    size: 13,
    font: fontBold,
    color: rgb(1, 1, 1)
  });

  page.drawText('AZUCARERA EL VIEJO · EQUIPOS DE PROCESO · FICHA TÉCNICA RESUMIDA', {
    x: marginX + 16,
    y: y - 36,
    size: 8,
    font,
    color: rgb(0.75, 0.90, 0.85)
  });

  page.drawText(safeText(`Emisión: ${nowStr}`), {
    x: marginX + contentWidth - 140,
    y: y - 36,
    size: 8,
    font,
    color: rgb(0.85, 0.95, 0.90)
  });

  y -= 70;

  // 2. Equipment Header Block
  const title = isSector
    ? `${data.marca || 'Bomba'} ${data.modelo || ''}`
    : `${data.marca || ''} ${data.modelo || ''} · ${data.tipo_bomba || 'Bomba centrífuga'}`;

  const subtitle = safeText(data.nombre || data.servicio || 'Sin denominación de servicio');

  page.drawRectangle({
    x: marginX,
    y: y - 48,
    width: contentWidth,
    height: 48,
    color: bgHeader,
    borderColor: borderLight,
    borderWidth: 1
  });

  // Tag Badge
  page.drawRectangle({
    x: marginX + 12,
    y: y - 36,
    width: 60,
    height: 22,
    color: accentColor
  });
  page.drawText(tag, {
    x: marginX + 18,
    y: y - 28,
    size: 11,
    font: fontBold,
    color: rgb(1, 1, 1)
  });

  page.drawText(safeText(title), {
    x: marginX + 82,
    y: y - 24,
    size: 12,
    font: fontBold,
    color: textDark
  });

  page.drawText(subtitle, {
    x: marginX + 82,
    y: y - 38,
    size: 8.5,
    font,
    color: textMuted
  });

  const estadoBadge = data.inactive ? 'SIN USO' : (data.estado ? data.estado.toUpperCase() : 'OPERANDO');
  page.drawText(safeText(estadoBadge), {
    x: marginX + contentWidth - 85,
    y: y - 28,
    size: 9,
    font: fontBold,
    color: data.inactive ? alertColor : accentColor
  });

  y -= 62;

  // Function to draw Section Header
  function drawSectionTitle(heading) {
    checkPageBreak(30);
    page.drawRectangle({
      x: marginX,
      y: y - 16,
      width: contentWidth,
      height: 18,
      color: bgHeader
    });
    page.drawLine({
      start: { x: marginX, y: y - 16 },
      end: { x: marginX + 4, y: y - 16 + 18 },
      thickness: 4,
      color: accentColor
    });
    page.drawText(safeText(heading.toUpperCase()), {
      x: marginX + 10,
      y: y - 12,
      size: 8.5,
      font: fontBold,
      color: primaryColor
    });
    y -= 24;
  }

  // Function to draw key-value table
  function drawGrid(pairs, cols = 2) {
    const colWidth = contentWidth / cols;
    const rowHeight = 17;
    for (let i = 0; i < pairs.length; i += cols) {
      checkPageBreak(rowHeight + 4);
      const isAlt = (Math.floor(i / cols) % 2 === 1);
      if (isAlt) {
        page.drawRectangle({
          x: marginX,
          y: y - rowHeight + 4,
          width: contentWidth,
          height: rowHeight,
          color: bgRowAlt
        });
      }

      for (let c = 0; c < cols; c++) {
        const item = pairs[i + c];
        if (!item) continue;
        const [label, val] = item;
        const cellX = marginX + c * colWidth + 6;
        const labelText = safeText(label + ':');
        const valText = safeText(val || 'Sin registrar');

        page.drawText(labelText, {
          x: cellX,
          y: y - 8,
          size: 7.5,
          font: fontBold,
          color: textMuted
        });

        const labelOffset = fontBold.widthOfTextAtSize(labelText, 7.5) + 5;
        page.drawText(valText, {
          x: cellX + labelOffset,
          y: y - 8,
          size: 7.5,
          font,
          color: val ? textDark : alertColor
        });
      }

      page.drawLine({
        start: { x: marginX, y: y - rowHeight + 4 },
        end: { x: marginX + contentWidth, y: y - rowHeight + 4 },
        thickness: 0.5,
        color: borderLight
      });

      y -= rowHeight;
    }
    y -= 6;
  }

  // 3. Technical Specs Sections
  if (isSector) {
    // Sector pump data
    drawSectionTitle('1. Identificación y Ubicación');
    drawGrid([
      ['TAG', tag],
      ['Ubicación (Tanque)', data.nombre],
      ['Lado / Área', data.area],
      ['Fabricante', data.marca],
      ['Modelo', data.modelo],
      ['Tamaño ANSI', data.size],
      ['Servicio / Fluido', data.servicio],
      ['Fuente documental', data.source]
    ]);

    drawSectionTitle('2. Especificaciones de Proceso e Hidráulica');
    const processSpecs = [['Temperatura de trabajo', temperaturaTrabajo(data)], ...(data.specs || []).map(([k, v]) => [k, v])];
    if (processSpecs.length) {
      drawGrid(processSpecs);
    } else {
      drawGrid([['Datos de proceso', 'Por confirmar en campo / catálogo']]);
    }

    drawSectionTitle('3. Sistema de Sellado Mecánico (Crítico)');
    const seal = data.seal || {};
    drawGrid([
      ['Tipo de sellado', seal.tipo || 'Por confirmar'],
      ['Diámetro del sello', seal.diametro || 'Por confirmar'],
      ['Caras de contacto', seal.caras || 'Por confirmar'],
      ['Elastómero', seal.elastomero || 'Por confirmar'],
      ['Código de repuesto', seal.codigo || 'Por confirmar'],
      ['Acople mecánico', data.acople || 'Por confirmar']
    ]);

    if (Array.isArray(data.orings) && data.orings.length) {
      const oringRows = data.orings.map(o => [
        `O-Ring: ${o.posicion || 'General'}`,
        `${o.medida || ''} (${o.material || 'Mat. pendiente'}, cant: ${o.cantidad || 1})`
      ]);
      drawGrid(oringRows, 1);
    }

    drawSectionTitle('4. Motor Eléctrico y Rodamientos');
    const motor = data.motor || {};
    const rod = data.rodamientos || {};
    drawGrid([
      ['Fabricante motor', motor.marca || 'Por confirmar'],
      ['Catálogo motor', motor.catalogo || 'Por confirmar'],
      ['Potencia motor', motor.potencia || 'Por confirmar'],
      ['Velocidad motor', motor.rpm || 'Por confirmar'],
      ['Rodamiento delantero', rod.delantero || 'Por confirmar'],
      ['Rodamiento trasero', rod.trasero || 'Por confirmar'],
      ['Conjunto rodamiento', rod.conjunto || 'Bomba / motor']
    ]);
  } else {
    // Obsidian Vault pump data
    drawSectionTitle('1. Identificación y Estado');
    drawGrid([
      ['TAG', tag],
      ['Área de planta', data.area || 'No especificada'],
      ['Servicio', data.servicio || 'No especificado'],
      ['Fabricante', data.marca || 'No registrado'],
      ['Modelo', data.modelo || 'No registrado'],
      ['Número de serie', data.serie || 'No registrado'],
      ['Año', data.anio ? String(data.anio) : 'No registrado'],
      ['Criticidad', data.criticidad ? String(data.criticidad).toUpperCase() : 'MEDIA']
    ]);

    drawSectionTitle('2. Datos de Operación e Hidráulica');
    drawGrid([
      ['Fluido', data.fluido || 'No registrado'],
      ['Temperatura de trabajo', data.temperatura_c ? `${data.temperatura_c} °C` : temperaturaTrabajo(data)],
      ['Caudal nominal', data.caudal_m3h ? `${data.caudal_m3h} m³/h` : 'No registrado'],
      ['Altura dinámica', data.altura_m ? `${data.altura_m} m` : 'No registrada'],
      ['Presión', data.presion_bar ? `${data.presion_bar} bar` : 'No registrada'],
      ['Potencia requerida', data.potencia_kw ? `${data.potencia_kw} kW` : 'No registrada'],
      ['Velocidad giro', data.rpm ? `${data.rpm} rpm` : 'No registrada'],
      ['Diámetro eje', data.diametro_eje_mm ? `${data.diametro_eje_mm} mm` : 'No registrado']
    ]);

    drawSectionTitle('3. Sistema de Sellado y Empaques');
    drawGrid([
      ['Tipo sellado', data.tipo_sellado || 'No registrado'],
      ['Marca sello', data.sello_marca || 'No registrada'],
      ['Modelo sello', data.sello_modelo || 'No registrado'],
      ['Diámetro sello', data.sello_diametro_mm ? `${data.sello_diametro_mm} mm` : 'No registrado'],
      ['Cara rotativa', data.sello_cara_rotativa || 'No registrada'],
      ['Cara estacionaria', data.sello_cara_estatica || 'No registrada'],
      ['Elastómero sello', data.sello_elastomero || 'No registrado'],
      ['Resorte sello', data.sello_resorte || 'No registrado']
    ]);

    if (Array.isArray(data.orings) && data.orings.length) {
      const oringRows = data.orings.map(o => [
        `O-Ring: ${o.posicion || 'Posición n/d'}`,
        `${o.medida || ''} (Cant: ${o.cantidad ?? 1}, Mat: ${o.material || 'n/d'})`
      ]);
      drawGrid(oringRows, 1);
    }
  }

  // 4. Maintenance Records / History
  drawSectionTitle('5. Registros de Mantenimiento e Historial');

  // Un solo listado, sin duplicados: los informes de Obsidian llegan del servidor y también
  // en la lista del navegador (con el mismo id); los del navegador importados traen sourceId.
  const historyItems = [], vistos = new Set();
  const clave = (...ids) => ids.filter(Boolean).map(String);
  const agregar = (item, ids) => {
    const k = clave(...ids);
    if (k.some(id => vistos.has(id))) return;
    k.forEach(id => vistos.add(id));
    historyItems.push(item);
  };
  for (const r of Array.isArray(pump.reports) ? pump.reports : []) {
    const rec = r.record || {};
    agregar({
      fecha: rec.date || 'Sin fecha',
      tipo: rec.demonstration ? 'Informe DEMO (Obsidian)' : 'Informe en Obsidian',
      detalle: [rec.title, rec.text].filter(Boolean).join(': ') || r.file,
      responsable: rec.author || 'Responsable no registrado',
      procedencia: r.file || ''
    }, [rec.id, rec.sourceId]);
  }
  for (const h of Array.isArray(data.history) ? data.history : []) {
    agregar({...h, procedencia: h.procedencia || 'Ficha del equipo'}, [h.id]);
  }
  for (const rep of Array.isArray(reportes) ? reportes : []) {
    agregar({
      fecha: rep.date || rep.fecha || 'Sin fecha',
      tipo: rep.demonstration ? 'Reporte DEMO' : rep.source === 'browser' ? 'Reporte guardado solo en el navegador' : 'Informe en Obsidian',
      detalle: [rep.title || rep.titulo, rep.text].filter(Boolean).join(': '),
      responsable: rep.author || rep.responsable || 'Responsable no registrado',
      procedencia: rep.source === 'browser' ? 'Navegador de quien generó el PDF' : (rep.file || '')
    }, [rep.id, rep.sourceId]);
  }
  historyItems.sort((a, b) => String(b.fecha || '').localeCompare(String(a.fecha || '')));

  const MAX_HISTORIAL = 30, mostrados = historyItems.slice(0, MAX_HISTORIAL);
  const wrapLines = (text, f, size, width) => {
    const out = []; let cur = '';
    for (const w of text.split(' ')) {
      const t = cur ? cur + ' ' + w : w;
      if (f.widthOfTextAtSize(t, size) > width && cur) { out.push(cur); cur = w; } else cur = t;
    }
    if (cur) out.push(cur);
    return out;
  };
  if (mostrados.length) {
    if (historyItems.length > mostrados.length) {
      checkPageBreak(18);
      page.drawText(safeText(`Se muestran los ${mostrados.length} registros más recientes de ${historyItems.length}. El historial completo está en Obsidian.`), {x: marginX + 6, y: y - 8, size: 7.5, font: fontOblique, color: alertColor});
      y -= 16;
    }
    for (const item of mostrados) {
      const itemTitle = safeText(`${item.fecha || ''} · ${item.tipo || 'Intervención'}`);
      const itemResp = safeText(`Responsable: ${item.responsable || 'no registrado'}`);
      const lines = wrapLines(safeText(item.detalle || item.title || item.texto || ''), font, 7.5, contentWidth - 12);
      const origen = item.procedencia ? safeText(`Procedencia: ${item.procedencia}`) : '';
      checkPageBreak(24 + lines.length * 10 + (origen ? 10 : 0));
      page.drawText(itemTitle, {x: marginX + 6, y: y - 8, size: 8, font: fontBold, color: primaryColor});
      page.drawText(itemResp, {x: marginX + contentWidth - Math.min(220, font.widthOfTextAtSize(itemResp, 7) + 4), y: y - 8, size: 7, font: fontOblique, color: textMuted});
      let ly = y - 19;
      for (const l of lines) {
        if (ly < 60) { checkPageBreak(1000); ly = y - 8; }
        page.drawText(l, {x: marginX + 6, y: ly, size: 7.5, font, color: textDark}); ly -= 10;
      }
      if (origen) { page.drawText(origen, {x: marginX + 6, y: ly, size: 6.5, font: fontOblique, color: textMuted}); ly -= 10; }
      page.drawLine({start: {x: marginX, y: ly + 3}, end: {x: marginX + contentWidth, y: ly + 3}, thickness: 0.5, color: borderLight});
      y = ly - 4;
    }
  } else {
    checkPageBreak(25);
    page.drawText(safeText('Sin registros documentales o intervenciones registradas.'), {x: marginX + 8, y: y - 10, size: 8, font: fontOblique, color: textMuted});
    y -= 25;
  }

  // 5. Notes & Observations
  const notesText = pump.failures || pump.observations || data.association || '';
  if (notesText) {
    drawSectionTitle('6. Notas y Modos de Falla a Vigilar');
    checkPageBreak(30);
    for (const l of wrapLines(safeText(notesText), font, 7.5, contentWidth - 12)) {
      checkPageBreak(12);
      page.drawText(l, {x: marginX + 6, y: y - 10, size: 7.5, font, color: textDark});
      y -= 10;
    }
    y -= 14;
  }

  // Draw footer on last page
  drawFooter();

  return await doc.save();
}

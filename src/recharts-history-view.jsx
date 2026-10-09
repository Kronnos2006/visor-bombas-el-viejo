import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Area,
  AreaChart
} from 'recharts';

function CustomTooltip({ active, payload, label, unit }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{
        background: '#122025',
        border: '1px solid #355350',
        borderRadius: '6px',
        padding: '10px 14px',
        color: '#e0ece9',
        fontSize: '11px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.5)'
      }}>
        <div style={{ fontWeight: 700, color: '#c6ed86', marginBottom: '4px' }}>
          {label} · {data.tipo || 'Registro'}
        </div>
        <div style={{ margin: '3px 0' }}>
          <strong>Valor registrado:</strong> {payload[0].value} {unit}
        </div>
        {data.nominal !== undefined && (
          <div style={{ color: '#88a69f' }}>
            <strong>Referencia de diseño:</strong> {data.nominal} {unit}
          </div>
        )}
        {data.detalle && (
          <div style={{ marginTop: '5px', color: '#9fb3af', maxWidth: '240px', fontSize: '10px', lineHeight: 1.4 }}>
            {data.detalle}
          </div>
        )}
      </div>
    );
  }
  return null;
}

export function PumpHistoryCharts({ pumpTag, records = [], nominalPressure = null, nominalFlow = null }) {
  const [metric, setMetric] = useState('pressure'); // 'pressure' | 'flow' | 'both'

  // Build unified data series from maintenance records
  const chartData = records.map((r, idx) => ({
    id: idx,
    fecha: r.fecha || `Reg. ${idx + 1}`,
    tipo: r.tipo || 'Inspección',
    presion: r.presion !== undefined && r.presion !== null ? Number(r.presion) : null,
    caudal: r.caudal !== undefined && r.caudal !== null ? Number(r.caudal) : null,
    nominalPresion: nominalPressure,
    nominalCaudal: nominalFlow,
    detalle: r.detalle || r.titulo || ''
  }));

  const hasPressure = chartData.some(d => d.presion !== null);
  const hasFlow = chartData.some(d => d.caudal !== null);

  const activeUnit = metric === 'pressure' ? 'bar' : 'm³/h';
  const activeColor = metric === 'pressure' ? '#38bdf8' : '#c6ed86';

  return (
    <div className="recharts-history-card" style={{
      background: '#121f24',
      border: '1px solid #283e3f',
      borderRadius: '8px',
      padding: '14px 16px',
      marginTop: '16px',
      marginBottom: '16px',
      color: '#dce7e5'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
        <div>
          <span style={{ fontSize: '9px', letterSpacing: '1.4px', color: '#7e9c96', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>
            TELEMETRÍA E HISTORIAL · {pumpTag}
          </span>
          <h3 style={{ margin: '3px 0 0', fontSize: '14px', color: '#e2f4ef', fontWeight: 600 }}>
            Histórico Operacional de Mantenimiento
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            type="button"
            onClick={() => setMetric('pressure')}
            style={{
              fontSize: '10px',
              padding: '5px 10px',
              borderRadius: '5px',
              border: '1px solid ' + (metric === 'pressure' ? '#38bdf8' : '#334b4c'),
              background: metric === 'pressure' ? '#183b48' : '#14252a',
              color: metric === 'pressure' ? '#7dd3fc' : '#8fa8a4',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Presión (bar)
          </button>
          <button
            type="button"
            onClick={() => setMetric('flow')}
            style={{
              fontSize: '10px',
              padding: '5px 10px',
              borderRadius: '5px',
              border: '1px solid ' + (metric === 'flow' ? '#c6ed86' : '#334b4c'),
              background: metric === 'flow' ? '#273c2a' : '#14252a',
              color: metric === 'flow' ? '#d8f8a2' : '#8fa8a4',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Caudal (m³/h)
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginBottom: '14px' }}>
        <div style={{ background: '#0e181c', border: '1px solid #1f3237', borderRadius: '6px', padding: '8px 10px' }}>
          <span style={{ fontSize: '8.5px', color: '#7a9692', display: 'block', textTransform: 'uppercase' }}>
            {metric === 'pressure' ? 'Presión actual / última' : 'Caudal actual / último'}
          </span>
          <strong style={{ fontSize: '15px', color: activeColor }}>
            {metric === 'pressure'
              ? (chartData.filter(d => d.presion !== null).slice(-1)[0]?.presion ?? (nominalPressure ?? '—')) + ' bar'
              : (chartData.filter(d => d.caudal !== null).slice(-1)[0]?.caudal ?? (nominalFlow ?? '—')) + ' m³/h'}
          </strong>
        </div>

        <div style={{ background: '#0e181c', border: '1px solid #1f3237', borderRadius: '6px', padding: '8px 10px' }}>
          <span style={{ fontSize: '8.5px', color: '#7a9692', display: 'block', textTransform: 'uppercase' }}>
            Referencia de diseño
          </span>
          <strong style={{ fontSize: '15px', color: '#97b8b2' }}>
            {metric === 'pressure'
              ? (nominalPressure ? `${nominalPressure} bar` : 'Por confirmar')
              : (nominalFlow ? `${nominalFlow} m³/h` : 'Por confirmar')}
          </strong>
        </div>

        <div style={{ background: '#0e181c', border: '1px solid #1f3237', borderRadius: '6px', padding: '8px 10px' }}>
          <span style={{ fontSize: '8.5px', color: '#7a9692', display: 'block', textTransform: 'uppercase' }}>
            Registros graficados
          </span>
          <strong style={{ fontSize: '15px', color: '#e0ecea' }}>
            {chartData.length} lecturas
          </strong>
        </div>
      </div>

      {/* Chart container */}
      <div style={{ width: '100%', height: 210, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPressure" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorFlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c6ed86" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#c6ed86" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#23393c" vertical={false} />
            <XAxis
              dataKey="fecha"
              stroke="#6b8682"
              fontSize={9}
              tickLine={false}
            />
            <YAxis
              stroke="#6b8682"
              fontSize={9}
              tickLine={false}
              domain={[0, 'auto']}
              unit={metric === 'pressure' ? 'b' : ''}
            />
            <Tooltip content={<CustomTooltip unit={activeUnit} />} />

            {metric === 'pressure' && nominalPressure && (
              <ReferenceLine
                y={nominalPressure}
                stroke="#64748b"
                strokeDasharray="4 4"
                label={{ value: `Diseño: ${nominalPressure} bar`, fill: '#8ca4a0', fontSize: 8.5, position: 'top' }}
              />
            )}

            {metric === 'flow' && nominalFlow && (
              <ReferenceLine
                y={nominalFlow}
                stroke="#64748b"
                strokeDasharray="4 4"
                label={{ value: `Diseño: ${nominalFlow} m³/h`, fill: '#8ca4a0', fontSize: 8.5, position: 'top' }}
              />
            )}

            {metric === 'pressure' ? (
              <Area
                type="monotone"
                dataKey="presion"
                name="Presión (bar)"
                stroke="#38bdf8"
                strokeWidth={2.2}
                fillOpacity={1}
                fill="url(#colorPressure)"
                dot={{ r: 4, fill: '#38bdf8', stroke: '#122025', strokeWidth: 1.5 }}
                activeDot={{ r: 6, fill: '#bae6fd' }}
                connectNulls
              />
            ) : (
              <Area
                type="monotone"
                dataKey="caudal"
                name="Caudal (m³/h)"
                stroke="#c6ed86"
                strokeWidth={2.2}
                fillOpacity={1}
                fill="url(#colorFlow)"
                dot={{ r: 4, fill: '#c6ed86', stroke: '#122025', strokeWidth: 1.5 }}
                activeDot={{ r: 6, fill: '#ecfccb' }}
                connectNulls
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '9.5px', color: '#7a9692' }}>
        <span>Gráfico interactivo generado con Recharts.</span>
        <span>Puntos interpolados según calibración e intervenciones registradas.</span>
      </div>
    </div>
  );
}

// Factory to mount onto any DOM container
const roots = new WeakMap();

export function renderRechartsHistory(container, props) {
  if (!container) return;
  let root = roots.get(container);
  if (!root) {
    root = createRoot(container);
    roots.set(container, root);
  }
  root.render(<PumpHistoryCharts {...props} />);
}

export function unmountRechartsHistory(container) {
  if (!container) return;
  const root = roots.get(container);
  if (root) {
    root.unmount();
    roots.delete(container);
  }
}

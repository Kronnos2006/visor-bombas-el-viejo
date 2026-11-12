// Posiciones en mm reconstruidas de la sección A–A y el detalle B de la lámina 2.
// Los giros y el despiece vienen de las ocurrencias del archivo de Inventor.
const axial = {
  1: [0], 2: [40], 3: [104], 4: [154], 5: [52], 6: [184], 7: [104],
  8: [258, 412], 9: [40, 104], 10: [154], 11: [134, 144, 164, 174],
  12: [263, 408], 13: [271, 380], 14: [400], 15: [410], 16: [404, 382],
  17: [380], 18: [378], 23: [263, 407], 24: [436], 25: [78], 26: [73],
};

export function assembledPosition(number, instance, [, y, z]) {
  let axis = axial[number]?.[instance - 1];
  let height = 0;
  let depth = 0;

  if (number >= 19 && number <= 21) {
    // Ocho espárragos en la unión de carcasa y dos en el prensaestopas.
    const casing = instance <= 8;
    axis = (casing ? [103, 168, 170] : [145, 207, 209])[number - 19];
    const pitch = casing ? 84 : 50;
    const radius = Math.hypot(y, z);
    height = pitch * y / radius;
    depth = pitch * z / radius;
  } else if (number === 22) {
    // Los tornillos alternan entre las tapas delantera y trasera.
    axis = instance % 2 ? 254 : 416;
    const radius = Math.hypot(y, z);
    height = 42 * y / radius;
    depth = 42 * z / radius;
  } else if (number === 14) {
    height = -112;
  } else if (number >= 15 && number <= 18) {
    height = -77;
  } else if (number === 23) {
    height = 47;
  } else if (number === 24 || number === 25) {
    height = number === 24 ? 8 : 5.5;
  }

  if (!Number.isFinite(axis)) throw new Error(`Posición de montaje ausente: ${number}:${instance}`);
  // Se centra el montaje sobre su longitud y se convierte a metros.
  return [(axis - 240) / 1000, height / 1000, depth / 1000];
}

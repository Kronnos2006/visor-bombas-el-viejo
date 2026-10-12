// Contraseña única para el visor publicado (variable de entorno VISOR_PASSWORD en Vercel).
// Sin la variable, el acceso queda abierto como antes. El usuario del cuadro de diálogo es libre.
export function passwordOk(authorization, password) {
 if (!password) return true;
 const header = String(authorization || '');
 if (!header.startsWith('Basic ')) return false;
 let decoded = '';
 try { decoded = atob(header.slice(6).trim()); } catch { return false; }
 const given = decoded.slice(decoded.indexOf(':') + 1);
 // Comparación de tiempo constante para no revelar la contraseña por tiempos de respuesta.
 let diff = given.length ^ password.length;
 for (let i = 0; i < Math.max(given.length, password.length); i++) diff |= (given.charCodeAt(i) || 0) ^ (password.charCodeAt(i) || 0);
 return diff === 0;
}

// validators/usuarios.js

export function validarUsuario(data, esUpdate = false) {
  const errores = [];

  if (!esUpdate || data.nombre !== undefined) {
    if (!data.nombre || data.nombre.trim().length < 2) {
      errores.push("El nombre debe tener al menos 2 caracteres");
    }
  }

  if (!esUpdate || data.email !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errores.push("Formato de correo electrónico inválido");
    }
  }

  if (!esUpdate || data.password !== undefined) {
    if (!data.password || data.password.length < 8) {
      errores.push("La contraseña debe tener al menos 8 caracteres");
    }
  }

  if (!esUpdate || data.rol !== undefined) {
    if (!["cliente", "admin"].includes(data.rol)) {
      errores.push("Rol inválido, debe ser 'cliente' o 'admin'");
    }
  }

  return errores;
}

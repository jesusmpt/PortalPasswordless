// ======================================================
// app.js - Lógica del portal passwordless
// ======================================================
async function cargarMetodos() {
  try {
    const res = await fetch('/api/getAuthMethods');
    const data = await res.json();

    const contenedor = document.getElementById('methods');
    if (data.error) {
      contenedor.innerHTML = '<p style=\"color:red\">Error: ' + data.error + '</p>';
      return;
    }

    let html = '<h2>Tus métodos de autenticación</h2><ul>';
    for (const [tipo, lista] of Object.entries(data)) {
      html += <li><strong></strong>: </li>;
    }
    html += '</ul>';

    if (data.password && data.password.length > 0) {
      html += '<p>?? Todavía tienes contraseña activa. Te recomendamos activar un método passwordless.</p>';
    }

    if ((data.fido2?.length || data.microsoftAuthenticator?.length || data.windowsHello?.length)) {
      html += '<h3 style=\"color:green\">?? ¡Felicidades! Ya tienes al menos un método passwordless.</h3>';
    } else {
      html += '<h3 style=\"color:orange\">?? Aún no tienes un método passwordless configurado.</h3>';
      html += '<p>Visita <a href=\"https://aka.ms/mysignins\" target=\"_blank\">aka.ms/mysignins</a> para registrar Microsoft Authenticator o una clave FIDO2.</p>';
    }

    html += '<p><a class=\"btn\" href=\"/.auth/logout\">Cerrar sesión</a></p>';
    contenedor.innerHTML = html;
  } catch (e) {
    console.error(e);
  }
}

// Si el usuario está autenticado, cargar los métodos
fetch('/.auth/me')
  .then(r => r.ok ? cargarMetodos() : null)
  .catch(() => {});

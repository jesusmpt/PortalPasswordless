const fetch = require('node-fetch');

module.exports = async function (context, req) {
  const tenantId = process.env.TENANT_ID;
  const clientId = process.env.CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) {
    context.res = { status: 500, body: { error: 'Faltan variables de entorno TENANT_ID, CLIENT_ID o CLIENT_SECRET.' } };
    return;
  }

  try {
    // Obtener token Graph
    const tokenResponse = await fetch(https://login.microsoftonline.com//oauth2/v2.0/token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: client_id=&scope=https%3A%2F%2Fgraph.microsoft.com%2F.default&client_secret=&grant_type=client_credentials
    });

    const tokenData = await tokenResponse.json();
    const token = tokenData.access_token;

    // Consultar métodos de autenticación del usuario actual
    // (En entorno real, se debería obtener userId desde /.auth/me y pasarlo como parámetro)
    const userEmail = req.headers['x-ms-client-principal-name'] || 'usuario@example.com';

    const headers = { 'Authorization': Bearer  };
    const tipos = {
      microsoftAuthenticator: https://graph.microsoft.com/v1.0/users//authentication/microsoftAuthenticatorMethods,
      fido2: https://graph.microsoft.com/v1.0/users//authentication/fido2Methods,
      windowsHello: https://graph.microsoft.com/v1.0/users//authentication/windowsHelloForBusinessMethods,
      phone: https://graph.microsoft.com/v1.0/users//authentication/phoneMethods,
      password: https://graph.microsoft.com/v1.0/users//authentication/passwordMethods
    };

    const resultados = {};
    for (const [k, url] of Object.entries(tipos)) {
      const r = await fetch(url, { headers });
      const d = await r.json();
      resultados[k] = d.value || [];
    }

    context.res = { status: 200, body: resultados };
  } catch (err) {
    context.res = { status: 500, body: { error: err.message } };
  }
};

const fetch = require('node-fetch');

module.exports = async function (context, req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    context.res = { status: 401, body: "Falta el token de autenticación" };
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const graphRes = await fetch("https://graph.microsoft.com/v1.0/me/authentication/methods", {
      headers: { Authorization: Bearer  },
    });

    const graphData = await graphRes.json();
    const methods = graphData.value.map((m) => m["@odata.type"].split(".").pop());

    context.res = {
      status: 200,
      body: { methods },
    };
  } catch (err) {
    context.res = { status: 500, body: Error al consultar Graph:  };
  }
};

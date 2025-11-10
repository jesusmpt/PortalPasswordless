import { Client } from "@microsoft/microsoft-graph-client";
import "isomorphic-fetch";

export default async function (context, req) {
  try {
    // ID del usuario autenticado
    const userId = req.headers["x-ms-client-principal-id"];

    const tenantId = process.env.AZURE_TENANT_ID;
    const clientId = process.env.AZURE_CLIENT_ID;
    const clientSecret = process.env.AZURE_CLIENT_SECRET;

    // Obtener token con client credentials
    const tokenResponse = await fetch(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          scope: "https://graph.microsoft.com/.default",
          client_secret: clientSecret,
          grant_type: "client_credentials",
        }),
      }
    );
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    const client = Client.init({
      authProvider: (done) => done(null, accessToken),
    });

    // Obtener información básica del usuario
    const user = await client.api(`/users/${userId}`).select("displayName,givenName,surname,mail,userPrincipalName").get();

    // Obtener métodos de autenticación
    const methodsResponse = await client
      .api(`/users/${userId}/authentication/methods`)
      .get();

    const availableMethods = methodsResponse.value.map((m) => {
      return {
        type: m["@odata.type"].split(".").pop(), // tipo de método: phone, fido2, microsoftAuthenticator...
        displayName: m.displayName || "",
        phoneNumber: m.phoneNumber || "",
      };
    });

    // Detectar si le falta passwordless
    const passwordlessMethods = ["fido2AuthenticationMethod", "microsoftAuthenticatorAuthenticationMethod"];
    const missing = passwordlessMethods.filter(
      (m) => !availableMethods.some((am) => am.type.toLowerCase() === m.toLowerCase())
    );

    context.res = {
      status: 200,
      body: {
        user,
        availableMethods,
        missingPasswordless: missing,
      },
    };
  } catch (error) {
    console.error(error);
    context.res = {
      status: 500,
      body: { error: error.message },
    };
  }
}

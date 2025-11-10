import React, { useEffect, useState } from "react";
import { PublicClientApplication, InteractionType } from "@azure/msal-browser";
import { MsalProvider, useMsal, useIsAuthenticated } from "@azure/msal-react";

const msalConfig = {
  auth: {
    clientId: "TU_CLIENT_ID_ENTRAID",
    authority: "https://login.microsoftonline.com/TU_TENANT_ID",
    redirectUri: window.location.origin,
  },
};

const msalInstance = new PublicClientApplication(msalConfig);

function Dashboard() {
  const { instance, accounts } = useMsal();
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const getAuthMethods = async () => {
      try {
        const account = accounts[0];
        const response = await instance.acquireTokenSilent({
          scopes: ["UserAuthenticationMethod.Read.All"],
          account,
        });

        const res = await fetch("/api/auth-methods", {
          headers: {
            Authorization: `Bearer ${response.accessToken}`,
          },
        });

        const data = await res.json();
        setMethods(data.methods);

        const hasPasswordless =
          data.methods.includes("Microsoft Authenticator") ||
          data.methods.includes("FIDO2") ||
          data.methods.includes("Windows Hello");

        setStatus(
          hasPasswordless
            ? "✅ Tu cuenta ya es passwordless."
            : "⚠️ Aún tienes métodos basados en contraseña. Vamos a ayudarte a migrar."
        );
      } catch (err) {
        console.error(err);
        setStatus("Error al obtener los métodos de autenticación.");
      } finally {
        setLoading(false);
      }
    };
    getAuthMethods();
  }, [instance, accounts]);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Portal Passwordless</h1>
      {loading ? (
        <p>Cargando métodos...</p>
      ) : (
        <>
          <p>{status}</p>
          <ul>
            {methods.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
          <button onClick={() => instance.logoutRedirect()}>Cerrar sesión</button>
        </>
      )}
    </div>
  );
}

function App() {
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const handleLogin = () => {
    instance.loginRedirect({
      scopes: ["openid", "profile", "email", "UserAuthenticationMethod.Read.All"],
    });
  };

  return (
    <div style={{ textAlign: "center", marginTop: "4rem" }}>
      {isAuthenticated ? (
        <Dashboard />
      ) : (
        <>
          <h1>Bienvenido al portal Passwordless</h1>
          <button onClick={handleLogin}>Iniciar sesión con Entra ID</button>
        </>
      )}
    </div>
  );
}

export default function WrapperApp() {
  return (
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>
  );
}

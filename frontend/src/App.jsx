import React, { useEffect, useState } from "react";
import { PublicClientApplication, InteractionType } from "@azure/msal-browser";
import { MsalProvider, useMsal, useIsAuthenticated } from "@azure/msal-react";

const msalConfig = {
  auth: {
    clientId: "8dcec823-8928-41f7-a9b5-e85db1dc6c12",
    authority: "https://login.microsoftonline.com/9ff87f7c-8358-46b5-88bc-d73c09ce789f",
    redirectUri: window.location.origin,
  },
};

const msalInstance = new PublicClientApplication(msalConfig);

function Dashboard() {
  const { instance, accounts } = useMsal();
  const [methods, setMethods] = useState([]);
  const [status, setStatus] = useState("Cargando métodos...");

  useEffect(() => {
    const getAuthMethods = async () => {
      try {
        const account = accounts[0];
        const response = await instance.acquireTokenSilent({
          scopes: ["UserAuthenticationMethod.Read.All"],
          account,
        });

        const res = await fetch("/api/auth-methods", {
          headers: { Authorization: Bearer  },
        });

        const data = await res.json();
        setMethods(data.methods);

        const hasPasswordless =
          data.methods.includes("Microsoft Authenticator") ||
          data.methods.includes("FIDO2") ||
          data.methods.includes("Windows Hello");

        setStatus(
          hasPasswordless
            ? "? Tu cuenta ya es passwordless."
            : "?? Aún tienes métodos basados en contraseña. Vamos a ayudarte a migrar."
        );
      } catch (err) {
        console.error(err);
        setStatus("Error al obtener los métodos de autenticación.");
      }
    };

    getAuthMethods();
  }, [instance, accounts]);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Portal Passwordless</h1>
      <p>{status}</p>
      <ul>
        {methods.map((m, i) => (
          <li key={i}>{m}</li>
        ))}
      </ul>
      <button onClick={() => instance.logoutRedirect()}>Cerrar sesión</button>
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
      <h1>Bienvenido al portal Passwordless</h1>
      <p>Si llegaste aquí, ya estás autenticado con Entra ID.</p>
      <button onClick={() => (window.location.href = "/logout")}>Logout</button>
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


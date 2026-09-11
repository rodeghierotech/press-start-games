import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"

import App from "./App.tsx"
import Layout from "./Layout.tsx"
import { createBrowserRouter, RouterProvider } from "react-router-dom"

const rotas = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <App /> },
      { path: "jogos/:id", lazy: async () => ({ Component: (await import("./GameDetails.tsx")).default }) },
      { path: "login", lazy: async () => ({ Component: (await import("./AuthLogin.tsx")).default }) },
      { path: "cadastro", lazy: async () => ({ Component: (await import("./AuthRegister.tsx")).default }) },
      { path: "admin", lazy: async () => ({ Component: (await import("./AdminDashboard.tsx")).default }) },
      { path: "*", lazy: async () => ({ Component: (await import("./NotFound.tsx")).default }) },
    ],
  },
])

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={rotas} />
  </StrictMode>,
)

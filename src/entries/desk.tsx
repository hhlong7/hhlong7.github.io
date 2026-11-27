import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "@/index.css"
import { DeskScene } from "@/desk/desk-scene"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DeskScene />
  </StrictMode>,
)

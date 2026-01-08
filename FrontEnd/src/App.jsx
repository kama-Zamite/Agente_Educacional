import { useState } from "react";
import Login from "./components/Login";
import LancarNotas from "./components/LancarNotas";
import Resultado from "./components/Resultado";

export default function App() {
  const [usuario, setUsuario] = useState("");
  const [papel, setPapel] = useState(""); // "professor" ou "aluno"

  return (
    <div style={{fontFamily: "Arial" }}>
      {!usuario ? (
        <Login setUsuario={setUsuario} setPapel={setPapel} />
      ) : papel === "professor" ? (
        <LancarNotas usuario={usuario} />
      ) : (
        <Resultado usuario={usuario} />
      )}
    </div>
  );
}

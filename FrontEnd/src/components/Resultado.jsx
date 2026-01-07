import { useState } from "react";

export default function Resultado({ usuario }) {
  const [senha, setSenha] = useState("");
  const [alunoId, setAlunoId] = useState("");
  const [resultado, setResultado] = useState(null);
  const [msg, setMsg] = useState("");

  const handleVerResultado = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/aluno/resultado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, senha, aluno_id: alunoId }),
      });
      const data = await res.json();
      if (res.ok) {
        setResultado(data);
        setMsg("");
      } else {
        setMsg(data.detail || JSON.stringify(data));
      }
    } catch (e) {
      setMsg("Erro na conexão com API");
    }
  };

  return (
    <div>
      <h2>Consultar Resultado</h2>
      <input
        placeholder="Senha do aluno"
        type="password"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
      />
      <br />
      <input
        placeholder="ID do aluno"
        value={alunoId}
        onChange={(e) => setAlunoId(e.target.value)}
      />
      <br />
      <button onClick={handleVerResultado}>Ver Resultado</button>
      <p style={{ color: "red" }}>{msg}</p>
      {resultado && (
        <div style={{ marginTop: "20px" }}>
          <pre>{JSON.stringify(resultado, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

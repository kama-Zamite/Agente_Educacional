import { useState } from "react";

export default function LancarNotas({ usuario }) {
  const [alunoId, setAlunoId] = useState("");
  const [trimestre, setTrimestre] = useState(1);
  const [notas, setNotas] = useState({
    Matematica: 0,
    Fisica: 0,
    Algebra: 0,
    Informatica: 0,
    Programacao: 0,
    RedeComputadores: 0,
  });
  const [senha, setSenha] = useState("");
  const [msg, setMsg] = useState("");
  const [resultado, setResultado] = useState(null);

  const handleChangeNota = (materia, valor) => {
    setNotas({ ...notas, [materia]: parseFloat(valor) });
  };

  const handleLancar = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/professor/lancar-notas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario,
          senha,
          aluno_id: alunoId,
          trimestre,
          notas,
        }),
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
      <h2>Lançar Notas</h2>
      <input
        placeholder="Senha do professor"
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
      <select
        value={trimestre}
        onChange={(e) => setTrimestre(parseInt(e.target.value))}
      >
        <option value={1}>1º Trimestre</option>
        <option value={2}>2º Trimestre</option>
        <option value={3}>3º Trimestre</option>
      </select>
      <br />
      {Object.keys(notas).map((m) => (
        <div key={m}>
          <label>{m}: </label>
          <input
            type="number"
            value={notas[m]}
            onChange={(e) => handleChangeNota(m, e.target.value)}
          />
        </div>
      ))}
      <button onClick={handleLancar}>Lançar Notas</button>
      <p style={{ color: "red" }}>{msg}</p>
      {resultado && (
        <div style={{ marginTop: "20px" }}>
          <pre>{JSON.stringify(resultado, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import styles from "./LancarNotas.module.css";

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
    setNotas({
      ...notas,
      [materia]: valor === "" ? 0 : parseFloat(valor),
    });
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
        setMsg(data.detail || "Erro ao lançar notas");
      }
    } catch {
      setMsg("Erro na conexão com a API");
    }
  };

  return (
    <div className={styles.cardLancarNotas}>
      <h2 className={styles.titulo}>Lançamento de Notas</h2>

      <div className={styles.header}>
        <div className={styles.field}>
          <label>Senha do Professor</label>
          <input
            type="password"
            placeholder="••••••"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label>ID do Aluno</label>
          <input
            placeholder="Ex: aluno1"
            value={alunoId}
            onChange={(e) => setAlunoId(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label>Trimestre</label>
          <select
            value={trimestre}
            onChange={(e) => setTrimestre(Number(e.target.value))}
          >
            <option value={1}>1º Trimestre</option>
            <option value={2}>2º Trimestre</option>
            <option value={3}>3º Trimestre</option>
          </select>
        </div>
      </div>

      <div className={styles.disciplinasWrapper}>
        {Object.keys(notas).map((m) => (
          <div className={styles.disciplina} key={m}>
            <label>{m}</label>
            <input
              type="number"
              min="0"
              max="20"
              value={notas[m]}
              onChange={(e) => handleChangeNota(m, e.target.value)}
            />
          </div>
        ))}
      </div>

      <button className={styles.btnNotas} onClick={handleLancar}>
        Lançar Notas
      </button>

      {msg && <p className={styles.error}>{msg}</p>}

      {resultado && (
        <div className={styles.resultado}>
          <pre>{JSON.stringify(resultado, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

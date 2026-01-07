import { useState } from "react";

export default function Login({ setUsuario, setPapel }) {
  const [usuarioInput, setUsuarioInput] = useState("");
  const [senhaInput, setSenhaInput] = useState("");
  const [papelInput, setPapelInput] = useState("professor");
  const [msg, setMsg] = useState("");

  const handleLogin = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/login/${papelInput}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario: usuarioInput, senha: senhaInput }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsuario(usuarioInput);
        setPapel(papelInput);
        setMsg("");
      } else {
        setMsg(data.detail || "Erro ao fazer login");
      }
    } catch (e) {
      setMsg("Erro de conexão com API");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <input
        placeholder="Usuário"
        value={usuarioInput}
        onChange={(e) => setUsuarioInput(e.target.value)}
      />
      <br />
      <input
        placeholder="Senha"
        type="password"
        value={senhaInput}
        onChange={(e) => setSenhaInput(e.target.value)}
      />
      <br />
      <select value={papelInput} onChange={(e) => setPapelInput(e.target.value)}>
        <option value="professor">Professor</option>
        <option value="aluno">Aluno</option>
      </select>
      <br />
      <button onClick={handleLogin}>Entrar</button>
      <p style={{ color: "red" }}>{msg}</p>
    </div>
  );
}

const BASE_URL = "http://127.0.0.1:8000";

export async function login(usuario, senha, papel) {
  const res = await fetch(`${BASE_URL}/login/${papel}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario, senha }),
  });
  return await res.json();
}

export async function lancarNotas(usuario, senha, alunoId, trimestre, notas) {
  const res = await fetch(`${BASE_URL}/professor/lancar-notas`, {
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
  return await res.json();
}

export async function consultarResultado(usuario, senha, alunoId) {
  const res = await fetch(`${BASE_URL}/aluno/resultado`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario, senha, aluno_id: alunoId }),
  });
  return await res.json();
}

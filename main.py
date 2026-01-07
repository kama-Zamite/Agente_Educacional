from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from openai import OpenAI
from typing import Dict
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
import json
import os

client = OpenAI(
   openai.api_key= os.getenv("OPENAI_API_KEY")
)

app = FastAPI(title="TECSYRA API", version="2.0")

# CORS para React local
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MEMORIA_ARQ = "memoria_alunos.json"
USUARIOS_ARQ = "usuarios.json"

def carregar_json(arq):
    if not os.path.exists(arq):
        return {}
    with open(arq, "r", encoding="utf-8") as f:
        return json.load(f)

def salvar_json(arq, dados):
    with open(arq, "w", encoding="utf-8") as f:
        json.dump(dados, f, indent=2, ensure_ascii=False)

def autenticar(usuario: str, senha: str, papel: str):
    usuarios = carregar_json(USUARIOS_ARQ)
    user = usuarios.get(usuario)
    if not user or user["senha"] != senha or user["papel"] != papel:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    return usuario

class LoginDados(BaseModel):
    usuario: str
    senha: str

class LancarNotas(BaseModel):
    usuario: str
    senha: str
    aluno_id: str
    trimestre: int
    notas: Dict[str, float]

class ConsultaResultado(BaseModel):
    usuario: str
    senha: str
    aluno_id: str

def analisar_notas(notas):
    areas = {
        "Tecnologia": ["Programacao", "Informatica", "RedeComputadores"],
        "Exatas": ["Matematica", "Fisica", "Algebra"]
    }
    medias = {}
    for area, materias in areas.items():
        soma = sum(notas.get(m, 0) for m in materias)
        count = sum(1 for m in materias if m in notas)
        medias[area] = round(soma / count, 2) if count > 0 else 0
    return medias

def decidir_cursos(medias):
    cursos = []
    if medias["Tecnologia"] >= 16:
        cursos.append("Engenharia Informática")
    if medias["Tecnologia"] >= 14:
        cursos.append("Ciência da Computação")
    if medias["Exatas"] >= 15:
        cursos.append("Engenharia Civil")
    if medias["Exatas"] >= 14 and medias["Tecnologia"] >= 14:
        cursos.append("Engenharia Eletrônica")
    return cursos

def calcular_media_final(historico):
    soma, contagem = {}, {}
    for reg in historico.values():
        for m, n in reg["notas"].items():
            soma[m] = soma.get(m, 0) + n
            contagem[m] = contagem.get(m, 0) + 1
    return {m: round(soma[m] / contagem[m], 2) for m in soma}

# ----------------- ENDPOINTS -----------------
@app.post("/login/{papel}")
def login(papel: str, dados: LoginDados):
    autenticar(dados.usuario, dados.senha, papel)
    return {"status": f"Login como {papel} efetuado"}

@app.post("/professor/lancar-notas")
def lancar_notas(dados: LancarNotas):
    autenticar(dados.usuario, dados.senha, "professor")

    if dados.trimestre not in [1, 2, 3]:
        raise HTTPException(400, "Trimestre inválido")

    memoria = carregar_json(MEMORIA_ARQ)
    aluno = memoria.setdefault(dados.aluno_id, {"trimestres": {}})

    if str(dados.trimestre) in aluno["trimestres"]:
        raise HTTPException(400, "Notas deste trimestre já foram lançadas")

    aluno["trimestres"][str(dados.trimestre)] = {
        "data": datetime.now().strftime("%Y-%m-%d"),
        "notas": dados.notas
    }

    salvar_json(MEMORIA_ARQ, memoria)

    if len(aluno["trimestres"]) < 3:
        return {
            "status": "Notas registradas",
            "mensagem": f"{len(aluno['trimestres'])}/3 trimestres lançados"
        }

    notas_finais = calcular_media_final(aluno["trimestres"])
    medias = analisar_notas(notas_finais)
    cursos = decidir_cursos(medias)

    prompt = f"""
Aluno ID: {dados.aluno_id}

Média final:
{json.dumps(notas_finais, indent=2, ensure_ascii=False)}

Cursos sugeridos:
{cursos}

Explique em até 120 palavras de forma objetiva, baseada apenas nas notas.
"""

    resposta = client.responses.create(
        model="gpt-4.1-mini",
        input=prompt
    )

    return {
        "aluno": dados.aluno_id,
        "medias": medias,
        "cursos": cursos,
        "explicacao": resposta.output[0].content[0].text
    }

@app.post("/aluno/resultado")
def ver_resultado(dados: ConsultaResultado):
    autenticar(dados.usuario, dados.senha, "aluno")

    memoria = carregar_json(MEMORIA_ARQ)
    aluno = memoria.get(dados.aluno_id)

    if not aluno or len(aluno["trimestres"]) < 3:
        raise HTTPException(400, "Resultado ainda não disponível")

    notas_finais = calcular_media_final(aluno["trimestres"])
    medias = analisar_notas(notas_finais)

    return {
        "aluno": dados.aluno_id,
        "medias_finais": medias
    }

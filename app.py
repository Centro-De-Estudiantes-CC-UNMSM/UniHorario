from flask import Flask, request, jsonify
from flask_cors import CORS
from itertools import combinations, product

app = Flask(__name__)
CORS(app)  # Permite solicitudes desde cualquier dominio

def horarios_conflictos(horario1, horario2):
    dias_comunes = set(horario1['dias']).intersection(horario2['dias'])
    for dia in dias_comunes:
        for (start1, end1) in horario1['horas']:
            for (start2, end2) in horario2['horas']:
                if (start1 < end2) and (start2 < end1):
                    return True
    return False

def verificar_combinacion(combinacion):
    for i, curso1 in enumerate(combinacion):
        for j, curso2 in enumerate(combinacion):
            if i < j and horarios_conflictos(curso1, curso2):
                return False
    return True

@app.route("/", methods=["GET"])
def home():
    return jsonify({"mensaje": "API de UniHorario funcionando correctamente"}), 200

@app.route("/procesar", methods=["POST"])
def procesar():
    data = request.json
    cursos = data.get("cursos", [])
    
    # Estructurar los datos recibidos
    horarios = {}
    for curso in cursos:
        nombre = curso["nombre"]
        if nombre not in horarios:
            horarios[nombre] = []
        horarios[nombre].append({
            "sec": curso["seccion"],
            "dias": curso["dias"],
            "horas": curso["horas"]
        })

    # Generar combinaciones
    combinaciones_validas = []
    for r in range(2, len(horarios) + 1):
        for curso_comb in combinations(horarios.keys(), r):
            secciones = [(curso, list(horarios[curso])) for curso in curso_comb]
            for combinacion in product(*(sec for _, sec in secciones)):
                if verificar_combinacion(combinacion):
                    combinaciones_validas.append([
                        {"curso": curso, "seccion": c["sec"], "dias": c["dias"], "horas": c["horas"]}
                        for curso, c in zip(curso_comb, combinacion)
                    ])

    return jsonify(combinaciones_validas)

if __name__ == "__main__":
    app.run(debug=True)

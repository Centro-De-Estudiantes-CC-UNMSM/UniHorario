# 1. Importación de librerías
from flask import Flask, request, jsonify  # Framework web y manejo de solicitudes/respuestas
from flask_cors import CORS  # Para manejar CORS (Cross-Origin Resource Sharing)
from itertools import combinations, product  # Generar combinaciones de elementos

# 2. Inicialización de la aplicación Flask
app = Flask(__name__)
CORS(app)  # Habilita CORS para permitir solicitudes desde frontends en diferentes dominios

# 3. Función para detectar conflictos horarios entre dos cursos
def horarios_conflictos(horario1, horario2):
    # Encuentra días comunes entre ambos horarios
    dias_comunes = set(horario1['dias']).intersection(horario2['dias'])
    
    # Verifica superposición de horas en días comunes
    for dia in dias_comunes:
        for (start1, end1) in horario1['horas']:
            for (start2, end2) in horario2['horas']:
                if (start1 < end2) and (start2 < end1):  # Lógica de superposición temporal
                    return True  # Hay conflicto
    return False  # No hay conflicto

# 4. Función para validar una combinación completa de cursos
def verificar_combinacion(combinacion):
    # Compara todos los pares de cursos en la combinación
    for i, curso1 in enumerate(combinacion):
        for j, curso2 in enumerate(combinacion):
            if i < j and horarios_conflictos(curso1, curso2):  # Evita comparaciones duplicadas
                return False  # Combinación inválida
    return True  # Combinación válida

# 5. Endpoint básico de verificación de estado
@app.route("/", methods=["GET"])
def home():
    return jsonify({"mensaje": "API de UniHorario funcionando correctamente"}), 200

# 6. Endpoint principal de procesamiento de horarios
@app.route("/procesar", methods=["POST"])
def procesar():
    # Obtiene y estructura los datos recibidos
    data = request.json
    cursos = data.get("cursos", [])
    
    # 7. Organiza los cursos por nombre para manejar múltiples secciones
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

    # 8. Generación de combinaciones de cursos
    combinaciones_validas = []
    # Itera sobre diferentes tamaños de combinaciones (desde 2 cursos hasta todos)
    for r in range(2, len(horarios) + 1):
        # Genera combinaciones de nombres de cursos
        for curso_comb in combinations(horarios.keys(), r):
            # Prepara las secciones disponibles para cada curso
            secciones = [(curso, list(horarios[curso])) for curso in curso_comb]
            # Genera todas las combinaciones posibles de secciones
            for combinacion in product(*(sec for _, sec in secciones)):
                if verificar_combinacion(combinacion):  # Verifica conflictos
                    # Formatea la respuesta
                    combinaciones_validas.append([
                        {
                            "curso": curso,
                            "seccion": c["sec"],
                            "dias": c["dias"],
                            "horas": c["horas"]
                        } for curso, c in zip(curso_comb, combinacion)
                    ])

    return jsonify(combinaciones_validas)  # Devuelve resultados en formato JSON

# 9. Inicio de la aplicación en modo debug
if __name__ == "__main__":
    app.run(debug=True)
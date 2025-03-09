let cursos = [];

document.addEventListener("DOMContentLoaded", function () {
    const cursoForm = document.getElementById("cursoForm");
    const generarBtn = document.getElementById("generarBtn");
    const cargarCursosBtn = document.getElementById("cargarCursosBtn");

    if (cursoForm && generarBtn && cargarCursosBtn) {
        // Agregar un curso manualmente
        cursoForm.addEventListener("submit", function (event) {
            event.preventDefault();
            agregarCursoManual();
        });

        // Generar combinaciones
        generarBtn.addEventListener("click", enviarDatos);

        // Cargar cursos automáticamente desde Firebase
        cargarCursosBtn.addEventListener("click", function () {
            const ciclo3 = document.getElementById("ciclo3").checked;
            const ciclo5 = document.getElementById("ciclo5").checked;

            if (!ciclo3 && !ciclo5) {
                alert("Por favor, selecciona al menos un ciclo.");
                return;
            }

            cargarCursosDesdeFirebase(ciclo3, ciclo5);
        });
    } else {
        console.error("No se encontraron los elementos del DOM.");
    }
});

function agregarCursoManual() {
    let nombre = document.getElementById("nombreCurso").value.trim();
    let seccion = document.getElementById("seccion").value.trim();
    let dias = document.getElementById("dias").value.split(",").map(d => d.trim().toUpperCase());
    let horas = document.getElementById("horas").value.split(",").map(h => h.split("-").map(Number));

    cursos.push({ nombre, seccion, dias, horas });

    let lista = document.getElementById("listaCursos");
    let nuevoCurso = document.createElement("li");

    // Agregar una casilla de verificación
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = true; // Por defecto, el curso está marcado
    checkbox.addEventListener("change", function () {
        // Actualizar el estado del curso (marcado o no)
        cursos.find(c => c.nombre === nombre && c.seccion === seccion).marcado = checkbox.checked;
    });

    nuevoCurso.appendChild(checkbox);
    nuevoCurso.appendChild(document.createTextNode(` ${nombre} - Sección ${seccion} - Días: ${dias.join(", ")} - Horas: ${horas.map(h => h.join("-")).join(", ")}`));
    lista.appendChild(nuevoCurso);

    document.getElementById("cursoForm").reset();
}

function cargarCursosDesdeFirebase(ciclo3, ciclo5) {
    // Limpiar la lista de cursos actual
    cursos = [];
    document.getElementById("listaCursos").innerHTML = "";

    // Cargar cursos de tercer ciclo si está seleccionado
    if (ciclo3) {
        fetch("https://unihorario-e8c19-default-rtdb.firebaseio.com/tercerCiclo.json")
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data) {
                    data.forEach(curso => {
                        curso.marcado = true; // Por defecto, el curso está marcado
                        cursos.push(curso);
                        agregarCursoALista(curso);
                    });
                }
            })
            .catch(error => {
                console.error("Error al cargar cursos de tercer ciclo:", error);
            });
    }

    // Cargar cursos de quinto ciclo si está seleccionado
    if (ciclo5) {
        fetch("https://unihorario-e8c19-default-rtdb.firebaseio.com/quintoCiclo.json")
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data) {
                    data.forEach(curso => {
                        curso.marcado = true; // Por defecto, el curso está marcado
                        cursos.push(curso);
                        agregarCursoALista(curso);
                    });
                }
            })
            .catch(error => {
                console.error("Error al cargar cursos de quinto ciclo:", error);
            });
    }

    alert("Cursos cargados automáticamente desde Firebase.");
}

function agregarCursoALista(curso) {
    let lista = document.getElementById("listaCursos");
    let nuevoCurso = document.createElement("li");

    // Agregar una casilla de verificación
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = curso.marcado; // Usar el estado del curso
    checkbox.addEventListener("change", function () {
        // Actualizar el estado del curso (marcado o no)
        curso.marcado = checkbox.checked;
    });

    nuevoCurso.appendChild(checkbox);
    nuevoCurso.appendChild(document.createTextNode(` ${curso.nombre} - Sección ${curso.seccion} - Días: ${curso.dias.join(", ")} - Horas: ${curso.horas.map(h => h.join("-")).join(", ")}`));
    lista.appendChild(nuevoCurso);
}

function enviarDatos() {
    // Filtrar solo los cursos marcados
    const cursosMarcados = cursos.filter(curso => curso.marcado);

    fetch("https://unihorario.onrender.com/procesar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cursos: cursosMarcados })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        let resultadoDiv = document.getElementById("resultado");
        resultadoDiv.innerHTML = "";

        data.forEach((combinacion, index) => {
            let combinacionTexto = document.createElement("div");
            combinacionTexto.innerHTML = `<strong>Combinación ${index + 1}:</strong><br>`;

            combinacion.forEach(curso => {
                combinacionTexto.innerHTML += `${curso.curso} - ${curso.seccion} - Días: ${curso.dias.join(", ")} - Horas: ${curso.horas.map(h => h.join("-")).join(", ")}<br>`;
            });

            combinacionTexto.innerHTML += "<br>";
            resultadoDiv.appendChild(combinacionTexto);
        });
    })
    .catch(error => console.error("Error:", error));
}
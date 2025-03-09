// 1. Inicialización de array para almacenar cursos
let cursos = []; // Almacena todos los cursos cargados (tanto manuales como automáticos)

// 2. Configuración inicial cuando el DOM está listo
document.addEventListener("DOMContentLoaded", function () {
    // Obtener referencias a elementos del formulario
    const cursoForm = document.getElementById("cursoForm");
    const generarBtn = document.getElementById("generarBtn");
    const cargarCursosBtn = document.getElementById("cargarCursosBtn");

    // Verificar que existan todos los elementos necesarios
    if (cursoForm && generarBtn && cargarCursosBtn) {
        // 3. Manejador para agregar cursos manualmente
        cursoForm.addEventListener("submit", function (event) {
            event.preventDefault(); // Evita el envío tradicional del formulario
            agregarCursoManual();
        });

        // 4. Manejador para generar combinaciones de horarios
        generarBtn.addEventListener("click", enviarDatos);

        // 5. Manejador para cargar cursos desde Firebase
        cargarCursosBtn.addEventListener("click", function () {
            // Obtener selección de ciclos
            const ciclo3 = document.getElementById("ciclo3").checked;
            const ciclo5 = document.getElementById("ciclo5").checked;

            // Validar selección de al menos un ciclo
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

// 6. Función para agregar cursos manualmente desde el formulario
function agregarCursoManual() {
    // Obtener y formatear datos del formulario
    let nombre = document.getElementById("nombreCurso").value.trim();
    let seccion = document.getElementById("seccion").value.trim();
    let dias = document.getElementById("dias").value.split(",").map(d => d.trim().toUpperCase());
    let horas = document.getElementById("horas").value.split(",").map(h => h.split("-").map(Number));

    // Agregar curso al array y actualizar la lista visual
    cursos.push({ nombre, seccion, dias, horas });
    actualizarListaCursos(nombre, seccion, dias, horas);
    document.getElementById("cursoForm").reset();
}

// 7. Función para cargar cursos desde Firebase
function cargarCursosDesdeFirebase(ciclo3, ciclo5) {
    // Reiniciar lista de cursos
    cursos = [];
    document.getElementById("listaCursos").innerHTML = "";

    // Cargar cursos según ciclos seleccionados
    if (ciclo3) cargarCiclo("tercerCiclo");
    if (ciclo5) cargarCiclo("quintoCiclo");
    
    alert("Cursos cargados automáticamente desde Firebase.");
}

// 8. Función auxiliar para cargar ciclos específicos
function cargarCiclo(ciclo) {
    fetch(`https://unihorario-e8c19-default-rtdb.firebaseio.com/${ciclo}.json`)
        .then(response => response.json())
        .then(data => {
            if (data) {
                data.forEach(curso => {
                    curso.marcado = true; // Marcar curso por defecto
                    cursos.push(curso);
                    agregarCursoALista(curso);
                });
            }
        })
        .catch(error => console.error(`Error en ${ciclo}:`, error));
}

// 9. Función para actualizar la lista visual de cursos
function agregarCursoALista(curso) {
    let lista = document.getElementById("listaCursos");
    let nuevoCurso = document.createElement("li");

    // Crear checkbox interactivo
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = curso.marcado;
    checkbox.addEventListener("change", () => curso.marcado = checkbox.checked);

    // Construir elemento de lista
    nuevoCurso.appendChild(checkbox);
    nuevoCurso.appendChild(document.createTextNode(
        ` ${curso.nombre} - Sección ${curso.seccion} - Días: ${curso.dias.join(", ")} - Horas: ${curso.horas.map(h => h.join("-")).join(", ")}`
    ));
    lista.appendChild(nuevoCurso);
}

// 10. Función para enviar datos al servidor y mostrar resultados
function enviarDatos() {
    // Filtrar solo cursos marcados
    const cursosMarcados = cursos.filter(curso => curso.marcado);

    // Enviar datos al endpoint de procesamiento
    fetch("https://unihorario.onrender.com/procesar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cursos: cursosMarcados })
    })
    .then(response => response.json())
    .then(data => {
        // Mostrar resultados de combinaciones
        let resultadoDiv = document.getElementById("resultado");
        resultadoDiv.innerHTML = "";
        
        data.forEach((combinacion, index) => {
            resultadoDiv.innerHTML += `
                <strong>Combinación ${index + 1}:</strong><br>
                ${combinacion.map(curso => 
                    `${curso.curso} - ${curso.seccion} - Días: ${curso.dias.join(", ")} - Horas: ${curso.horas.map(h => h.join("-")).join(", ")}`
                ).join("<br>")}<br><br>`;
        });
    })
    .catch(error => console.error("Error:", error));
}
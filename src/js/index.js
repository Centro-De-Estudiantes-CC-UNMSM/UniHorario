// Se declara un array vacío para almacenar los cursos ingresados por el usuario
let cursos = [];

// Se asegura de que el script se ejecute solo cuando el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", function () {
    // Se obtiene el formulario y se le añade un evento para manejar el envío de datos
    document.getElementById("cursoForm").addEventListener("submit", function (event) {
        event.preventDefault(); // Evita que la página se recargue al enviar el formulario

        // Se obtienen los valores ingresados en el formulario
        let nombre = document.getElementById("nombreCurso").value.trim(); // Nombre del curso
        let seccion = document.getElementById("seccion").value.trim(); // Número de sección

        // Se obtiene la lista de días, separándolos por comas y eliminando espacios en blanco
        let dias = document.getElementById("dias").value.split(",").map(d => d.trim().toUpperCase());

        // Se obtiene la lista de horarios, convirtiéndolos en arrays de números (hora inicio - hora fin)
        let horas = document.getElementById("horas").value.split(",").map(h => h.split("-").map(Number));

        // Se agrega el curso al array `cursos`
        cursos.push({ nombre, seccion, dias, horas });

        // Se actualiza la lista en la interfaz para mostrar el curso agregado
        let lista = document.getElementById("listaCursos");
        let nuevoCurso = document.createElement("li");
        nuevoCurso.textContent = `${nombre} - Sección ${seccion} - Días: ${dias.join(", ")} - Horas: ${horas.map(h => h.join("-")).join(", ")}`;
        lista.appendChild(nuevoCurso);

        // Se limpian los campos del formulario después de agregar el curso
        document.getElementById("cursoForm").reset();
    });

    // Se obtiene el botón de generar combinaciones y se le añade un evento de clic
    document.getElementById("generarBtn").addEventListener("click", enviarDatos);
});

// Función para enviar los datos al backend en Flask
function enviarDatos() {
    fetch("https://unihorario.onrender.com/procesar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cursos }) // Se convierten los cursos a formato JSON para enviarlos
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Se obtiene el contenedor donde se mostrarán los resultados
        let resultadoDiv = document.getElementById("resultado");
        resultadoDiv.innerHTML = ""; // Se limpia el contenido previo

        // Se recorre cada combinación generada y se muestra en el formato solicitado
        data.forEach((combinacion, index) => {
            let combinacionTexto = document.createElement("div");
            combinacionTexto.innerHTML = `<strong>Combinación ${index + 1}:</strong><br>`;

            combinacion.forEach(curso => {
                combinacionTexto.innerHTML += `${curso.curso} - ${curso.seccion} - Días: ${curso.dias.join(", ")} - Horas: ${curso.horas.map(h => h.join("-")).join(", ")}<br>`;
            });

            combinacionTexto.innerHTML += "<br>"; // Espaciado entre combinaciones
            resultadoDiv.appendChild(combinacionTexto);
        });
    })
    .catch(error => console.error("Error:", error)); // Se captura cualquier error en la solicitud
}

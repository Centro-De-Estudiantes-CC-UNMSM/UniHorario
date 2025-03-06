// Se declara un array vacío para almacenar los cursos ingresados por el usuario
let cursos = [];

// Se agrega un evento al formulario para manejar el envío de datos
document.getElementById("cursoForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Evita que la página se recargue al enviar el formulario

    // Se obtienen los valores ingresados en el formulario
    let nombre = document.getElementById("nombreCurso").value; // Nombre del curso
    let seccion = document.getElementById("seccion").value; // Número de sección

    // Se obtiene la lista de días, separándolos por comas y eliminando espacios en blanco
    let dias = document.getElementById("dias").value.split(",").map(d => d.trim());

    // Se obtiene la lista de horarios, convirtiéndolos en arrays de números (hora inicio - hora fin)
    let horas = document.getElementById("horas").value.split(",").map(h => h.split("-").map(Number));

    // Se agrega el curso al array `cursos`
    cursos.push({ nombre, seccion, dias, horas });

    // Se actualiza la lista en la interfaz para mostrar el curso agregado
    let lista = document.getElementById("listaCursos");
    lista.innerHTML += `<li>${nombre} - Sección ${seccion} - Días: ${dias.join(", ")} - Horas: ${horas.map(h => h.join("-")).join(", ")}</li>`;
});

// Función para enviar los datos al backend en Python (Flask)
function enviarDatos() {
    fetch("https://unihorario.onrender.com", { // Se envía una solicitud a la API local en Flask
        method: "POST", // Se usa el método POST para enviar datos
        headers: { "Content-Type": "application/json" }, // Se especifica el tipo de contenido JSON
        body: JSON.stringify({ cursos }) // Se convierten los cursos a formato JSON para enviarlos
    })
    .then(response => response.json()) // Se convierte la respuesta en JSON
    .then(data => {
        // Se muestra el resultado en la interfaz
        document.getElementById("resultado").innerText = JSON.stringify(data, null, 2);
    })
    .catch(error => console.error("Error:", error)); // Se captura cualquier error en la solicitud
}
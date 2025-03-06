document.addEventListener("DOMContentLoaded", function () {
    let cursos = [];

    document.getElementById("cursoForm").addEventListener("submit", function(event) {
        event.preventDefault();

        let nombre = document.getElementById("nombreCurso").value;
        let seccion = document.getElementById("seccion").value;
        let dias = document.getElementById("dias").value.split(",").map(d => d.trim());
        let horas = document.getElementById("horas").value.split(",").map(h => h.split("-").map(Number));

        cursos.push({ nombre, seccion, dias, horas });

        let lista = document.getElementById("listaCursos");
        lista.innerHTML += `<li>${nombre} - Sección ${seccion} - Días: ${dias.join(", ")} - Horas: ${horas.map(h => h.join("-")).join(", ")}</li>`;
    });

    function enviarDatos() {
        fetch("https://unihorario.onrender.com/procesar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            mode: "cors", // Permite solicitudes CORS
            body: JSON.stringify({ cursos })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            document.getElementById("resultado").innerText = JSON.stringify(data, null, 2);
        })
        .catch(error => {
            console.error("Error:", error);
            document.getElementById("resultado").innerText = "Error al obtener combinaciones. Ver consola.";
        });
    }

    document.getElementById("generar").addEventListener("click", enviarDatos);
});

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const generarButton = document.getElementById('generarButton');
    const tablaNombres = document.getElementById('tablaNombres').getElementsByTagName('tbody')[0];
    const listaGrupos = document.getElementById('listaGrupos');

    let data = [];

    const genderDatabase = {
        "Ana": "F", "Maria": "F", "Sofia": "F", "Luisa": "F", "Isabela": "F",
        "Juan": "M", "Pedro": "M", "Carlos": "M", "Diego": "M", "Mateo": "M"
    };

    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];

        if (!file) {
            alert('Por favor, selecciona un archivo.');
            return;
        }

        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > 30) {
            alert('El archivo excede el límite de 30MB.');
            return;
        }

        const fileType = file.name.split('.').pop().toLowerCase();
        if (!['csv'].includes(fileType)) {
            alert('Solo se permiten archivos CSV.');
            return;
        }

        const reader = new FileReader();

        reader.onload = (event) => {
            const content = event.target.result;

            Papa.parse(content, {
                header: true,
                skipEmptyLines: true,
                complete: function(results) {
                    data = results.data;

                    data.forEach(item => {
                        const nombreCompleto = item.ApellidosNombres ? item.ApellidosNombres.trim() : "";
                        const generoCSV = item.Genero ? item.Genero.trim().toUpperCase() : "";

                        if (!generoCSV) {
                            let primerNombre = nombreCompleto.split(" ")[0];
                            if (primerNombre) {
                                item.Genero = genderDatabase[primerNombre] || "Desconocido";
                            } else {
                                item.Genero = "Desconocido";
                            }
                        } else {
                            item.Genero = generoCSV;
                        }

                        item.ApellidosNombres = nombreCompleto;
                    });

                    if (!data[0] || !data[0].ApellidosNombres || !data[0].Genero) {
                        alert('El archivo CSV debe contener columnas llamadas "ApellidosNombres" y "Genero".');
                        data = [];
                        return;
                    }

                    mostrarLista(data);
                    generarButton.disabled = false;
                },
                error: function(error) {
                    console.error("Error al parsear el CSV:", error);
                    alert('Error al parsear el archivo CSV. Verifica el formato.');
                }
            });
        };

        reader.onerror = () => {
            alert('Error al leer el archivo.');
        };

        reader.readAsText(file);
    });

    generarButton.addEventListener('click', () => {
        const grupos = generarGrupos(data);
        mostrarGrupos(grupos);
    });

    function mostrarLista(data) {
        tablaNombres.innerHTML = '';
        data.forEach(item => {
            const row = tablaNombres.insertRow();
            const nombreCell = row.insertCell();
            const sexoCell = row.insertCell();

            nombreCell.textContent = item.ApellidosNombres;
            sexoCell.textContent = item.Genero;
        });
    }

    function generarGrupos(data) {
        const mujeres = data.filter(p => p.Genero && p.Genero.toUpperCase() === 'F');
        const hombres = data.filter(p => p.Genero && p.Genero.toUpperCase() === 'M');

        const shuffle = arr => arr.sort(() => Math.random() - 0.5);
        shuffle(mujeres);
        shuffle(hombres);

        const totalPersonas = mujeres.length + hombres.length;
        const cantidadGrupos = Math.ceil(totalPersonas / 3);
        let grupos = Array.from({ length: cantidadGrupos }, () => []);

        // Asignar una mujer por grupo si hay
        for (let i = 0; i < grupos.length && mujeres.length > 0; i++) {
            grupos[i].push(mujeres.shift());
        }

        // Mezclar y agregar el resto (mujeres restantes + hombres)
        const restantes = shuffle([...mujeres, ...hombres]);
        let grupoIndex = 0;

        restantes.forEach(persona => {
            while (grupos[grupoIndex].length >= 3) {
                grupoIndex = (grupoIndex + 1) % grupos.length;
            }
            grupos[grupoIndex].push(persona);
            grupoIndex = (grupoIndex + 1) % grupos.length;
        });

        return grupos;
    }

    function mostrarGrupos(grupos) {
        listaGrupos.innerHTML = '';

        grupos.forEach((grupo, index) => {
            const grupoContainer = document.createElement('div');
            grupoContainer.classList.add('grupo-container');

            const grupoTitulo = document.createElement('div');
            grupoTitulo.classList.add('grupo-titulo');
            grupoTitulo.textContent = `Grupo ${index + 1}`;
            grupoContainer.appendChild(grupoTitulo);

            grupo.forEach(persona => {
                const personaElement = document.createElement('span');
                personaElement.textContent = persona.ApellidosNombres;
                personaElement.classList.add('grupo-persona');

                if (persona.Genero === 'F') {
                    personaElement.classList.add('mujer');
                } else if (persona.Genero === 'M') {
                    personaElement.classList.add('hombre');
                }

                grupoContainer.appendChild(personaElement);
            });

            listaGrupos.appendChild(grupoContainer);
        });
    }

    document.getElementById('fileInputLabel').addEventListener('click', function(event) {
        fileInput.click();
        event.stopPropagation();
    });
});

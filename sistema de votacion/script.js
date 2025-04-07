document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const setupModeDiv = document.getElementById('setup-mode');
    const votingModeDiv = document.getElementById('voting-mode');
    const postVoteMenuDiv = document.getElementById('post-vote-menu');
    const resultsSectionDiv = document.getElementById('results-section');
    const modalDiv = document.getElementById('proposal-modal');

    // Configuración
    const schoolNameInput = document.getElementById('school-name');
    const candidateForm = document.getElementById('candidate-form');
    const candidateNameInput = document.getElementById('candidate-name');
    const candidateGradeInput = document.getElementById('candidate-grade');
    const candidatePhotoInput = document.getElementById('candidate-photo');
    const photoPreview = document.getElementById('photo-preview');
    const candidateProposalsInput = document.getElementById('candidate-proposals');
    const candidateCountSpan = document.getElementById('candidate-count');
    const registeredCandidatesListDiv = document.getElementById('registered-candidates-list'); // Contenedor para vista previa
    const noCandidatesMessageP = document.getElementById('no-candidates-message'); // Mensaje "sin candidatos"

    // Votación
    const startVotingBtn = document.getElementById('start-voting-btn');
    const votingSchoolNameH1 = document.getElementById('voting-school-name');
    const candidateListDiv = document.getElementById('candidate-list');

    // Post-Voto
    const voteAgainBtn = document.getElementById('vote-again-btn');
    const finishVotingBtn = document.getElementById('finish-voting-btn');

    // Resultados
    const resultsSchoolNameH2 = document.getElementById('results-school-name');
    const resultsListUl = document.getElementById('results-list');
    const resetSystemBtn = document.getElementById('reset-system-btn');

    // Modal Propuestas
    const modalCloseBtn = document.querySelector('.close-btn');
    const modalCandidateNameH3 = document.getElementById('modal-candidate-name');
    const modalProposalsListUl = document.getElementById('modal-proposals-list');

    // Estado de la aplicación
    let schoolName = '';
    let candidates = [];
    let nextCandidateId = 0;
    let currentVoterHasVoted = false;

    // --- Funciones ---

    // Limpia el formulario de candidato
    function clearCandidateForm() {
        candidateForm.reset(); // Forma más robusta de limpiar el form
        photoPreview.src = '#';
        photoPreview.classList.add('hidden'); // Oculta la vista previa
    }

    // Muestra la vista previa de la foto en el formulario
    candidatePhotoInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                photoPreview.src = e.target.result;
                photoPreview.classList.remove('hidden'); // Muestra la vista previa
            }
            reader.readAsDataURL(file);
        } else {
             photoPreview.src = '#';
             photoPreview.classList.add('hidden');
        }
    });

    // **NUEVO:** Muestra una tarjeta de vista previa del candidato registrado
    function displayRegisteredCandidate(candidate) {
        // Oculta el mensaje "sin candidatos" si es el primero
        if (candidates.length === 1) {
            noCandidatesMessageP.classList.add('hidden');
        }

        const itemDiv = document.createElement('div');
        itemDiv.classList.add('registered-candidate-item');
        itemDiv.innerHTML = `
            <img src="${candidate.photoUrl}" alt="Foto de ${candidate.name}" class="registered-candidate-photo-small">
            <div class="registered-candidate-details">
                <span class="registered-candidate-name">${candidate.name}</span>
                <span class="registered-candidate-grade">${candidate.grade}</span>
            </div>
        `;
        registeredCandidatesListDiv.appendChild(itemDiv);
    }

    // Maneja el envío del formulario de candidato
    candidateForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const name = candidateNameInput.value.trim();
        const grade = candidateGradeInput.value.trim();
        const photoFile = candidatePhotoInput.files[0];
        const proposals = candidateProposalsInput.value.trim();

        if (name && grade && photoFile && proposals) {
            const reader = new FileReader();

            reader.onload = function(e) {
                const photoUrl = e.target.result;

                const newCandidate = {
                    id: nextCandidateId++,
                    name: name,
                    grade: grade,
                    photoUrl: photoUrl,
                    proposals: proposals,
                    votes: 0
                };

                candidates.push(newCandidate);
                candidateCountSpan.textContent = candidates.length;
                displayRegisteredCandidate(newCandidate); // **LLAMADA A LA NUEVA FUNCIÓN**
                alert(`Candidato "${name}" agregado exitosamente.`);
                clearCandidateForm();
            }

            reader.onerror = function(e) {
                alert("Error al leer la imagen.");
                console.error("FileReader error:", e);
            }

            reader.readAsDataURL(photoFile);

        } else {
            alert('Por favor completa todos los campos del candidato, incluyendo la foto.');
        }
    });

    // Inicia el modo votación
    startVotingBtn.addEventListener('click', () => {
        schoolName = schoolNameInput.value.trim();
        if (!schoolName) {
            alert('Por favor ingresa el nombre de la institución educativa.');
            schoolNameInput.focus(); // Pone el foco en el campo faltante
            return;
        }
        if (candidates.length === 0) { // Permitir votar incluso con 1 candidato (voto en blanco implícito) o mostrar advertencia más clara
             alert('Debes registrar al menos un candidato para iniciar la votación.');
             return;
        }
         if (candidates.length < 2) {
            if (!confirm(`Solo has registrado ${candidates.length} candidato(s). ¿Deseas continuar con la votación así?`)) {
                return;
            }
         }


        setupModeDiv.classList.add('hidden');
        votingSchoolNameH1.textContent = schoolName;
        displayCandidatesForVoting();
        votingModeDiv.classList.remove('hidden');
        postVoteMenuDiv.classList.add('hidden');
        resultsSectionDiv.classList.add('hidden');
    });

    // Muestra los candidatos en la interfaz de votación
    function displayCandidatesForVoting() {
        candidateListDiv.innerHTML = '';

        candidates.forEach(candidate => {
            const card = document.createElement('div');
            card.classList.add('candidate-card');
            card.innerHTML = `
                <img src="${candidate.photoUrl}" alt="Foto de ${candidate.name}" class="candidate-photo">
                <h3>${candidate.name}</h3>
                <p>${candidate.grade}</p>
                <button class="proposals-toggle" data-id="${candidate.id}">Ver Propuestas</button>
                <button class="btn vote-btn" data-id="${candidate.id}">
                   <!-- <i class="fas fa-check-to-slot"></i> --> Votar
                </button>
            `;
            candidateListDiv.appendChild(card);
        });
        // Opcional: Añadir opción de Voto en Blanco si se desea explícitamente
        /*
        const blankVoteCard = document.createElement('div');
        blankVoteCard.classList.add('candidate-card', 'blank-vote-card'); // Clase específica
        blankVoteCard.innerHTML = `
             <div class="blank-vote-icon">📄</div> // Icono o texto
             <h3>Voto en Blanco</h3>
             <p>Opción sin candidato</p>
             <button class="btn vote-btn" data-id="-1">Votar en Blanco</button> // ID especial
        `;
        candidateListDiv.appendChild(blankVoteCard);
        */
    }

    // Manejo de clics en Votación (delegación de eventos)
    candidateListDiv.addEventListener('click', (event) => {
        const target = event.target;

        if (target.classList.contains('proposals-toggle')) {
            const candidateId = parseInt(target.getAttribute('data-id'));
            showProposalsModal(candidateId);
        }

        if (target.classList.contains('vote-btn')) {
            if (currentVoterHasVoted) {
                alert('Ya has registrado tu voto en esta sesión.');
                return;
            }
            const candidateId = parseInt(target.getAttribute('data-id'));
            // Manejar voto en blanco si se implementó
            // if (candidateId === -1) { registerBlankVote(); } else ...
            registerVote(candidateId);
        }
    });

    // Muestra el modal con las propuestas
    function showProposalsModal(candidateId) {
        const candidate = candidates.find(c => c.id === candidateId);
        if (!candidate) return;

        modalCandidateNameH3.textContent = candidate.name;
        const proposalsHtml = candidate.proposals
            .split('\n')
            .filter(line => line.trim() !== '')
            .map(proposal => `<li>${proposal.trim()}</li>`)
            .join('');
        modalProposalsListUl.innerHTML = proposalsHtml;

        modalDiv.classList.remove('hidden');
    }

    // Cierra el modal
    modalCloseBtn.addEventListener('click', () => {
        modalDiv.classList.add('hidden');
    });
    modalDiv.addEventListener('click', (event) => {
        if (event.target === modalDiv) {
            modalDiv.classList.add('hidden');
        }
    });


    // Registra un voto para un candidato
    function registerVote(candidateId) {
        const candidate = candidates.find(c => c.id === candidateId);
        if (candidate) {
            candidate.votes++;
            currentVoterHasVoted = true;
            // alert(`Voto registrado para ${candidate.name}. ¡Gracias!`); // Alerta reemplazada por pantalla post-voto

            votingModeDiv.classList.add('hidden');
            postVoteMenuDiv.classList.remove('hidden'); // Mostrar pantalla de agradecimiento
        } else {
            console.error("Error: Candidato no encontrado para votar ID:", candidateId);
            alert("Error al registrar el voto. Inténtalo de nuevo.");
        }
    }

    // Permite que otra persona vote
    voteAgainBtn.addEventListener('click', () => {
        currentVoterHasVoted = false;
        postVoteMenuDiv.classList.add('hidden');
        votingModeDiv.classList.remove('hidden');
    });

    // Finaliza la votación y muestra los resultados
    finishVotingBtn.addEventListener('click', () => {
        postVoteMenuDiv.classList.add('hidden');
        displayResults();
        resultsSectionDiv.classList.remove('hidden');
    });

    // Muestra los resultados finales
    function displayResults() {
        resultsSchoolNameH2.textContent = `Resultados para: ${schoolName}`;
        resultsListUl.innerHTML = '';

        const sortedCandidates = [...candidates].sort((a, b) => b.votes - a.votes);

        if (sortedCandidates.length === 0) {
             resultsListUl.innerHTML = '<li>No se registraron votos.</li>';
             return;
        }

        sortedCandidates.forEach(candidate => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <div>
                    <span class="result-candidate-name">${candidate.name}</span>
                    <span class="result-candidate-grade">(${candidate.grade})</span>
                </div>
                <span class="votes">${candidate.votes} Voto(s)</span>
            `;
            resultsListUl.appendChild(listItem);
        });
    }

    // Reinicia todo el sistema
    resetSystemBtn.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que deseas reiniciar todo el sistema? Se perderán todos los datos actuales (institución, candidatos y votos).')) {
            schoolName = '';
            candidates = [];
            nextCandidateId = 0;
            currentVoterHasVoted = false;

            schoolNameInput.value = '';
            candidateCountSpan.textContent = '0';
            clearCandidateForm(); // Limpia formulario
            registeredCandidatesListDiv.innerHTML = ''; // Limpia lista de vista previa
            noCandidatesMessageP.classList.remove('hidden'); // Muestra mensaje "sin candidatos"
            resultsListUl.innerHTML = ''; // Limpia resultados previos

            votingModeDiv.classList.add('hidden');
            postVoteMenuDiv.classList.add('hidden');
            resultsSectionDiv.classList.add('hidden');
            modalDiv.classList.add('hidden');
            setupModeDiv.classList.remove('hidden');
        }
    });

    // Estado inicial
    photoPreview.classList.add('hidden'); // Asegurarse que la vista previa de foto esté oculta al inicio
    if (candidates.length === 0) { // Mostrar mensaje si no hay candidatos al cargar
        noCandidatesMessageP.classList.remove('hidden');
    }
});
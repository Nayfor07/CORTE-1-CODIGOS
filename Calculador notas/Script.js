document.addEventListener('DOMContentLoaded', function() {
    const notaCorte1Input = document.getElementById('notaCorte1');
    const notaCorte2Input = document.getElementById('notaCorte2');
    const calcularBtn = document.getElementById('calcularBtn');
    const resultadoDiv = document.getElementById('resultado');

    // --- Constantes ---
    const PESO_CORTE1 = 0.30;
    const PESO_CORTE2 = 0.30;
    const PESO_EXAMEN_FINAL = 0.40;
    const NOTA_OBJETIVO = 3.0;
    const NOTA_MAXIMA = 5.0;
    const NOTA_MINIMA = 0.0;

    // --- Función para mostrar resultados con estilo ---
    function mostrarResultado(mensaje, tipo = 'info') {
        resultadoDiv.textContent = mensaje;
        // Quitar clases anteriores y añadir la nueva clase de tipo
        resultadoDiv.className = 'resultado-placeholder resultado ' + tipo;
    }

    calcularBtn.addEventListener('click', function() {
        // Limpiar resultado anterior al calcular de nuevo
        resultadoDiv.className = 'resultado-placeholder'; // Vuelve al estado base
        resultadoDiv.textContent = ''; // Limpia el texto

        const notaCorte1Str = notaCorte1Input.value;
        const notaCorte2Str = notaCorte2Input.value;

        // Validar que los campos no estén vacíos primero
        if (notaCorte1Str.trim() === '' || notaCorte2Str.trim() === '') {
            mostrarResultado('Por favor, ingrese ambas notas.', 'error');
            return;
        }

        const notaCorte1 = parseFloat(notaCorte1Str);
        const notaCorte2 = parseFloat(notaCorte2Str);

        // Validar que sean números y estén en el rango
        if (isNaN(notaCorte1) || isNaN(notaCorte2) ||
            notaCorte1 < NOTA_MINIMA || notaCorte1 > NOTA_MAXIMA ||
            notaCorte2 < NOTA_MINIMA || notaCorte2 > NOTA_MAXIMA) {
            mostrarResultado(`Por favor, ingrese notas válidas entre ${NOTA_MINIMA.toFixed(1)} y ${NOTA_MAXIMA.toFixed(1)}.`, 'error');
            return;
        }

        const notaAcumuladaCortes = (notaCorte1 * PESO_CORTE1) + (notaCorte2 * PESO_CORTE2);

        // Verificar si ya se alcanzó el objetivo
        if (notaAcumuladaCortes >= NOTA_OBJETIVO) {
            mostrarResultado(`¡Felicidades! Con ${notaAcumuladaCortes.toFixed(2)} acumulado, ya alcanzas o superas el ${NOTA_OBJETIVO.toFixed(1)}. Necesitas ${NOTA_MINIMA.toFixed(1)} en el último corte.`, 'success');
            return;
        }

        const notaNecesariaExamen = (NOTA_OBJETIVO - notaAcumuladaCortes) / PESO_EXAMEN_FINAL;

        // Verificar si es imposible alcanzar el objetivo
        if (notaNecesariaExamen > NOTA_MAXIMA) {
            // Calcular cuánto se puede alcanzar como máximo
            const maxNotaPosible = notaAcumuladaCortes + (NOTA_MAXIMA * PESO_EXAMEN_FINAL);
            mostrarResultado(`Incluso sacando ${NOTA_MAXIMA.toFixed(1)} en el último corte, solo alcanzarías ${maxNotaPosible.toFixed(2)}. Es imposible llegar a ${NOTA_OBJETIVO.toFixed(1)}.`, 'warning');
            return;
        }

         // Verificar si se necesita menos de la nota mínima (ya se pasó)
         // (Aunque el chequeo anterior >= NOTA_OBJETIVO ya cubre esto, lo dejamos por claridad si se ajustara NOTA_OBJETIVO)
         if (notaNecesariaExamen <= NOTA_MINIMA) {
             mostrarResultado(`Necesitas sacar ${NOTA_MINIMA.toFixed(1)} en el último corte para obtener ${NOTA_OBJETIVO.toFixed(1)} final.`, 'info');
             return; // O podría ser 'success' si consideramos que requerir 0 es bueno
         }


        // Mostrar la nota necesaria
        mostrarResultado(`Necesitas sacar ${notaNecesariaExamen.toFixed(2)} en el último corte (40%) para obtener un ${NOTA_OBJETIVO.toFixed(1)} final.`, 'info');
    });

     // Opcional: Limpiar resultado si se edita una nota
     notaCorte1Input.addEventListener('input', () => {
         resultadoDiv.className = 'resultado-placeholder';
         resultadoDiv.textContent = '';
     });
     notaCorte2Input.addEventListener('input', () => {
         resultadoDiv.className = 'resultado-placeholder';
         resultadoDiv.textContent = '';
     });

});
let nivelSeleccionado;
let palabrasSeleccionadas;
let tamano;
let sopa;
let palabrasColocadas = [];
let palabrasEncontradas = [];
let timer;
let tiempoRestante;

// Variables para la selección de letras
let seleccionando = false;
let celdasSeleccionadas = [];
let historialSeleccion = [];

// Iniciar el juego
function iniciarJuego() {
    document.getElementById('inicio').style.display = 'none';
    document.getElementById('juego').style.display = 'block';
    nivelSeleccionado = parseInt(document.getElementById('nivel').value);

    configurarNivel();
    generarSopaDeLetras();
    mostrarLista();

    if (nivelSeleccionado === 2) {
        iniciarTemporizador(15 * 60); // 15 minutos
    } else if (nivelSeleccionado === 4) {
        iniciarTemporizador(20 * 60); // 20 minutos
    }
}

// Configurar el nivel seleccionado
function configurarNivel() {
    if (nivelSeleccionado === 1 || nivelSeleccionado === 2) {
        palabrasSeleccionadas = seleccionarPalabras(18);
    } else if (nivelSeleccionado === 3 || nivelSeleccionado === 4) {
        palabrasSeleccionadas = seleccionarPalabras(27);
    }
    ajustarTamanoCuadricula();
}

// Seleccionar palabras aleatorias
function seleccionarPalabras(cantidad) {
    let copiaPalabras = [...palabrasYpistas];
    mezclarArray(copiaPalabras);
    return copiaPalabras.slice(0, cantidad);
}

// Ajustar el tamaño de la cuadrícula
function ajustarTamanoCuadricula() {
    let longitudMaxima = Math.max(...palabrasSeleccionadas.map(p => p.palabra.length));
    tamano = Math.max(longitudMaxima + 5, Math.ceil(Math.sqrt(palabrasSeleccionadas.length * 15)));
    tamano = Math.max(tamano, 15);
}

// Generar la sopa de letras
function generarSopaDeLetras() {
    sopa = [];
    for (let i = 0; i < tamano; i++) {
        sopa[i] = [];
        for (let j = 0; j < tamano; j++) {
            sopa[i][j] = '';
        }
    }
    palabrasColocadas = [];
    palabrasEncontradas = [];

    for (let palabraObj of palabrasSeleccionadas) {
        if (!colocarPalabraEnSopa(palabraObj)) {
            console.log(`No se pudo colocar la palabra: ${palabraObj.palabra}`);
        }
    }

    rellenarEspaciosVacios();
    dibujarSopaDeLetras();
}

// Colocar una palabra en la sopa de letras
function colocarPalabraEnSopa(palabraObj) {
    let palabra = palabraObj.palabra.toUpperCase().replace(/\s+/g, '');
    let direcciones = ['H', 'V', 'D', 'I', 'ID', 'DI', 'IH', 'HI']; // Direcciones adicionales
    mezclarArray(direcciones);

    for (let direccion of direcciones) {
        let maxIntentos = 100;
        let intentos = 0;
        while (intentos < maxIntentos) {
            let fila = getRandomInt(0, tamano - 1);
            let columna = getRandomInt(0, tamano - 1);
            if (colocarSiCabe(palabra, fila, columna, direccion, palabraObj)) {
                return true;
            }
            intentos++;
        }
    }
    return false;
}

// Verificar si una palabra cabe en una posición determinada
function colocarSiCabe(palabra, fila, columna, direccion, palabraObj) {
    let deltaFila = 0;
    let deltaColumna = 0;

    switch (direccion) {
        case 'H':
            deltaColumna = 1;
            break;
        case 'V':
            deltaFila = 1;
            break;
        case 'D':
            deltaFila = 1;
            deltaColumna = 1;
            break;
        case 'I':
            deltaFila = -1;
            deltaColumna = 1;
            break;
        case 'ID':
            deltaFila = -1;
            deltaColumna = -1;
            break;
        case 'DI':
            deltaFila = 1;
            deltaColumna = -1;
            break;
        case 'IH':
            deltaColumna = -1;
            break;
        case 'HI':
            deltaFila = -1;
            break;
    }

    let finFila = fila + deltaFila * (palabra.length - 1);
    let finColumna = columna + deltaColumna * (palabra.length - 1);

    if (finFila < 0 || finFila >= tamano || finColumna < 0 || finColumna >= tamano) {
        return false;
    }

    for (let i = 0; i < palabra.length; i++) {
        let f = fila + deltaFila * i;
        let c = columna + deltaColumna * i;
        if (sopa[f][c] !== '' && sopa[f][c] !== palabra[i]) {
            return false;
        }
    }

    for (let i = 0; i < palabra.length; i++) {
        let f = fila + deltaFila * i;
        let c = columna + deltaColumna * i;
        sopa[f][c] = palabra[i];
    }

    palabraObj.posiciones = [];
    for (let i = 0; i < palabra.length; i++) {
        let f = fila + deltaFila * i;
        let c = columna + deltaColumna * i;
        palabraObj.posiciones.push({ fila: f, columna: c });
    }
    palabrasColocadas.push(palabraObj);
    return true;
}

// Rellenar los espacios vacíos con letras aleatorias
function rellenarEspaciosVacios() {
    const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÑ';
    for (let i = 0; i < tamano; i++) {
        for (let j = 0; j < tamano; j++) {
            if (sopa[i][j] === '') {
                sopa[i][j] = letras.charAt(Math.floor(Math.random() * letras.length));
            }
        }
    }
}

// Dibujar la sopa de letras en el HTML
function dibujarSopaDeLetras() {
    let sopaDiv = document.getElementById('sopaDeLetras');
    sopaDiv.innerHTML = '';
    for (let i = 0; i < tamano; i++) {
        let filaDiv = document.createElement('div');
        filaDiv.style.display = 'flex';
        for (let j = 0; j < tamano; j++) {
            let celdaDiv = document.createElement('div');
            celdaDiv.classList.add('celda');
            celdaDiv.setAttribute('data-fila', i);
            celdaDiv.setAttribute('data-columna', j);
            celdaDiv.innerText = sopa[i][j];
            // Añadir eventos de ratón
            celdaDiv.addEventListener('mousedown', iniciarSeleccion);
            celdaDiv.addEventListener('mouseenter', continuarSeleccion);
            celdaDiv.addEventListener('mouseup', finalizarSeleccion);
            celdaDiv.addEventListener('click', seleccionarLetraIndividual);
            filaDiv.appendChild(celdaDiv);
        }
        sopaDiv.appendChild(filaDiv);
    }
    // Prevenir comportamiento por defecto del texto seleccionado
    sopaDiv.addEventListener('mousedown', e => e.preventDefault());
}

// Mostrar la lista de palabras o pistas según el nivel
function mostrarLista() {
    let listaDiv = document.getElementById('listaPalabras');
    listaDiv.innerHTML = '';

    if (nivelSeleccionado === 1 || nivelSeleccionado === 2) {
        // Mostrar palabras a buscar
        let titulo = document.createElement('h2');
        titulo.innerText = 'Palabras a Buscar';
        listaDiv.appendChild(titulo);

        let lista = document.createElement('ul');
        lista.id = 'palabrasList';
        for (let palabra of palabrasSeleccionadas) {
            let item = document.createElement('li');
            item.classList.add('palabra');
            item.innerText = palabra.palabra.toUpperCase();
            lista.appendChild(item);
        }
        listaDiv.appendChild(lista);
    } else if (nivelSeleccionado === 3 || nivelSeleccionado === 4) {
        // Mostrar pistas
        let pistasDiv = document.getElementById('pistas');
        pistasDiv.style.display = 'block';
        pistasDiv.innerHTML = '<h2>Pistas</h2>';

        let listaPistas = document.createElement('ul');
        listaPistas.id = 'pistasList';
        let numero = 1;
        for (let palabra of palabrasSeleccionadas) {
            let item = document.createElement('li');
            item.classList.add('pista');
            item.setAttribute('data-palabra', palabra.palabra.toUpperCase().replace(/\s+/g, ''));
            item.innerHTML = `<strong>${numero}.</strong> ${palabra.pista}`;
            listaPistas.appendChild(item);
            numero++;
        }
        pistasDiv.appendChild(listaPistas);
    }
}

// Eventos de selección de celdas
function iniciarSeleccion(event) {
    seleccionando = true;
    celdasSeleccionadas = [];
    seleccionarCelda(event.target);
}

function continuarSeleccion(event) {
    if (seleccionando) {
        seleccionarCelda(event.target);
    }
}

function finalizarSeleccion(event) {
    seleccionando = false;
}

// Seleccionar una celda
function seleccionarCelda(celda) {
    let fila = parseInt(celda.getAttribute('data-fila'));
    let columna = parseInt(celda.getAttribute('data-columna'));

    // Evitar seleccionar la misma celda varias veces
    if (!celdasSeleccionadas.find(c => c.fila === fila && c.columna === columna)) {
        celdasSeleccionadas.push({ fila, columna, celda });
        celda.classList.add('celdaSeleccionada');
    }
}

// Seleccionar letra individualmente
function seleccionarLetraIndividual(event) {
    if (!seleccionando) {
        seleccionarCelda(event.target);
    }
}

// Verificar la selección actual
function verificarSeleccion() {
    if (celdasSeleccionadas.length < 2) {
        limpiarSeleccion();
        return;
    }

    let palabraFormada = celdasSeleccionadas.map(c => sopa[c.fila][c.columna]).join('');
    let palabraFormadaInvertida = celdasSeleccionadas.map(c => sopa[c.fila][c.columna]).reverse().join('');

    // Buscar si la palabra está en la lista de palabras seleccionadas
    let palabraEncontrada = palabrasColocadas.find(p => {
        let palabra = p.palabra.replace(/\s+/g, '').toUpperCase();
        return (palabra === palabraFormada || palabra === palabraFormadaInvertida) && !palabrasEncontradas.includes(p.palabra);
    });

    if (palabraEncontrada) {
        // Marcar las celdas como encontradas
        celdasSeleccionadas.forEach(c => {
            c.celda.classList.remove('celdaSeleccionada');
            c.celda.classList.add('celdaEncontrada');
        });

        // Añadir a la lista de palabras encontradas
        palabrasEncontradas.push(palabraEncontrada.palabra);

        // Guardar en el historial de selección
        historialSeleccion.push([...celdasSeleccionadas]);

        // Resaltar la palabra en la lista o en las pistas
        if (nivelSeleccionado === 1 || nivelSeleccionado === 2) {
            let palabraItems = document.querySelectorAll('#palabrasList li');
            palabraItems.forEach(item => {
                if (item.innerText === palabraEncontrada.palabra.toUpperCase()) {
                    item.classList.add('palabraEncontrada');
                }
            });
        } else if (nivelSeleccionado === 3 || nivelSeleccionado === 4) {
            resaltarPista(palabraEncontrada.palabra);
        }

        // Verificar si todas las palabras han sido encontradas
        verificarRespuestas();
    }

    limpiarSeleccion();
}

// Limpiar la selección actual
function limpiarSeleccion() {
    celdasSeleccionadas.forEach(c => c.celda.classList.remove('celdaSeleccionada'));
    celdasSeleccionadas = [];
}

// Deshacer la última selección
function deshacerSeleccion() {
    if (historialSeleccion.length > 0) {
        let ultimaSeleccion = historialSeleccion.pop();
        ultimaSeleccion.forEach(c => {
            c.celda.classList.remove('celdaEncontrada');
        });
        let palabraEliminada = ultimaSeleccion.map(c => sopa[c.fila][c.columna]).join('');
        let index = palabrasEncontradas.indexOf(palabraEliminada);
        if (index !== -1) {
            palabrasEncontradas.splice(index, 1);
        } else {
            // Intentar con la palabra invertida
            palabraEliminada = ultimaSeleccion.map(c => sopa[c.fila][c.columna]).reverse().join('');
            index = palabrasEncontradas.indexOf(palabraEliminada);
            if (index !== -1) {
                palabrasEncontradas.splice(index, 1);
            }
        }

        // Actualizar la lista o pistas
        if (nivelSeleccionado === 1 || nivelSeleccionado === 2) {
            let palabraItems = document.querySelectorAll('#palabrasList li');
            palabraItems.forEach(item => {
                if (item.innerText === palabraEliminada) {
                    item.classList.remove('palabraEncontrada');
                }
            });
        } else if (nivelSeleccionado === 3 || nivelSeleccionado === 4) {
            let palabraSinEspacios = palabraEliminada.replace(/\s+/g, '');
            let pistaDiv = document.querySelector(`.pista[data-palabra="${palabraSinEspacios}"]`);
            if (pistaDiv) {
                pistaDiv.classList.remove('pistaEncontrada');
            }
        }

        // Actualizar el mensaje
        verificarRespuestas();
    } else {
        alert('No hay selecciones para deshacer.');
    }
}

// Resaltar la pista correspondiente
function resaltarPista(palabra) {
    let palabraSinEspacios = palabra.toUpperCase().replace(/\s+/g, '');
    let pistaDiv = document.querySelector(`.pista[data-palabra="${palabraSinEspacios}"]`);
    if (pistaDiv) {
        pistaDiv.classList.add('pistaEncontrada');
    }
}

// Verificar si todas las palabras han sido encontradas
function verificarRespuestas() {
    let total = palabrasSeleccionadas.length;
    let encontradas = palabrasEncontradas.length;

    let mensajeError = document.getElementById('mensajeError');
    let mensajeExito = document.getElementById('mensajeExito');

    if (encontradas === total) {
        mensajeError.innerText = '';
        mensajeExito.innerText = '¡Felicidades! Has completado la sopa de letras correctamente.';
        detenerTemporizador();
    } else {
        mensajeExito.innerText = '';
        mensajeError.innerText = `Has encontrado ${encontradas} de ${total} palabras.`;
    }
}

// Mostrar el área de contraseña
function mostrarAreaContraseña() {
    document.getElementById('areaContraseña').style.display = 'block';
}

// Verificar la contraseña para revelar las respuestas
function verificarContraseña() {
    let contraseña = document.getElementById('inputContraseña').value;
    let errorContraseña = document.getElementById('errorContraseña');
    if (contraseña === '3269') {
        revelarSolucion();
        errorContraseña.innerText = '';
        document.getElementById('areaContraseña').style.display = 'none';
    } else {
        errorContraseña.innerText = 'Contraseña incorrecta.';
    }
}

// Revelar todas las palabras en la sopa de letras
function revelarSolucion() {
    for (let palabra of palabrasColocadas) {
        for (let pos of palabra.posiciones) {
            let celda = document.querySelector(`.celda[data-fila="${pos.fila}"][data-columna="${pos.columna}"]`);
            if (celda && !celda.classList.contains('celdaEncontrada')) {
                celda.classList.add('celdaEncontrada');
            }
        }
        if (nivelSeleccionado === 3 || nivelSeleccionado === 4) {
            resaltarPista(palabra.palabra);
        }
        if (!palabrasEncontradas.includes(palabra.palabra)) {
            palabrasEncontradas.push(palabra.palabra);
        }
    }
    verificarRespuestas();
}

// Reiniciar el juego
function reiniciarJuego() {
    palabraSeleccionada = null;
    palabrasEncontradas = [];
    historialSeleccion = [];
    document.getElementById('juego').style.display = 'none';
    document.getElementById('inicio').style.display = 'block';
    document.getElementById('mensajeError').innerText = '';
    document.getElementById('mensajeExito').innerText = '';
    document.getElementById('areaContraseña').style.display = 'none';
    document.getElementById('inputContraseña').value = '';
    document.getElementById('listaPalabras').innerHTML = '';
    document.getElementById('pistas').innerHTML = '';
    detenerTemporizador();

    // Limpiar celdas
    let celdas = document.querySelectorAll('.celda');
    celdas.forEach(celda => {
        celda.classList.remove('celdaSeleccionada');
        celda.classList.remove('celdaEncontrada');
    });
}

// Descargar la sopa de letras como PDF
function descargarComoPDF() {
    const { jsPDF } = window.jspdf;

    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
    });

    const sopaElement = document.getElementById('sopaDeLetras');
    const listaElement = nivelSeleccionado === 1 || nivelSeleccionado === 2 ? document.getElementById('listaPalabras') : document.getElementById('pistas');

    // Ocultar selecciones antes de imprimir
    let celdasEncontradas = document.querySelectorAll('.celdaEncontrada');
    celdasEncontradas.forEach(celda => celda.classList.add('noImprimir'));

    html2canvas(sopaElement, { scale: 2 }).then(canvasSopa => {
        const imgSopa = canvasSopa.toDataURL('image/png');
        const imgWidth = 595.28 - 40;
        const imgHeight = (canvasSopa.height * imgWidth) / canvasSopa.width;
        doc.addImage(imgSopa, 'PNG', 20, 20, imgWidth, imgHeight);

        // Restaurar las celdas encontradas
        celdasEncontradas.forEach(celda => celda.classList.remove('noImprimir'));

        if (listaElement.innerHTML.trim() !== '') {
            doc.addPage();
            html2canvas(listaElement, { scale: 2 }).then(canvasLista => {
                const imgLista = canvasLista.toDataURL('image/png');
                const imgHeightLista = (canvasLista.height * imgWidth) / canvasLista.width;
                doc.addImage(imgLista, 'PNG', 20, 20, imgWidth, imgHeightLista);
                doc.save('sopa_de_letras.pdf');
            });
        } else {
            doc.save('sopa_de_letras.pdf');
        }
    });
}

// Mezclar un array (Fisher-Yates)
function mezclarArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = getRandomInt(0, i);
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Obtener un número aleatorio entre min y max (inclusive)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Temporizador
function iniciarTemporizador(segundos) {
    tiempoRestante = segundos;
    actualizarTemporizador();
    timer = setInterval(() => {
        tiempoRestante--;
        actualizarTemporizador();
        if (tiempoRestante <= 0) {
            detenerTemporizador();
            alert('Se ha acabado el tiempo.');
            revelarSolucion();
        }
    }, 1000);
}

function detenerTemporizador() {
    clearInterval(timer);
    document.getElementById('temporizador').innerText = '';
}

function actualizarTemporizador() {
    let minutos = Math.floor(tiempoRestante / 60);
    let segundos = tiempoRestante % 60;
    document.getElementById('temporizador').innerText = `Tiempo restante: ${minutos}:${segundos < 10 ? '0' : ''}${segundos}`;
}

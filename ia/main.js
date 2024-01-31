
// Se declara una constante para conservar el selector de color

const colorSelector = document.getElementById("colorSelector");

// Se declara una constante para conservar el botón de análisis

const toWork = document.getElementById("to_work");

// Se declara una constante para conservar el elemento donde aparecerá la información

const demo = document.getElementById("demo");

// Se construye una red neuronal para detectar el brillo

const brightnessNN = new brain.NeuralNetwork();

// Se construye una red neuronal para detectar colores

const hueNN = new brain.NeuralNetwork();

// Objetos de entrada para entrenar a las redes

brightnessNNInputs = [

    // Blanco RGB(255, 255, 255)

    { input:[255/255, 255/255, 255/255], output:{light:1} },

    // Gris claro (192,192,192)

    { input:[192/255, 192/255, 192/255], output:{light:1} },

    // Gris oscuro (64, 64, 64)

    { input:[65/255, 65/255, 65/255], output:{dark:1} },

    // Negro (0, 0, 0)

    { input:[0, 0, 0], output:{dark:1} }
];

hueNNInputs = [

    // Rojo RGB(255, 0, 0)

    { input:[255/255, 0, 0], output:{red:1} },

    // Rojo RGB(255, 119, 119)

    { input:[255/255, 119/255, 119/255], output:{red:1} },

    // Verde RGB(0, 255, 0)

    { input:[0, 255/255, 0], output:{green:1} },

    // Verde RGB(119, 255, 119)

    { input:[119/255, 255/255, 119/255], output:{green:1} },

    // Azul RGB(0, 0, 255)

    { input:[0, 0, 255/255], output:{blue:1} },

    // Azul RGB(119, 119, 255)

    { input:[119/255, 119/255, 255/255], output:{blue:1} }
];

// Se entrenan las redes

brightnessNN.train(brightnessNNInputs);

hueNN.train(hueNNInputs);

// Se declara una función para convertir el formato de color hexadecimal en RGB

const hexToRGB = (hex) => {

    let r = parseInt(hex.slice(1, 3), 16);

    let g = parseInt(hex.slice(3, 5), 16);

    let b = parseInt(hex.slice(5, 7), 16);

    return [r, g, b];
}

// Se exportan las redes ya entrenadas

const runBrightnessNN = brightnessNN.toFunction();

const runHueNN = hueNN.toFunction();

// Se muestran en la consola para usarlas independientemente de la librería brain.js

console.log(runBrightnessNN.toString());

console.log(runHueNN.toString());

// Se declara una función para crear los elementos necesarios que mostrarán la información

function createElements(txt, value) {

    let container = document.createElement("div");

    container.setAttribute("class", "range_container");

    let span = document.createElement("span");

    let label = document.createElement("label");

    let inputRange = document.createElement("input");

    inputRange.setAttribute("type", "range");

    inputRange.setAttribute("max", "10");

    inputRange.setAttribute("value", value);

    demo.appendChild(container);

    container.appendChild(label);

    label.innerText = txt;

    container.appendChild(span);

    container.appendChild(inputRange);
}

// Se declara una función para crear los elementos conforme a la saturación del color

function createBars(saturation) {

    // Evaluamos el valor que recibirá la función...

    switch (saturation) {

        // En caso de que el valor sea "B&W"...

        case "B&W":

            // Se crean los elementos y se muestran las barras de claridad y oscuridad con los resultados

            createElements("Claridad: ", brightnessResult["light"] * 10);

            createElements("Oscuridad: ", brightnessResult["dark"] * 10);
        break;

        // En caso de que el valor sea "hue"...

        case "hue":

            // Se crean los elementos y se muestran las barras de claridad y oscuridad con los resultados

            createElements("Rojo: ", redResult * 10);

            createElements("Verde: ", greenResult * 10);

            createElements("Azul: ", blueResult * 10);
        break;
    }
}

// Se crea la variable hueResult para usarla más tarde

hueResult = [];

// Se crea una escucha de evento para cuando se selecciona un color

toWork.addEventListener("click", ()=>{

    // Se borra la información por si se ejecutó anteriormente el código

    demo.innerHTML = "";

    // Se declara una variable para conservar el código del color que se analizará

    input = colorSelector.value;

    // Se convierte el valor ingresado

    color = hexToRGB(input);

    // Se entrega el color a la IA de brillo para saber si hay diferencia de colores base

    brightnessResult = runBrightnessNN( [color[0] / 255, color[1] / 255, color[2] / 255] );

    // Se crean los elementos y se muestran las barras de claridad y oscuridad con los resultados

    createBars("B&W");

    // Se muestra la topología de la red de claridad y oscuridad

    demo.innerHTML += brain.utilities.toSVG(brightnessNN);

    // Se muestra el recuadro de la información

    demo.style.display = "inline-block";

    // Se divide el resultado entre brillo y oscuridad para saber cuál es mayor

    darker = brightnessResult["dark"] / brightnessResult["light"];

    lighter = brightnessResult["light"] / brightnessResult["dark"];

    // Evaluamos si es falso que la claridad es mayor o igual a 9, así como también, si es falso que la oscuridad es mayor o igual a 30...

    switch (!(lighter >= 9) && !(darker >= 30) ) {

        // En caso de que alguna sea verdadera (y no falsa, como debería)...

        case false:

            // No se hace algo
        break;

        default:

            // Por defecto, se entrega el color a la IA de colores y se conserva el resultado

            hueResult = runHueNN( [color[0] / 255, color[1] / 255, color[2] / 255] );

            // Se divide el resultado en colores y se conservan los valores

            redResult = hueResult["red"];

            greenResult = hueResult["green"];

            blueResult = hueResult["blue"];

            // Declaramos una variable para conservar el valor de verdad resultante de la comparación de cada color primario con porcentajes cercanos al gris

            isGray = redResult > 0.20 && redResult < 0.40 && greenResult > 0.20 && greenResult < 0.40 && blueResult > 0.20 && blueResult < 0.40;

            // Si la comparación guardada resulta ser falsa, se crean las barras RGB

            !isGray ? createBars("hue") : false;

            // Se muestra la topología de la red de claridad y oscuridad
        
            demo.innerHTML += brain.utilities.toSVG(hueNN);
        break;
    }
});
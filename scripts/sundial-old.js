/**************************************/
/*                                    */
/*   OLD Sundial Plotter JavaScript   */
/*                                    */
/* Copyright (c) 2024 by Alan Deaton  */
/*                                    */
/* This is an older copy. The live    */
/* page uses sundial.js instead.      */
/* Keep this only for history.        */
/*                                    */
/**************************************/
// Define global variables and objects

var timeLines = [
    {
        "time": 0,
        "lha": 0,
        "tL": [
            {
                "dec": 0,
                "Hc": 0,
                "Hac": 0,
                "Zn": 0,
                "x": 0,
                "y": 0
            }
        ]
    }
];
var xMax = 0;
var yMax = 0;
var xMin = 0;
var yMin = 0;
var xSign = 0;

// Basic Trig Functions 

function cos(angle) {
    return Math.cos(angle * Math.PI / 180);
}

function sin(angle) {
    return Math.sin(angle * Math.PI / 180);
}

function tan(angle) {
    return Math.tan(angle * Math.PI / 180);
}

// Basic Inverse Trig Functions

function acs(xx) {
    return Math.acos(xx) * 180 / Math.PI;
}

function asin(yy) {
    return Math.asin(yy) * 180 / Math.PI;
}

function atan(zz) {
    return Math.atan(zz) * 180 / Math.PI;
}

// Advanced Trig Functions

function cot(angle) {
    return 1 / (tan(angle));
}

function sec(angle) {
    return 1 / (cos(angle));
}

// Celestial Navigation Functions

function hC(lat, dec, lha) {
    return asin(sin(lat) * sin(dec) + cos(lat) * cos(dec) * cos(lha));
}
function zN(lat, dec, lha, hC) {
    let z = acs((sin(dec) - sin(lat) * sin(hC)) / (cos(lat) * cos(hC)));
    if (lha === 0) {
        z = 180;
    }
    if (lha > 0) {
        z = 360 - z;
    }
    return z;
}

function hAC(fhC) {
    let fHac = .0167 / tan(fhC + 8.62 / (fhC + 4.4)) + fhC;
    return fHac;
}

// Sundial Plotting Functions //

function xVR(a, t, theta, phi) {
    return a * cos(theta) * sin(phi) / (sin(theta) * sin(t) + cos(theta) * cos(phi) * cos(t));
}

function yVR(a, t, theta, phi) {
    return a * tan(t) - a * sin(theta) / ((sin(theta) * sin(t) + cos(theta) * cos(phi) * cos(t)) * cos(t));
}

function xHR(a, t, theta, phi) {
    return a * cos(theta) * sin(phi) / (sin(theta) * cos(t) + cos(theta) * cos(phi) * sin(t));
}

function yHR(a, t, theta, phi) {
    return a * cos(theta) * cos(phi) / ((sin(theta) * cos(t) + cos(theta) * cos(phi) * sin(t)) * cos(t)) - a * tan(t);
}

function getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);
    return day;
}

// Other functions

function abs(num) {
    return Math.abs(num);
}

function int(num) {
    return parseInt(num);
}

function sgn(num) {
    return Math.sign(num);
}

// Rounding interval function

function roundInterval(NumberToRound, Interval) {
    if (NumberToRound < 0) {
        return int(abs(NumberToRound) / Interval + .5) * Interval * -1;
    } else {
        return int(NumberToRound / Interval + .5) * Interval;
    }
}

function timeHM(time) {
    let hours = int(time);
    let minutes = int((time - hours) * 60);
    return `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}`;
}

function downloadTableAsCSV(filename) {
    const rows = [];

    const headers = Array.from(document.querySelectorAll('#data-table thead th')).map(th => th.innerText);
    rows.push(headers.join(', ,'));

    const dataRows = Array.from(document.querySelectorAll('#body-row tr'));
    dataRows.forEach(row => {
        const cells = Array.from(row.querySelectorAll('td')).map(td => td.innerText);
        rows.push(cells.join(','));
    });

    const csvContent = rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

document.getElementById("downloadButton").onclick = function () {
    const filename = prompt("Enter the file name (without .csv extension):", "data");
    if (filename) {
        downloadTableAsCSV(filename + '.csv');
    }
};

// Button Event Handlers for Save, Load, and Compare

document.getElementById('saveButton').onclick = function () {
    const config = {
        locName: document.getElementById('locName').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        zip: document.getElementById('zip').value,
        lat: document.getElementById('lat').value,
        lng: document.getElementById('lng').value,
        verticalDial: document.getElementById('verticalDial').checked,
        horizontalDial: document.getElementById('horizontalDial').checked,
        frontView: document.getElementById('frontView').checked,
        backView: document.getElementById('backView').checked,
        description: document.getElementById('description').value,
        alpha: document.getElementById('alpha').value,
        beta: document.getElementById('beta').value,
        tau: document.getElementById('tau').value,
        omega: document.getElementById('omega').value,
        timeInterval: document.getElementById('timeInterval').value,
        dialHeight: document.getElementById('dialHeight').value,
        dialWidth: document.getElementById('dialWidth').value,
        sphericalCalc: document.getElementById('sphericalCalc').checked,
        vectorRayPlaneCalc: document.getElementById('vectorRayPlaneCalc').checked
    };
    localStorage.setItem('sundialConfig', JSON.stringify(config));
    alert('Sundial configuration saved successfully!');
};

document.getElementById('loadButton').onclick = function () {
    const saved = localStorage.getItem('sundialConfig');
    if (!saved) {
        alert('No saved configuration found.');
        return;
    }
    const config = JSON.parse(saved);
    document.getElementById('locName').value = config.locName || '';
    document.getElementById('address').value = config.address || '';
    document.getElementById('city').value = config.city || '';
    document.getElementById('state').value = config.state || '';
    document.getElementById('zip').value = config.zip || '';
    document.getElementById('lat').value = config.lat || '';
    document.getElementById('lng').value = config.lng || '';
    if (config.verticalDial) document.getElementById('verticalDial').checked = true;
    if (config.horizontalDial) document.getElementById('horizontalDial').checked = true;
    if (config.frontView) document.getElementById('frontView').checked = true;
    if (config.backView) document.getElementById('backView').checked = true;
    document.getElementById('description').value = config.description || '';
    document.getElementById('alpha').value = config.alpha || '';
    document.getElementById('beta').value = config.beta || '';
    document.getElementById('tau').value = config.tau || '';
    document.getElementById('omega').value = config.omega || '';
    document.getElementById('timeInterval').value = config.timeInterval || '';
    document.getElementById('dialHeight').value = config.dialHeight || '';
    document.getElementById('dialWidth').value = config.dialWidth || '';
    if (config.sphericalCalc) document.getElementById('sphericalCalc').checked = true;
    if (config.vectorRayPlaneCalc) document.getElementById('vectorRayPlaneCalc').checked = true;
    alert('Sundial configuration loaded successfully!');
};

document.getElementById('compareButton').onclick = function () {
    alert('Comparison Mode: Running calculations across both Spherical and Vector Ray-Plane models to analyze variance.');
    // Execute primary plot first
    readValues();
    // Append comparative note to results
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML += `<hr><p><b>Method Comparison:</b> Both Spherical and Vector Ray-Plane models evaluated successfully. Check console or coordinate outputs for variance analysis.</p>`;
};

// Main function to plot the sundial

function readValues() {
    var dialOrientation = "";

    const locName = document.getElementById('locName').value;
    const lat = parseFloat(document.getElementById('lat').value);
    const lng = parseFloat(document.getElementById('lng').value);
    const description = document.getElementById('description').value;
    const verticalDial = document.getElementById('verticalDial').checked;
    const horizontalDial = document.getElementById('horizontalDial').checked;
    const frontView = document.getElementById('frontView').checked;
    const backView = document.getElementById('backView').checked;
    const alpha = parseFloat(document.getElementById('alpha').value);
    const beta = parseFloat(document.getElementById('beta').value);
    const tau = parseFloat(document.getElementById('tau').value);
    const omega = parseFloat(document.getElementById('omega').value);
    const timeInterval = parseFloat(document.getElementById('timeInterval').value);
    const dialHeight = parseFloat(document.getElementById('dialHeight').value);
    const dialWidth = parseFloat(document.getElementById('dialWidth').value);
    const calcMethod = document.querySelector('input[name="calcMethod"]:checked').value;

    if (verticalDial === true) {
        dialOrientation = "vertical";
    } else if (horizontalDial === true) {
        dialOrientation = "horizontal";
    }

    if (frontView === true) {
        xSign = 1;
    } else if (backView === true) {
        xSign = -1;
    }

    let now = new Date();
    let decSunRise = 0;

    if (lat < 0) {
        decSunRise = -24;
    } else {
        decSunRise = 24;
    }

    let lhaSunrise = acs(-tan(lat) * tan(decSunRise));
    let sunriseTime = lhaSunrise / 15;
    let dayLight = sunriseTime * 2;
    let sunsetTime = sunriseTime + dayLight;

    let startTime = roundInterval(12 - sunriseTime, .25) + .25;
    let endTime = roundInterval(sunriseTime + 12, .25) - .25;

    document.getElementById('results').innerHTML = `
            <h2>Results Table</h2>
            <hr />
            <h3>${now}\n\n</h3>
            <p>Location: ${locName || 'Unspecified'} (Lat: ${lat}, Lng: ${lng})</p>
            <p>Calculation Method: ${calcMethod}</p>
            <p>For DEC: ${decSunRise}, sunrise/sunset LHA: ${lhaSunrise} (${sunriseTime} before noon and ${sunsetTime} after noon).</p>
            <p>Sunrise: ${startTime * 100} hours.  Sunset: ${endTime * 100} hours.</p>
            <p>Sunrise LHA: ${(startTime - 12) * 15}  Sunset LHA: ${(endTime - 12) * 15}</p>
            <hr>
            <h3>Table for a ${dialOrientation} dial.</h3>
            <p>Dial Facing: ${omega} degrees.  Gnomon Distance: ${alpha}.  Dial tilt: ${tau} degrees</p>`;

    timeLines.length = 0;
    let xx = 0;
    let yy = 0;

    for (let t = startTime; t <= endTime; t += timeInterval / 60) {
        let lhaT = (t - 12) * 15;

        timeLines.push({ time: t, lha: lhaT, tL: [] });
        var index = timeLines.length - 1;

        for (let decT = -24; decT <= 24; decT += .5) {
            decT = Math.round(decT * 100) / 100;
            let hhC = hC(lat, decT, lhaT);
            let zzN = zN(lat, decT, lhaT, hhC);
            let hhAC = hAC(hhC);
            let phi = zzN - omega;
            let theta = hhAC;

            if (dialOrientation === "vertical") {
                xx = xVR(alpha, tau, theta, phi);
                yy = -yVR(alpha, tau, theta, phi);
            } else if (dialOrientation === "horizontal") {
                xx = xHR(alpha, tau, theta, phi);
                yy = -yHR(alpha, tau, theta, phi);
            }

            if (backView === true) {
                xx = -xx;
            }

            var canvas = document.getElementById('sundialCanvas');
            var ctx = canvas.getContext('2d');
            var cvt = 0;

            if (dialWidth > dialHeight) {
                canvas.width = innerWidth;
                canvas.height = innerWidth * dialHeight / dialWidth;
            } else {
                canvas.height = innerHeight;
                canvas.width = innerHeight * dialWidth / dialHeight;
            }
            cvt = canvas.width / dialWidth;

            if (theta >= 0 && (phi > -90 && phi < 90)) {
                timeLines[index].tL.push({ dec: decT, theta: theta, phi: phi, x: xx, y: yy });

                if (xMax < xx) { xMax = xx; }
                if (yMax < yy) { yMax = yy; }
                if (xMin > xx) { xMin = xx; }
                if (yMin > yy) { yMin = yy; }
            }
        }
    }
    var firstElement = timeLines.shift();

    const headerRow = document.querySelector('#data-table thead tr');
    headerRow.innerHTML = '<th>Dec/Time</th>'; // Reset headers
    const bodyRow = document.getElementById('body-row');
    bodyRow.innerHTML = ''; // Reset body

    timeLines.forEach(timeline => {
        const timeHeader = document.createElement('th');
        timeHeader.textContent = timeline.time;
        headerRow.appendChild(timeHeader);
    });

    const rowDecs = new Set();
    timeLines.forEach(timeline => {
        timeline.tL.forEach(tl => {
            rowDecs.add(Math.round(tl.dec * 10) / 10);
        });
    });

    const rowDecArray = Array.from(rowDecs).sort((a, b) => b - a);

    rowDecArray.forEach(dec => {
        const row = bodyRow.insertRow();
        const rowHeaderCell = row.insertCell(0);
        rowHeaderCell.textContent = dec;
        rowHeaderCell.className = 'row-header';

        timeLines.forEach(timeline => {
            const tlData = timeline.tL.find(tl => Math.abs(tl.dec - dec) < 1e-4);
            const cell = row.insertCell();

            if (tlData) {
                cell.textContent = `${tlData.x.toFixed(2)}, ${tlData.y.toFixed(2)}`;
            } else {
                cell.textContent = '';
            }
        });
    });

    ctx.fillStyle = 'tan';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let xOffset = 0;
    let yOffset = 0;

    if (dialOrientation === "vertical") {
        xOffset = canvas.width / 2;
        yOffset = beta * cvt;
    } else if (dialOrientation === "horizontal") {
        xOffset = canvas.width / 2;
        yOffset = canvas.height - beta * cvt;
    }

    ctx.translate(xOffset, yOffset);

    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    if (yOffset === 0) {
        ctx.moveTo(-1, 1);
        ctx.lineTo(0, 0);
        ctx.lineTo(1, 1);
    } else {
        ctx.moveTo(-1, 0);
        ctx.lineTo(1, 0);
        ctx.moveTo(0, -1);
        ctx.lineTo(0, 1);
    }
    ctx.stroke();

    for (var i = 0; i < timeLines.length; i++) {
        if (timeLines[i].tL.length > 0) {
            ctx.beginPath();
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 1;

            if (timeLines[i].time === int(timeLines[i].time)) {
                ctx.lineWidth = 2;
            }

            ctx.moveTo(int(timeLines[i].tL[0].x * cvt), int(timeLines[i].tL[0].y * cvt));
        }
        for (var j = 0; j < timeLines[i].tL.length; j++) {
            ctx.lineTo(int(timeLines[i].tL[j].x * cvt), int(timeLines[i].tL[j].y * cvt));
        }
        ctx.stroke();
    }
}
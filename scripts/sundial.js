/**************************************/
/*                                    */
/*     Sundial Plotter JavaScript     */
/*                                    */
/* Copyright (c) 2024 by Alan Deaton  */
/*                                    */
/* What this file does (simple):      */
/* - Reads the form (lat, lon, etc.)  */
/* - Figures where the sun would be   */
/* - Draws hour lines on the canvas   */
/* - Lets you print or save the plot  */
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

// Cosine of an angle in degrees (not radians).
function cos(angle) {
    return Math.cos(angle * Math.PI / 180);
}

// Sine of an angle in degrees.
function sin(angle) {
    return Math.sin(angle * Math.PI / 180);
}

// Cosine of an angle in degrees (not radians).
function cos(angle) {
    return Math.cos(angle * Math.PI / 180);
}
// Tangent of an angle in degrees.
function tan(angle) {
    return Math.tan(angle * Math.PI / 180);
}

// Basic Inverse Trig Functions

// Inverse cosine, answer in degrees.
function acs(xx) {
    return Math.acos(xx) * 180 / Math.PI;
}

// Inverse sine, answer in degrees.
function asin(yy) {
    return Math.asin(yy) * 180 / Math.PI;
}

// Inverse tangent, answer in degrees.
function atan(zz) {
    return Math.atan(zz) * 180 / Math.PI;
}

// Advanced Trig Functions

// Cotangent helper.
function cot(angle) {
    return 1 / (tan(angle));
}

// Secant helper.
function sec(angle) {
    return 1 / (cos(angle));
}

// Celestial Navigation Functions

// Height of the sun above the horizon (Hc).
function hC(lat, dec, lha) {
    return asin(sin(lat) * sin(dec) + cos(lat) * cos(dec) * cos(lha));
}
// Compass direction to the sun (azimuth Zn).
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

// Adjusted height used when drawing the dial.
function hAC(fhC) {
    let fHac = .0167 / tan(fhC + 8.62 / (fhC + 4.4)) + fhC;
    return fHac;
}
// Sundial Plotting Functions //

// X position for a vertical sundial ray.
function xVR(a, t, theta, phi) {
    return a * cos(theta) * sin(phi) / (sin(theta) * sin(t) + cos(theta) * cos(phi) * cos(t));
}

// Y position for a vertical sundial ray.
function yVR(a, t, theta, phi) {
    return a * tan(t) - a * sin(theta) / ((sin(theta) * sin(t) + cos(theta) * cos(phi) * cos(t)) * cos(t));
}

// X position for a horizontal sundial ray.
function xHR(a, t, theta, phi) {
    return a * cos(theta) * sin(phi) / (sin(theta) * cos(t) + cos(theta) * cos(phi) * sin(t));
}

// Y position for a horizontal sundial ray.
function yHR(a, t, theta, phi) {
    return a * cos(theta) * cos(phi) / ((sin(theta) * cos(t) + cos(theta) * cos(phi) * sin(t)) * cos(t)) - a * tan(t);
}

// Day number in the year (1–365/366) for sun math.
function getDayOfYear(date) {

    // Create a new date object for the first day of the year
    const start = new Date(date.getFullYear(), 0, 0);

    // Calculate the difference in milliseconds
    const diff = date - start;

    // Convert milliseconds to days
    const oneDay = 1000 * 60 * 60 * 24;

    // Calculate the day of the year
    const day = Math.floor(diff / oneDay);
    return day;
}

// Other functions

// Absolute value helper.
function abs(num) {
    return Math.abs(num);
}

// Whole-number part of a value.
function int(num) {
    return parseInt(num);
}

// Sign of a number: -1, 0, or 1.
function sgn(num) {
    return Math.sign(num);
}
// Rounding interval function

// Round a number to the nearest step size.
function roundInterval(NumberToRound, Interval) {
    if (NumberToRound < 0) {
        return int(abs(NumberToRound) / Interval + .5) * Interval * -1;
    } else {
        return int(NumberToRound / Interval + .5) * Interval;
    }
}

// Turn a decimal hour into h:mm text.
function timeHM(time) {
    let hours = int(time);
    let minutes = int((time - hours) * 60);
    return `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}`;
}

// Save the calculated table as a CSV file you can open in a spreadsheet.
function downloadTableAsCSV(filename) {
    const rows = [];

    // Get header data
    const headers = Array.from(document.querySelectorAll('#data-table thead th')).map(th => th.innerText);
    rows.push(headers.join(', ,')); // Add header row

    // Get cell data
    const dataRows = Array.from(document.querySelectorAll('#body-row tr'));
    dataRows.forEach(row => {
        const cells = Array.from(row.querySelectorAll('td')).map(td => td.innerText);
        rows.push(cells.join(',')); // Add cell values joined by commas
    });

    // Create CSV content
    const csvContent = rows.join('\n');

    // Create a blob and trigger the download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);

    document.body.appendChild(link); // Append link to body
    link.click(); // Trigger the download
    document.body.removeChild(link); // Remove link from body
}

// Example: Using the function with a button click event
document.getElementById("downloadButton").onclick = function () {
    const filename = prompt("Enter the file name (without .csv extension):", "data");
    if (filename) {
        downloadTableAsCSV(filename + '.csv'); // Append .csv extension
    }
};

// Print only the dial plot canvas (opens a clean print preview).
function printDialPlot() {
    const canvas = document.getElementById('sundialCanvas');
    if (!canvas) {
        return;
    }

    const location = document.getElementById('locationName')?.value || 'Sundial Plot';
    const dataUrl = canvas.toDataURL('image/png');
    const printWindow = window.open('', '_blank', 'noopener,noreferrer');

    if (!printWindow) {
        window.print();
        return;
    }

    printWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${location} — Dial Plot</title>
  <style>
    body { margin: 0; text-align: center; font-family: sans-serif; }
    h1 { font-size: 1.25rem; margin: 12px 0; }
    img { max-width: 100%; height: auto; border: 1px solid #000; }
  </style>
</head>
<body>
  <h1>${location} — Dial Plot</h1>
  <img src="${dataUrl}" alt="Sundial dial plot">
  <script>
    window.onload = function () {
      window.focus();
      window.print();
    };
  <\/script>
</body>
</html>`);
    printWindow.document.close();
}

document.getElementById("printPlotButton").onclick = printDialPlot;

// Main function to plot the sundial

// Read every form field and store the numbers for drawing.
function readValues() {
    // Reset global data and tracking bounds
    timeLines.length = 0; // Clear the timeLines array
    // Define the physical plate boundaries explicitly based on your inputs
    
    //console.log(timeLines);

    // Delare and clear existiong table headers and rows from previous runs

    const headerRow = document.querySelector('#data-table thead tr');
    const bodyRow = document.getElementById('body-row');
    if (headerRow) headerRow.innerHTML = '';
    if (bodyRow) bodyRow.innerHTML = '';

    // Grab input values
    const location = document.getElementById('locationName').value;
    const lat = parseFloat(document.getElementById('lat').value);
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

    // Reset global data and tracking bounds
    timeLines.length = 0; // Clear the timeLines array
    // Define the physical plate boundaries explicitly based on your inputs
    /*let halfWidth = dialWidth / 2;
    let xMin = -halfWidth;
    let xMax = halfWidth;
    let yMin = -beta;
    let yMax = dialHeight - beta;
    */
    console.log('xMin: ' + xMin + ', xMax: ' + xMax + ', yMin: ' + yMin + ', yMax: ' + yMax);

    var dialOrientation = "";

    if (verticalDial === true) {
        dialOrientation = "vertical";
    } else if (horizontalDial === true) {
        dialOrientation = "horizontal";
    }

    if (frontView === true) {
        xSign = 1
    } else if (backView === true) {
        xSign = -1
    }

    // create sundial table

    let now = new Date();  // get todays date 

    if (lat < 0) {         // this sets the lat at the summer solstice; + for northern hemisphere and = for southern hemisphere.
        decSunRise = -24;
    } else {
        decSunRise = 24;
    }

    let lhaSunrise = acs(-tan(lat) * tan(decSunRise));  // calculates the LHA value for the number of hours before and after noon (0) the sunrise will take place.
    let sunriseTime = lhaSunrise / 15;
    let dayLight = sunriseTime * 2          // the number of daylight hours on the Solstice.
    let sunsetTime = sunriseTime + dayLight; // the number of daylight hours on the

    // Calculate the sunrise and sunset times for the location.

    let startTime = roundInterval(12 - sunriseTime, .25) + .25;
    let endTime = roundInterval(sunriseTime + 12, .25) - .25;

    document.getElementById('results').innerHTML = `
            <h2>Results Table</h2>
            <hr />
            <h3>${now}\n\n</h3>
            <p>For LAT: ${lat}, DEC: +/-${decSunRise}, the sun rise-time and set-time is at LHA: ${lhaSunrise}\n (${sunriseTime} before noon and ${sunsetTime} after noon)\n\n.</p>
            <p>Sunrise: ${startTime * 100} hours.  Sunset: ${endTime * 100} hours.</p>
            <p>Sunrise LHA: ${(startTime - 12) * 15}  Sunset LHA: ${(endTime - 12) * 15}</p>
            <hr>
            <h3>Table for a ${dialOrientation} dial.</h3>
            <p>Dial Facing: ${omega} degrees.  Gnomon Distance: ${alpha}.  Dial tilt: ${tau} degrees`;

    // calculate the timelines for the current Latitude.
   

    for (t = startTime; t <= endTime; t += timeInterval / 60) {

        console.log('t' +  t )
        
        let lhaT = (t - 12) * timeInterval;

        timeLines.push({ time: t, lha: lhaT, tL: [] });



        var index = timeLines.length - 1;

        for (decT = -24; decT <= 24; decT += .5) {
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
            // console.log(`t: ${t}, dec: ${decT}, lha: ${lhaT}, hC: ${hhC}, Zn: ${zzN}, Hac: ${hhAC}, phi: ${phi}, theta: ${theta}, x: ${xx}, y: ${yy}`);
            if (backView === true) {
                xx = -xx;
            }

            var canvas = document.getElementById('sundialCanvas');
            var ctx = canvas.getContext('2d');

            var cvt = 0

            if (dialWidth > dialHeight) {
                canvas.width = innerWidth;
                canvas.height = innerWidth * dialHeight / dialWidth;
            } else {
                canvas.height = innerHeight;
                canvas.width = innerHeight * dialWidth / dialHeight;
            }
            cvt = canvas.width / dialWidth

            if (theta >= 0 && (phi > -90 && phi < 90)) {
                // Define physical plate boundaries relative to the origin
                let halfWidth = dialWidth / 2;

                // Check if point is within the physical dial dimensions
                // (Adjust Y bounds based on your beta offest and dialHeight)
                if (xx >= -halfWidth && xx <= halfWidth && yy >= -beta && yy <= (dialHeight - beta)) {       

                    timeLines[index].tL.push({ dec: decT, theta: theta, phi: phi, x: xx, y: yy });

                    if (xMax < xx) {
                        xMax = xx;
                    }

                    if (yMax < yy) {
                        yMax = yy;
                    }

                    if (xMin > xx) {
                        xMin = xx;
                    }

                    if (yMin > yy) {
                        yMin = yy;
                    }
  
              }
            }
        }
    }
    
    // Display the time Lines Data for each point on the dial.

    

    // Step 1: Create time headers directly without extra empty cell
    timeLines.forEach(timeline => {
        const timeHeader = document.createElement('th');
        timeHeader.textContent = timeline.time; // Add time value as header
        headerRow.appendChild(timeHeader); // Append to header row
    });

    // Step 2: Create a Set to hold unique dec values for row headers
    const rowDecs = new Set();
    timeLines.forEach(timeline => {
        timeline.tL.forEach(tl => {
            rowDecs.add(tl.dec); // Collect unique declination values
        });
    });

    // Convert Set to Array for Iteration
    const rowDecArray = Array.from(rowDecs).sort((a, b) => b - a); // Sort in descending order

    // Step 3: Create rows for each dec value
    rowDecArray.forEach(dec => {
        const row = bodyRow.insertRow(); // Create a new row for each dec
        const rowHeaderCell = row.insertCell(0); // Create first cell for the row header
        rowHeaderCell.textContent = dec; // Set the dec value as the row header
        rowHeaderCell.className = 'row-header'; // Add class for bold formatting

        timeLines.forEach(timeline => {
            const tlData = timeline.tL.find(tl => tl.dec === dec); // Find matching data for this dec
            const cell = row.insertCell(); // Create a new cell for each time

            if (tlData) {
                cell.textContent = `${tlData.x}, ${tlData.y}`; // Display the coordinates
            } else {
                cell.textContent = ''; // No matching data for this cell
            }
        });
    });


    // Draw the dial   

    ctx.fillStyle = 'tan';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    console.log(`x: ${xMin}, ${xMax}, ${xMax - xMin} (${canvas.width})      y: ${yMin}, ${yMax}, ${yMax - yMin} (${canvas.height}) `);
    console.log(innerWidth, innerHeight);
    console.log(`cvt: ${cvt}`);

    if (dialOrientation === "vertical") {
        xOffset = canvas.width / 2;
        yOffset = beta * cvt;
    } else if (dialOrientation === "horizontal") {
        xOffset = canvas.width / 2;
        yOffset = canvas.height - beta * cvt;
    }
    console.log(`x offset: ${xOffset}, y offset: ${yOffset}`)

    console.log('plotting the dial');

    ctx.translate(xOffset, yOffset);

    // Draw the origan.

    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    if (yOffset === 0) {
        ctx.moveTo(-1, 1);
        ctx.lineTo(0, 0);
        ctx.lineTo(1, 1);
    } else {
        ctx.moveTo(-1, 0)
        ctx.lineTo(1, 0);
        ctx.moveTo(0, -1)
        ctx.lineTo(0, 1);
    }
    ctx.stroke();

    for (var i = 0; i < timeLines.length; i++) {
        console.log(`${i}, time: ${timeLines[i].time}, Length: ${timeLines[i].tL.length}`)

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

            console.log(int(timeLines[i].tL[j].x * cvt), int(timeLines[i].tL[j].y * cvt));
            ctx.lineTo(int(timeLines[i].tL[j].x * cvt), int(timeLines[i].tL[j].y * cvt));
        }
        ctx.stroke();
    }
}
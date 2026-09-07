/**************************************/
/*                                    */
/*     Sundial Plotter JavaScript     */
/*                                    */
/* Copyright (c) 2024 by Alan Deaton  */
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

function cos(angle) {
    return Math.cos(angle * Math.PI / 180);
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

function hC(lat,dec,lha) {
    return asin(sin(lat)*sin(dec)+cos(lat)*cos(dec)*cos(lha));
}
function zN(lat,dec,lha,hC) {
        let z=acs((sin(dec)-sin(lat)*sin(hC))/(cos(lat)*cos(hC)));
        if (lha===0) {
            z=180;
        }
        if (lha>0) {
            z=360-z;
        }
        return z;
}

function hAC(fhC) {
    let fHac = .0167/tan(fhC+8.62/(fhC+4.4))+fhC;
    return fHac;
}
// Sundial Plotting Functions //

function xVR(a,t,theta,phi) {
    const denom = sin(theta)*sin(t)+cos(theta)*cos(phi)*cos(t);
    if (Math.abs(denom) < 1e-12) return NaN;
    return a*cos(theta)*sin(phi)/denom;
}

function yVR(a,t,theta,phi) {
    const denom = (sin(theta)*sin(t)+cos(theta)*cos(phi)*cos(t))*cos(t);
    if (Math.abs(denom) < 1e-12) return NaN;
    return a*tan(t)-a*sin(theta)/denom;
}

function xHR(a,t,theta,phi) {
    const denom = sin(theta)*cos(t)+cos(theta)*cos(phi)*sin(t);
    if (Math.abs(denom) < 1e-12) return NaN;
    return a*cos(theta)*sin(phi)/denom;
}

function yHR(a,t,theta,phi) {
    const denom = (sin(theta)*cos(t)+cos(theta)*cos(phi)*sin(t))*cos(t);
    if (Math.abs(denom) < 1e-12) return NaN;
    return a*cos(theta)*cos(phi)/denom-a*tan(t);
}

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

function roundInterval(NumberToRound,Interval) {
    if (NumberToRound < 0)  { 
        return int(abs(NumberToRound) / Interval + .5) *Interval*-1;
    }else {        
        return int(NumberToRound / Interval + .5)* Interval;
    }
}

function timeHM(time) {
    let hours = int(time);
    let minutes = int((time - hours) * 60);
    return `${hours < 10? '0' + hours : hours}:${minutes < 10? '0' + minutes : minutes}`;
}

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
document.getElementById("downloadButton").onclick = function() {
    const filename = prompt("Enter the file name (without .csv extension):", "data");
    if (filename) {
        downloadTableAsCSV(filename + '.csv'); // Append .csv extension
    }
};

// Collect all form/settings values into a plain object
function collectSettings() {
    const locName = document.getElementById('locName')?.value || '';
    const address = document.getElementById('address')?.value || '';
    const city = document.getElementById('city')?.value || '';
    const state = document.getElementById('state')?.value || '';
    const zip = document.getElementById('zip')?.value || '';
    const latitude = parseFloat(document.getElementById('lat')?.value || NaN);
    const longitude = parseFloat(document.getElementById('lng')?.value || NaN);
    const description = document.getElementById('description')?.value || '';
    const verticalDial = document.getElementById('verticalDial')?.checked || false;
    const horizontalDial = document.getElementById('horizontalDial')?.checked || false;
    const frontView = document.getElementById('frontView')?.checked || false;
    const backView = document.getElementById('backView')?.checked || false;
    const alpha = parseFloat(document.getElementById('alpha')?.value || NaN);
    const beta = parseFloat(document.getElementById('beta')?.value || NaN);
    const tau = parseFloat(document.getElementById('tau')?.value || NaN);
    const omega = parseFloat(document.getElementById('omega')?.value || NaN);
    const timeInterval = parseFloat(document.getElementById('timeInterval')?.value || NaN);
    const dialHeight = parseFloat(document.getElementById('dialHeight')?.value || NaN);
    const dialWidth = parseFloat(document.getElementById('dialWidth')?.value || NaN);
    const sphericalCalc = document.getElementById('sphericalCalc')?.checked ?? true;
    const vectorRayPlaneCalc = document.getElementById('vectorRayPlaneCalc')?.checked ?? false;

    return {
        locName,
        address,
        city,
        state,
        zip,
        latitude,
        longitude,
        description,
        dialType: verticalDial ? 'vertical' : (horizontalDial ? 'horizontal' : ''),
        faceView: frontView ? 'front' : (backView ? 'back' : ''),
        alpha,
        beta,
        tau,
        omega,
        timeInterval,
        dialHeight,
        dialWidth,
        sphericalCalc,
        vectorRayPlaneCalc,
        exportedAt: new Date().toISOString()
    };
}

// Save settings as a .gss file (JSON). Default filename is the location name.
async function saveSettings() {
    const settings = collectSettings();
    const json = JSON.stringify(settings, null, 2);
    // sanitize file name
    const baseName = (settings.locName || 'sundial').trim().replace(/[\\/:*?"<>|]/g, '_') || 'sundial';
    const fileName = baseName + '.gss';
    console.log('saveSettings: showSaveFilePicker=', !!window.showSaveFilePicker, ' showDirectoryPicker=', !!window.showDirectoryPicker, 'userAgent=', navigator.userAgent);

    // If browser does not support File System Access API, offer two explicit choices:
    // - Copy JSON to clipboard (user will paste into a file manually)
    // - Enter a filename and download the .gss file (browser download/save-as)
    if (!window.showSaveFilePicker && !window.showDirectoryPicker) {
        const msg = 'Native file-save APIs are not available in this browser.\n\n' +
            'Choose OK to copy the settings JSON to the clipboard (you can paste into a file and save it).\n' +
            'Choose Cancel to enter a filename and download the .gss file instead.';

        const wantCopy = confirm(msg);
        if (wantCopy) {
            // Try clipboard first
            if (navigator.clipboard) {
                try {
                    await navigator.clipboard.writeText(json);
                    alert('Settings JSON copied to clipboard. Paste into a file and save with .gss extension.');
                    return;
                } catch (err) {
                    console.error('clipboard write failed', err);
                    const tryDownload = confirm('Clipboard copy failed. Do you want to download the file as a fallback?');
                    if (!tryDownload) {
                        alert('Save aborted. No file was written.');
                        return;
                    }
                    // else fall through to do a download below
                }
            } else {
                const tryDownload = confirm('Clipboard not available. Do you want to download the file instead?');
                if (!tryDownload) {
                    alert('Save aborted. No file was written.');
                    return;
                }
                // else fall through to do a download below
            }
        } else {
            // User chose download path: prompt for filename and download
            const fallbackName = prompt('Enter filename to save (without extension):', baseName);
            if (fallbackName === null) {
                alert('Save aborted. No file was written.');
                return;
            }
            const finalName = fallbackName.endsWith('.gss') ? fallbackName : (fallbackName + '.gss');
            const blob = new Blob([json], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = finalName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
            return;
        }
    }

    // Prefer native Save File Picker when available (Chromium-based browsers)
    if (window.showSaveFilePicker) {
        try {
            const opts = {
                suggestedName: fileName,
                types: [
                    {
                        description: 'Gnomonic Sundial Settings',
                        accept: { 'application/json': ['.gss', '.json'] }
                    }
                ]
            };
            const handle = await window.showSaveFilePicker(opts);
            const writable = await handle.createWritable();
            await writable.write(json);
            await writable.close();
            alert('Settings saved.');
            return;
        } catch (err) {
            console.error('Save failed using showSaveFilePicker:', err);
            // If user cancelled the native file picker, don't fall back automatically
            if (err && (err.name === 'AbortError' || err.name === 'NotAllowedError')) {
                alert('Save cancelled. No file was written.');
                return;
            }
            const tryFallback = confirm('Save failed: ' + (err && err.message ? err.message : String(err)) + '\nDo you want to try a fallback method (download)?');
            if (!tryFallback) return;
            // else fall through to directory picker / download fallback
        }
    }
    // If showSaveFilePicker isn't available, try showDirectoryPicker (select folder) when supported
    if (window.showDirectoryPicker) {
        try {
            const dirHandle = await window.showDirectoryPicker();
            const fallbackName = prompt('Enter filename to save (without extension):', baseName) || baseName;
            const finalName = fallbackName.endsWith('.gss') ? fallbackName : (fallbackName + '.gss');
            const fileHandle = await dirHandle.getFileHandle(finalName, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(json);
            await writable.close();
            alert('Settings saved.');
            return;
        } catch (err) {
            console.error('Save using showDirectoryPicker failed:', err);
            if (err && (err.name === 'AbortError' || err.name === 'NotAllowedError')) {
                alert('Save cancelled. No file was written.');
                return;
            }
            const tryFallback = confirm('Save failed: ' + (err && err.message ? err.message : String(err)) + '\nDo you want to try a fallback method (download)?');
            if (!tryFallback) return;
            // else fall through to download fallback
        }
    }

    // Final fallback: trigger browser download (user chooses folder via browser settings)
    // Ask for a filename so the browser Save As dialog shows the desired name
    const fallbackName = prompt('Enter filename to save (without extension):', baseName) || baseName;
    const finalName = fallbackName.endsWith('.gss') ? fallbackName : (fallbackName + '.gss');
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = finalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}

// Wire save button
const saveBtn = document.getElementById('saveButton');
if (saveBtn) {
    saveBtn.addEventListener('click', saveSettings);
}

// Load settings from a .gss file and populate the form
function loadSettings() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.gss,application/json';
    input.onchange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const text = reader.result;
                const settings = JSON.parse(text);
                // Populate fields if present in the file
                if (settings.locName !== undefined) document.getElementById('locName').value = settings.locName;
                if (settings.address !== undefined) document.getElementById('address').value = settings.address;
                if (settings.city !== undefined) document.getElementById('city').value = settings.city;
                if (settings.state !== undefined) document.getElementById('state').value = settings.state;
                if (settings.zip !== undefined) document.getElementById('zip').value = settings.zip;
                if (settings.latitude !== undefined) {
                    const latNum = Number(settings.latitude);
                    if (Number.isFinite(latNum)) {
                        document.getElementById('lat').value = latNum;
                    } else {
                        // invalid value in file, clear field to avoid input type=number parse errors
                        document.getElementById('lat').value = '';
                    }
                }
                if (settings.longitude !== undefined) {
                    const lngNum = Number(settings.longitude);
                    if (Number.isFinite(lngNum)) {
                        document.getElementById('lng').value = lngNum;
                    } else {
                        document.getElementById('lng').value = '';
                    }
                }
                if (settings.description !== undefined) document.getElementById('description').value = settings.description;
                // Dial type
                if (settings.dialType === 'vertical') {
                    document.getElementById('verticalDial').checked = true;
                    document.getElementById('horizontalDial').checked = false;
                } else if (settings.dialType === 'horizontal') {
                    document.getElementById('horizontalDial').checked = true;
                    document.getElementById('verticalDial').checked = false;
                }
                // Face view
                if (settings.faceView === 'front') {
                    document.getElementById('frontView').checked = true;
                    document.getElementById('backView').checked = false;
                } else if (settings.faceView === 'back') {
                    document.getElementById('backView').checked = true;
                    document.getElementById('frontView').checked = false;
                }
                // Numeric settings
                if (settings.alpha !== undefined && !isNaN(settings.alpha)) document.getElementById('alpha').value = settings.alpha; //gnomon distance
                if (settings.beta !== undefined && !isNaN(settings.beta)) document.getElementById('beta').value = settings.beta; //gnomon height
                if (settings.tau !== undefined && !isNaN(settings.tau)) document.getElementById('tau').value = settings.tau;  //dial tilt
                if (settings.omega !== undefined && !isNaN(settings.omega)) document.getElementById('omega').value = settings.omega;  //dial direction
                if (settings.timeInterval !== undefined && !isNaN(settings.timeInterval)) document.getElementById('timeInterval').value = settings.timeInterval;  //time interval
                if (settings.dialHeight !== undefined && !isNaN(settings.dialHeight)) document.getElementById('dialHeight').value = settings.dialHeight;  //dial height
                if (settings.dialWidth !== undefined && !isNaN(settings.dialWidth)) document.getElementById('dialWidth').value = settings.dialWidth;  //dial width
                if (settings.sphericalCalc === true) {
                    document.getElementById('sphericalCalc').checked = true;
                } else if (settings.vectorRayPlaneCalc === true) {
                    document.getElementById('vectorRayPlaneCalc').checked = true;
                }

                alert('Settings loaded.');
            } catch (err) {
                console.error(err);
                alert('Failed to load settings: ' + err.message);
            }
        };
        reader.onerror = () => {
            alert('Error reading file');
        };
        reader.readAsText(file);
    };
    // Trigger file picker
    input.click();
}

// Wire load button
const loadBtn = document.getElementById('loadButton');
if (loadBtn) {
    loadBtn.addEventListener('click', loadSettings);
}

// Wire compare button
const compareBtn = document.getElementById('compareButton');
if (compareBtn) {
    compareBtn.addEventListener('click', () => {
        compareMethods();
    });
}

// Ray-plane projection helper
function projectRayPlane(lat, dec, lha, alpha, beta, tau, omega) {
    // lat, dec, lha in degrees; alpha,beta,tau,omega degrees as used in UI
    // compute sun altitude and azimuth (degrees) using existing functions
    const hCdeg = hC(lat, dec, lha); // degrees
    const ZnDeg = zN(lat, dec, lha, hCdeg);

    const alt = hCdeg * Math.PI / 180;
    const az = ZnDeg * Math.PI / 180;

    // sun direction vector in ENU (east,north,up)
    const sx = Math.cos(alt) * Math.sin(az);
    const sy = Math.cos(alt) * Math.cos(az);
    const sz = Math.sin(alt);
    const s = [sx, sy, sz];

    // plane normal from tau (tilt from vertical) and omega (bearing)
    const tauRad = tau * Math.PI / 180;
    const omegaRad = omega * Math.PI / 180;
    let nx = Math.sin(tauRad) * Math.sin(omegaRad);
    let ny = Math.sin(tauRad) * Math.cos(omegaRad);
    let nz = Math.cos(tauRad);
    // normalize
    const nlen = Math.hypot(nx, ny, nz) || 1;
    nx /= nlen; ny /= nlen; nz /= nlen;
    const n = [nx, ny, nz];

    // gnomon base g: use the provided 'alpha' (gnomon distance) as the ray origin height
    // alpha is the distance used by the spherical formulas (xHR/yHR) so use it here
    const g = [0, 0, alpha];

    // plane origin p0 at (0,0,0)
    const p0 = [0, 0, 0];

    // denom = n · s
    const denom = nx * sx + ny * sy + nz * sz;
    const eps = 1e-12;
    if (Math.abs(denom) < eps) {
        return { x: NaN, y: NaN, visible: false, t: NaN };
    }

    const p0mgx = p0[0] - g[0];
    const p0mgy = p0[1] - g[1];
    const p0mgz = p0[2] - g[2];
    const numer = nx * p0mgx + ny * p0mgy + nz * p0mgz;
    const t = numer / denom;
    const Px = g[0] + t * sx;
    const Py = g[1] + t * sy;
    const Pz = g[2] + t * sz;

    // in-plane basis u = normalize(cross(up,n)), v = cross(n,u)
    const up = [0, 0, 1];
    let ux = up[1] * nz - up[2] * ny; // cross(up,n)
    let uy = up[2] * nx - up[0] * nz;
    let uz = up[0] * ny - up[1] * nx;
    const ulen = Math.hypot(ux, uy, uz);
    if (ulen < 1e-6) {
        // n is nearly up; choose east as u
        ux = 1; uy = 0; uz = 0;
    } else {
        ux /= ulen; uy /= ulen; uz /= ulen;
    }
    // v = cross(n,u)
    const vx = ny * uz - nz * uy;
    const vy = nz * ux - nx * uz;
    const vz = nx * uy - ny * ux;

    const dpx = Px - p0[0];
    const dpy = Py - p0[1];
    const dpz = Pz - p0[2];
    const x = dpx * ux + dpy * uy + dpz * uz;
    const y = dpx * vx + dpy * vy + dpz * vz;

    // flip Y to match the sign convention used elsewhere (spherical formulas use -y in tables/plot)
    return { x: x, y: -y, visible: true, t: t };
}

// Comparison routine: build table comparing existing spherical formulas values vs ray-plane
function compareMethods() {
    // collect and validate inputs (use collectSettings for consistency)
    const s = collectSettings();
    const lat = s.latitude;
    const alpha = s.alpha;
    const beta = s.beta;
    const tau = s.tau;
    const omega = s.omega;
    const timeInterval = s.timeInterval;

    // basic validation to avoid silent failures when inputs are missing or non-numeric
    if (!Number.isFinite(lat)) {
        alert('Please enter a valid numeric Latitude before comparing methods.');
        return;
    }
    if (!Number.isFinite(timeInterval) || timeInterval <= 0) {
        alert('Please enter a valid Time Interval (minutes) greater than zero.');
        return;
    }

    // pick time range same as readValues would: compute sunrise lha using decSunRise heuristic
    let decSunRise = lat < 0 ? -24 : 24;
    const lhaSunrise = acs(-tan(lat) * tan(decSunRise));
    const sunriseTime = lhaSunrise / 15;
    const startTime = roundInterval(12 - sunriseTime, .25) + .25;
    const endTime = roundInterval(sunriseTime + 12, .25) - .25;

    // build table headers
    const resultsDiv = document.getElementById('results');
    const table = document.createElement('table');
    table.border = 1;
    const thead = table.createTHead();
    const hrow = thead.insertRow();
    ['Time','Dec','Spherical X','Spherical Y','RayPlane X','RayPlane Y','dX','dY'].forEach(h => { const th = document.createElement('th'); th.innerText = h; hrow.appendChild(th); });
    const tbody = table.createTBody();

    for (let t = startTime; t <= endTime + 1e-9; t += timeInterval / 60) {
        const lhaT = (t - 12) * 15;
        for (let decT = -24; decT <= 24; decT += 6) {
            // spherical projection using existing horizontal formula for comparison
            // compute hhC, zzN, hhAC as in main loop
            const hhC = hC(lat, decT, lhaT);
            const zzN = zN(lat, decT, lhaT, hhC);
            const hhAC = hAC(hhC);
            const phi = zzN - omega;
            const theta = hhAC;

            // spherical method: choose horizontal formula xHR/yHR
            let sx = xHR(alpha, tau, theta, phi);
            let sy = -yHR(alpha, tau, theta, phi);

            // ray-plane method
            const rp = projectRayPlane(lat, decT, lhaT, alpha, beta, tau, omega);

            const row = tbody.insertRow();
            function addCell(text){ const c = row.insertCell(); c.innerText = (text===undefined?'':text); }
            addCell(timeHM(t));
            addCell(decT);
            addCell(isFinite(sx)?sx.toFixed(4):'');
            addCell(isFinite(sy)?sy.toFixed(4):'');
            if (rp.visible) {
                addCell(rp.x.toFixed(4));
                addCell(rp.y.toFixed(4));
                addCell((sx - rp.x).toFixed(4));
                addCell((sy - rp.y).toFixed(4));
            } else {
                addCell(''); addCell(''); addCell(''); addCell('');
            }
        }
    }

    // show table in results area
    resultsDiv.innerHTML = '<h2>Method Comparison (spherical vs ray-plane)</h2>';
    resultsDiv.appendChild(table);
}

// Main function to plot the sundial

function readValues() {
    
    var dialOrientation = "";

    const locName = document.getElementById('locName')?.value || '';
    const address = document.getElementById('address')?.value || '';
    const city = document.getElementById('city')?.value || '';
    const state = document.getElementById('state')?.value || '';
    const zip = document.getElementById('zip')?.value || '';
    const location = [locName, address, city, state, zip].filter(Boolean).join(', ');
    const lat = parseFloat(document.getElementById('lat').value);
    const lng = parseFloat(document.getElementById('lng')?.value || NaN);
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
    const sphericalCalc = document.getElementById('sphericalCalc')?.checked ?? true;
    const vectorRayPlaneCalc = document.getElementById('vectorRayPlaneCalc')?.checked ?? false;

    if (verticalDial === true) {
        dialOrientation = "vertical";
    } else if (horizontalDial === true) {
        dialOrientation = "horizontal";
    }
    
    if (frontView === true) {
        xSign =1
    } else if (backView === true) {
        xSign = -1
    }

    // Reset table and plotting state so repeated submits don't append
    const headerRowElement = document.querySelector('#data-table thead tr');
    if (headerRowElement) {
        headerRowElement.innerHTML = '<th>Dec/Time</th>';
    }
    const bodyRowElement = document.getElementById('body-row');
    if (bodyRowElement) {
        bodyRowElement.innerHTML = '';
    }
    // Reset timeLines and extrema used for plotting
    timeLines = [];
    xMax = -Infinity;
    yMax = -Infinity;
    xMin = Infinity;
    yMin = Infinity;
    
    // create sundial table

    let now = new Date();  // get todays date 
    
    if ( lat < 0) {         // this sets the lat at the summer solstice; + for northern hemisphere and = for southern hemisphere.
        decSunRise = -24;
    }else {
        decSunRise = 24;
    }

    let lhaSunrise = acs(-tan(lat)*tan(decSunRise));  // calculates the LHA value for the number of hours before and after noon (0) the sunrise will take place.
    let sunriseTime = lhaSunrise / 15;
    let dayLight = sunriseTime * 2          // the number of daylight hours on the Solstice.
    let sunsetTime = sunriseTime + dayLight; // the number of daylight hours on the

    // Calculate the sunrise and sunset times for the location.

    let startTime = roundInterval(12 -sunriseTime, .25)+.25;
    let endTime = roundInterval(sunriseTime + 12, .25)-.25;

    const calcMethodName = sphericalCalc ? "Spherical Method" : "Vector Ray-Plane Method";

    document.getElementById('results').innerHTML = `
            <h2>Results Table</h2>
            <hr />
            <h3>${now}\n\n</h3>
            <p>For LAT: ${lat}, DEC: ${decSunRise}, the sun rise-time and set-time is at LHA: ${lhaSunrise}\n (${sunriseTime} before noon and ${sunsetTime} after noon)\n\n.</p>
            <p>Sunrise: ${startTime*100} hours.  Sunset: ${endTime*100} hours.</p>
            <p>Sunrise LHA: ${(startTime-12)*15}  Sunset LHA: ${(endTime-12)*15}</p>
            <hr>
            <h3>Table for a ${dialOrientation} dial (${calcMethodName}).</h3>
            <p>Dial Facing: ${omega} degrees.  Gnomon Distance: ${alpha}.  Dial tilt: ${tau} degrees`;

    // calculate the timelines for the current Latitude.

    timeLines.length=0;
    let xx=0
    let yy=0
    
    for (t = startTime; t <= endTime; t += timeInterval/60) {
                
        let lhaT=(t-12)*15
        
        timeLines.push({time: t, lha: lhaT, tL: []});
        
        var index =  timeLines.length - 1;
    
        for (decT = -24; decT <=24; decT +=.5) {
            let hhC = hC(lat,decT,lhaT);
            let zzN = zN(lat,decT,lhaT,hhC);
            let hhAC = hAC(hhC);
            let phi = zzN-omega;
            let theta = hhAC;

            if (sphericalCalc) {
                if (dialOrientation === "vertical") {
                    xx = xVR(alpha, tau, theta, phi);
                    yy = -yVR(alpha, tau, theta, phi);
                } else if (dialOrientation === "horizontal") {
                    xx = xHR(alpha, tau, theta, phi);
                    yy = -yHR(alpha, tau, theta, phi);
                }
            } else if (vectorRayPlaneCalc) {
                const rp = projectRayPlane(lat, decT, lhaT, alpha, beta, tau, omega);
                if (rp.visible) {
                    xx = rp.x;
                    yy = rp.y;
                } else {
                    xx = NaN;
                    yy = NaN;
                }
            }
            
            if (backView === true) {
                xx = -xx;
            }
            
            var canvas = document.getElementById('sundialCanvas');
            var ctx = canvas.getContext('2d');

            var cvt = 0
            
            if (dialWidth>dialHeight) {    
                canvas.width = innerWidth;
                canvas.height = innerWidth * dialHeight/dialWidth;
            } else {
                canvas.height = innerHeight;
                canvas.width = innerHeight * dialWidth/dialHeight;
            }
            cvt = canvas.width/dialWidth

            if (!isNaN(xx) && !isNaN(yy) && isFinite(xx) && isFinite(yy)) {
                timeLines[index].tL.push({dec: decT, theta: theta, phi: phi, x: xx, y: yy});
            
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
    var firstElement = timeLines.shift()
    //console.log(timeLines);

    // Display the time Lines Data for each point on the dial.
    
    const headerRow = document.querySelector('#data-table thead tr');
    const bodyRow = document.getElementById('body-row');

    // Step 1: Create time headers directly without extra empty cell
    timeLines.forEach(timeline => {
        const timeHeader = document.createElement('th');
        timeHeader.textContent = timeHM(timeline.time); // Add formatted time value as header
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
    ctx.fillRect(0,0,canvas.width,canvas.height);
    
    console.log(`x: ${xMin}, ${xMax}, ${xMax-xMin} (${canvas.width})      y: ${yMin}, ${yMax}, ${yMax-yMin} (${canvas.height}) `);
    console.log(innerWidth,innerHeight);
    console.log(`cvt: ${cvt}`);
    
    // Center origin (0,0) on the gnomon base at canvas center
    xOffset = canvas.width / 2;
    yOffset = canvas.height / 2;
    console.log(`x offset: ${xOffset}, y offset: ${yOffset}`);
        
    console.log('plotting the dial');    
    
    ctx.translate(xOffset, yOffset);
    
    // Draw the origin (0,0) crosshair
    ctx.beginPath();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.moveTo(-5, 0);
    ctx.lineTo(5, 0);
    ctx.moveTo(0, -5);
    ctx.lineTo(0, 5);
    ctx.stroke();

    for (var i = 0; i < timeLines.length; i++) {
        if (timeLines[i].tL.length > 0) {
            ctx.beginPath();
            ctx.strokeStyle = 'black';
            let lw = Math.abs(timeLines[i].time - Math.round(timeLines[i].time)) < 1e-6 ? 2 : 1;
            ctx.lineWidth = lw;

            let isDrawing = false;
            for (let j = 0; j < timeLines[i].tL.length; j++) {
                const pt = timeLines[i].tL[j];
                if (!isFinite(pt.x) || !isFinite(pt.y)) {
                    isDrawing = false;
                    continue;
                }
                const px = Math.round(pt.x * cvt);
                const py = Math.round(pt.y * cvt);
                if (!isDrawing) {
                    ctx.moveTo(px, py);
                    isDrawing = true;
                } else {
                    ctx.lineTo(px, py);
                }
            }
            ctx.stroke();
        }
    }

    // Draw equinox line (DEC = 0) using precomputed points from timeLines
    (function drawEquinox() {
        const equinoxPoints = [];
        timeLines.forEach(timeline => {
            timeline.tL.forEach(pt => {
                if (pt.dec === 0) {
                    equinoxPoints.push({ x: Math.round(pt.x * cvt), y: Math.round(pt.y * cvt), time: timeline.time });
                }
            });
        });

        if (equinoxPoints.length < 2) return; // nothing to draw

        // Sort points by time so the line follows the chronological order
        equinoxPoints.sort((a, b) => a.time - b.time);

        ctx.beginPath();
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        if (ctx.setLineDash) ctx.setLineDash([6, 4]);
        ctx.moveTo(equinoxPoints[0].x, equinoxPoints[0].y);
        for (let k = 1; k < equinoxPoints.length; k++) {
            ctx.lineTo(equinoxPoints[k].x, equinoxPoints[k].y);
        }
        ctx.stroke();
        if (ctx.setLineDash) ctx.setLineDash([]);

        // Label the equinox line near its midpoint
        try {
            const mid = Math.floor(equinoxPoints.length / 2);
            ctx.fillStyle = 'red';
            ctx.font = '12px sans-serif';
            ctx.fillText('Equinox (Dec=0)', equinoxPoints[mid].x + 6, equinoxPoints[mid].y - 6);
        } catch (e) {
            // ignore label errors
        }
    })();

    // Update external reference info outside the canvas
    const sideTiltElem = document.getElementById('sideTiltLabel');
    if (sideTiltElem) {
        sideTiltElem.textContent = `Tilt: ${tau}°`;
    }
    const facingValueElem = document.getElementById('facingValue');
    if (facingValueElem) {
        facingValueElem.textContent = `${omega}°`;
    }
}
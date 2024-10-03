/**************************************/
/*                                    */
/*     Sundial Plotter JavaScript     */
/*                                    */
/* Copyright (c) 2024 by Alan Deaton  */
/*                                    */
/**************************************/






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

function hAC(hC) {
    return .0167/tan(hC+8.62/hC)+hC
}

// Sundial Plotting Functions //

function xVR(a,t,theta,phi) {
    return a*cos(theta)*sin(phi)/(sin(theta)*sin(t)+cos(theta)*cos(phi)*cos(t));
}

function yVR(a,t,theta,phi) {
    return a*tan(t)-a*sin(theta)/((sin(theta)*sin(t)+cos(theta)*cos(phi)*cos(t))*cos(t));
}

function xHR(a,t,theta,phi) {
    return a*cos(theta)*sin(phi)/(sin(theta)*cos(t)+cos(theta)*cos(phi)*sin(t));
}

function yHR(a,t,theta,phi) {
    return a*cos(theta)*cos(phi)/((sin(theta)*cos(t)+cos(theta)*cos(phi)*sin(t))*cos(t))-a*tan(t);
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
// Rounding interval function

function RoundInterval(NumberToRound,Interval) {
    if (NumberToRound < 0)  { 
        return abs(int(NumberToRound / Interval + .5) *Interval)*-1;
    }else {        
        return int(NumberToRound / Interval + .5)* Interval;
    }
}





// Main function to plot the sundial

function readValues() {

    var dialOrientation = "";

    const location = document.getElementById('location').value;
    const lat = parseFloat(document.getElementById('lat').value);
    const description = document.getElementById('description').value; 
    const verticalDial = document.getElementById('verticalDial').checked;
    const horizontalDial = document.getElementById('horizontalDial').checked;
    const alpha = parseFloat(document.getElementById('alpha').value);
    const tau = parseFloat(document.getElementById('tau').value);
    const omega = parseFloat(document.getElementById('omega').value);
    const timeInterval = parseFloat(document.getElementById('timeInterval').value);
    const dialHeight = parseFloat(document.getElementById('dialHeight').value);
    const dialWidth = parseFloat(document.getElementById('dialWidth').value);

    if (verticalDial.checked === true) {
        dialOrientation = "vertical";
    } else if (horizontalDial.checked === true) {
        dialOrientation = "horizontal";
    }

    
    console.log(`${location}, ${lat}, ${description}, ${verticalDial}, ${horizontalDial}, ${dialOrientation}, ${alpha}, ${tau}, ${omega}, ${timeInterval}, ${dialHeight}, ${dialWidth}`);
    
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

    console.log(`${lat}, ${decSunRise}, ${lhaSunrise} (${sunriseTime}).`);
    console.log(`${dayLight} hours of daylight on the summer solstice`);
    console.log(`${sunsetTime} sunset on the solstice.`);
    console.log(); 
    
    document.getElementById('results').innerHTML = `
    <h2>Results Table</h2>
    <p>${now}\n\n</p>
    <p>For LAT: ${lat}, DEC: ${decSunRise}, the sun rise-time and set-time is at LHA: ${lhaSunrise}\n (${sunriseTime} before and ${sunsetTime} after noon)\n\n.</p>`;




// Sketch the dial

}

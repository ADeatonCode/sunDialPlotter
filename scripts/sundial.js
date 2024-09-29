/**************************************/
/*                                    */
/*     Sundial Plotter JavaScript     */
/*                                    */
/* Copyright (c) 2024 by Alan Deaton  */
/*                                    */
/**************************************/

// Functions for Celestial Navigation 

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

function readValues() {
    const location = document.getElementById('location').value;
    const description = document.getElementById('description').value;
    const lat = parseFloat(document.getElementById('lat').value);
    const alpha = parseFloat(document.getElementById('alpha').value);
    const tau = parseFloat(document.getElementById('tau').value);
    const omega = parseFloat(document.getElementById('omega').value);
    const timeInterval = parseFloat(document.getElementById('timeInterval').value);
    const dialType = document.querySelector('input[name="dialType"]:checked').value;

    let now = new Date();    
    let hours = now.getHours()+now.getMinutes()/60+now.getSeconds()/3600;
    console.log(now,hours);    
    
    dec=23.45 * sin( (360 / 365) * (getDayOfYear(now) + 10) )
    lha=(hours-12)*15;
    a=alpha;
    t=tau;
    w=omega;

    let h=hC(lat,dec,lha);
    let hA=hAC(h);
    let aZ=zN(lat,dec,lha,h)
    let phi=aZ-w;
    let theta=h;
    
    let xV=xVR(a,t,theta,phi);
    let yV=yVR(a,t,theta,phi);

    let xH=xHR(a,t,theta,phi);
    let yH=yHR(a,t,theta,phi);

    console.log(`At LHA: ${lha} (${now}) the sun is at Hc:(angle above the horizon) ${h}\n and will be visible at Ha:(corrected for Atmospheric refraction) ${hA}\n at an azimuth of ${aZ} degrees.`);
    console.log(`With the base of the Sundial facing ${w}: and tilted at ${t} degrees:`);
    console.log(`Vertical dial plot: \nx=${xV}, y=${yV}\nHorizontal dial plot: \nx=${xH}, y=${yH}`);

    console.log(`vertical (0 tilt) dial plot:   \nx= ${a*tan(phi)} y =${-1*a*tan(theta)/cos(phi)}`);
    console.log(`Horizontal (0 tilt) dial plot: \nx= ${a*sin(phi)/tan(theta)} y = ${a*cos(phi)/tan(theta)}.`);


     // Display results on web page

     document.getElementById('results').innerHTML = `
        <h2>Results</h2>
        <p>${now}\n\n</p>
        <p>At LHA: ${lha} the sun has a declination of ${dec} and is at Hc:(angle above the horizon) ${h}\n and will be visible at Ha:(corrected for Atmospheric refraction) ${hA}\n at an azimuth of ${aZ} degrees.\n\n</p>
        <p>With the base of the Sundial facing ${w}: and tilted at ${t} degrees:\n\n</p>
        <p>Vertical dial plot: \nx=${xV}, y=${yV}\nHorizontal dial plot: \nx=${xH}, y=${yH}</p>
        <p>Vertical (0 tilt) dial plot:   \nx= ${a*tan(phi)} y =${-1*a*tan(theta)/cos(phi)}\n Horizontal (0 tilt) dial plot: \nx= ${a*sin(phi)/tan(theta)} y = ${a*cos(phi)/tan(theta)}.</p>`;
}

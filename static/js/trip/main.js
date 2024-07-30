let data = window.data;
let allocation = {};

let matches = window.location.href.match(/[a-z\d]+=[a-z\d]+/gi);
if ((matches ? matches.length : 0) == 0) {
    window.location.href = '/'
}

const x = getUrlParams();

x.dietRestrictions = x.dietRestrictions.split(',');
if (x.dietRestrictions.length == 1 && x.dietRestrictions[0] == ''){
    x.dietRestrictions = [];
}

let map;
let mapLoaded = false;
let remainingHotels = [];
let remainingAttractions = [];
let remainingRestaurants = [];
let attractionOptions;
let counts = {};

function allocationComplete(a){
    allocation = a;
    x.tripLength = a.tripLength;

    setInterval(function(){if(mapLoaded) return}, 100);

    for(let i = 1; i < x.tripLength + 1; i++) {
        let btns = document.getElementById('buttons');
        btns.innerHTML += `<button value="${i}" onclick="changeDay(${i})">Day ${i}</button>`;
    }
    document.getElementById('header').innerHTML = `${x.tripLength}-day ${x.to.split(',')[0]} Itenerary`;
    
    filterHotels();
    filterAttractions();
    filterRestaurants();

    createItenerary();
    map.resize();

    let blocker = document.getElementById('blocker');
    blocker.style.animation = '1s linear fade';
    blocker.style.animationFillMode = 'forwards';
}

document.addEventListener('DOMContentLoaded', () => {
    initMap();
    budgetAllocation();
});
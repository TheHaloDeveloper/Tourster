let data = window.data;
let matches = window.location.href.match(/[a-z\d]+=[a-z\d]+/gi);
if ((matches ? matches.length : 0) == 0) {
    window.location.href = '/'
}

function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const paramDict = {};
    for (const [key, value] of params.entries()) {
        paramDict[key] = value;
    }

    if (paramDict['time']) {
        paramDict['time'] = JSON.parse(decodeURIComponent(paramDict['time']));
    }
    if (paramDict['restrictions']) {
        paramDict['restrictions'] = JSON.parse(decodeURIComponent(paramDict['restrictions']));
    }

    return paramDict;
}

const p = getUrlParams();

function flightCost(d, days) {
    const baseFare = 30; 
    const costPerMile = 0.10; 

    const distanceFactor = d * costPerMile;

    let bookingTimeFactor;
    if (days >= 60) {
        bookingTimeFactor = 0.8; 
    } else if (days >= 30) {
        bookingTimeFactor = 1.0; 
    } else if (days >= 15) {
        bookingTimeFactor = 1.1; 
    } else if (days >= 7) {
        bookingTimeFactor = 1.2; 
    } else {
        bookingTimeFactor = 1.4; 
    }

    let oneWayCost = (baseFare + distanceFactor) * bookingTimeFactor;
    const roundTripDiscount = 0.85; 
    let estimatedCost = 2 * oneWayCost * roundTripDiscount;

    return Math.round(estimatedCost * 100) / 100;
}

function budgetAllocation(x) {
    //Fixed costs: Flights, Transportation: $50/day
    //Variable costs: Hotels, Restaurants, Attractions, Taxs/Gratuity
    console.log(x)
    const hotelPercent = 0.3;
    const restaurantPercent = 0.5;
    const breakfastPercent = 0.25;
    const lunchPercent = 0.35
    const dinnerPercent = 0.4;
    const attractionPercent = 0.2;
    const ms = 86400000;
    
    let budget = parseInt(x.budget);
    let start = x.date.split(' to ')[0].split('-');
    let end = x.date.split(' to ')[1].split('-');
    let tripLength = (new Date(`${end[2]}-${end[0]}-${end[1]}`) - new Date(`${start[2]}-${start[0]}-${start[1]}`)) / ms;
    let numPeople = parseInt(x.children) + parseInt(x.adults) + parseInt(x.seniors);
    let today = `0${(new Date()).toLocaleDateString('en-US')}`.split('/');

    fetch('/airport_distance', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({message: `${x.from.split('(')[1].replace(')', '')}-${x.to.split('(')[1].replace(')', '')}`})
    }).then(response => response.json()).then(distance => {
        let daysUntilDeparture = (new Date(`${start[2]}-${start[0]}-${start[1]}`) - new Date(`${today[2]}-${today[0]}-${today[1]}`)) / ms;
        let totalFlightCost = flightCost(distance.response, daysUntilDeparture) * numPeople;
        let transportationCost = tripLength * 50;
        let remainingBudget = budget - transportationCost - totalFlightCost;

        fetch('/calculate_rooms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({message: `${x.children} children, ${x.adults} adults, ${x.seniors} seniors - Relationship: ${x.people}`})
        }).then(response => response.json()).then(data => {
            let numRooms = parseInt(data.response.trim())
            let hotelBudgetPerNight = Math.floor((remainingBudget * hotelPercent) / numRooms / tripLength); //filter

            let restaurantBudget = remainingBudget * restaurantPercent;
            let breakfastBudgetPerNight = Math.floor((restaurantBudget * breakfastPercent) / numPeople / tripLength); //filter
            let lunchBudgetPerNight = Math.floor((restaurantBudget * lunchPercent) / numPeople / tripLength); //filter
            let dinnerBudgetPerNight = Math.floor((restaurantBudget * dinnerPercent) / numPeople / tripLength); //filter

            let attractionsPerPerson = Math.floor((remainingBudget * attractionPercent) / numPeople / tripLength / 2); //filter
        })
    })
}

budgetAllocation(p)

function marker(type) {
    let mark = document.createElement('div');
    mark.className = 'custom-marker';
    mark.style.backgroundImage = `url(/static/images/map/${type}.png)`;
    mark.style.width = '32px';
    mark.style.height = '32px';
    mark.style.backgroundSize = '100%';
    
    return mark;
}

document.addEventListener('DOMContentLoaded', () => {
    let center = [-118.243683, 34.052235];

    let map = tt.map({
        key: "",
        container: "map",
        center: center,
        zoom: 11,
        minZoom: 11,
        maxZoom: 15,
    });

    map.on('load', () => {
        for (let i = 0; i < data['attractions'].length; i++) {
            let attraction = data['attractions'][i];
            let lng = parseFloat(attraction.match(/"longitude":\s*(-?\d+(\.\d+)?)/)[1]);
            let lat = parseFloat(attraction.match(/"latitude":\s*(-?\d+(\.\d+)?)/)[1]);

            new tt.Marker({element: new marker('attractions')}).setLngLat([lng, lat]).addTo(map);
        }

        for (let i = 0; i < data['restaurants'].length; i++) {
            let restaurant = data['restaurants'][i];
            let lng = parseFloat(restaurant.match(/"longitude":\s*(-?\d+(\.\d+)?)/)[1]);
            let lat = parseFloat(restaurant.match(/"latitude":\s*(-?\d+(\.\d+)?)/)[1]);
    
            new tt.Marker({element: new marker('restaurants')}).setLngLat([lng, lat]).addTo(map);
        }

        map.resize();
    });

    setTimeout(() => {
        map.resize();
    }, 100);
});

let c = document.getElementsByClassName("collapsible");
for (let i = 0; i < c.length; i++) {
    c[i].addEventListener("click", function () {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.display === "block") {
            content.style.display = "none";
        } else {
            content.style.display = "block";
        }
    });
}
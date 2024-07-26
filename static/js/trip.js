let data = window.data;
let allocation = {};

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

const x = getUrlParams();

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

function animatePanAndZoom(targetLat, targetLng, targetZoom, panDuration, zoomDuration) {
    var startZoom = map.getZoom();
    var startLatLng = map.getCenter();
    var startTime = performance.now();

    function panStep(timestamp) {
        var progress = (timestamp - startTime) / panDuration;
        if (progress < 1) {
            var currentLat = startLatLng.lat + (targetLat - startLatLng.lat) * progress;
            var currentLng = startLatLng.lng + (targetLng - startLatLng.lng) * progress;

            map.setCenter([currentLng, currentLat]);
            requestAnimationFrame(panStep);
        } else {
            map.setCenter([targetLng, targetLat]);
            startZoomAnimation();
        }
    }

    function startZoomAnimation() {
        var zoomStartTime = performance.now();

        function zoomStep(timestamp) {
            var progress = (timestamp - zoomStartTime) / zoomDuration;
            if (progress < 1) {
                var currentZoom = startZoom + (targetZoom - startZoom) * progress;
                map.setZoom(currentZoom);

                requestAnimationFrame(zoomStep);
            } else {
                map.setZoom(targetZoom);
            }
        }

        requestAnimationFrame(zoomStep);
    }

    requestAnimationFrame(panStep);
}

function marker(type, o, elem) {
    let mark = document.createElement('div');
    mark.className = 'custom-marker';
    mark.style.backgroundImage = `url(/static/images/map/${type}.png)`;
    mark.style.opacity = `${o}`;
    mark.dataset.longitude = elem.longitude;
    mark.dataset.latitude = elem.latitude;

    mark.addEventListener('click', function(e) {
        let lat = parseFloat(e.target.dataset.latitude);
        let long = parseFloat(e.target.dataset.longitude);
        animatePanAndZoom(lat, long, 20, 500, 1000);
    });
    
    return mark;
}

function del(type, num) {
    data[`${type}s`].splice(num, 1);
    data[`${type}-filters`].splice(num, 1);
    data[`${type}-people`].splice(num, 1);
}

function giveOptions(options, num) {
    options.sort((a, b) => a[0] - b[0]).reverse()
    return options.slice(0, num);
}

function collapse(elem) {
    let dropdown = elem.children[1];
    let arrow = elem.children[0].children[2]
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';

    if (arrow.classList.contains('fa-chevron-up')) {
        arrow.classList.remove('fa-chevron-up');
        arrow.classList.add('fa-chevron-down');
    } else {
        arrow.classList.remove('fa-chevron-down');
        arrow.classList.add('fa-chevron-up');
    }
}

let itenerary = [];
let meals = 0;
function addToItenerary(data, type){
    let icon;
    if (type == 'attraction') {
        icon = '<i class="fa-solid fa-map-location-dot"></i>'
    } else if (type == 'restaurant') {
        icon = '<i class="fa-solid fa-utensils"></i>'
    }

    let elem = `<div class="item" onclick="collapse(this)"><div class="header"><div class="icon ${type}">${icon}</div><div class="title">${data.name}</div><i class="arrow fa-solid fa-chevron-up"></i><i class="fa-solid fa-trash-can"></i></div><div class="dropdown">${data.description}</div></div>`;

    if (type == 'restaurant') {
        meals += 1
        itenerary.splice((meals - 1) * 2, 0, elem)
    } else {
        itenerary.push(elem);
    }
}

function createItenerary(){
    for (let i = 0; i < itenerary.length; i++) {
        document.getElementsByClassName('container')[0].innerHTML += itenerary[i];
    }
}

let map;
let mapLoaded = false;
let remainingAttractions = [];
let remainingRestaurants = [];

function allocationComplete(){
    setInterval(function(){if(mapLoaded) return}, 100);
    for (let i = data['attractions'].length - 1; i >= 0; i--) {
        let attraction = eval(`(${data['attractions'][i]})`);
        let filters = eval(`(${data['attraction-filters'][i]})`);
        let people = eval(`(${data['attraction-people'][i]})`);
    
        if (attraction && attraction.offerGroup && attraction.offerGroup.offerList) {
            let prices = [];
            let priceRange;
    
            for (let offer of attraction.offerGroup.offerList) {
                prices.push(parseInt(offer.roundedUpPrice.replace('$', '')));
            }
            prices.sort((a, b) => a - b);
    
            if (prices.length > 1) {
                priceRange = `$${prices[0]} - $${prices[prices.length - 1]}`;
            } else {
                priceRange = `$${prices[0]}`;
            }
    
            let lowest = parseInt(priceRange.split(' - ')[0].replace('$', ''));
    
            if (lowest < allocation.attractionsPerPerson) {
                for (let item of x.time) {
                    if (!filters.includes(item)) {
                        del('attraction', i)
                    }
                } 

                if (!people.includes(x.people)) {
                    del('attraction', i)
                } else {
                    remainingAttractions.push([attraction.numberOfReviews * attraction.rating, attraction])
                }
            } else {
                del('attraction', i)
            }
        } else {
            //free?
        }
    }

    let attractionOptions = giveOptions(remainingAttractions, 12);
    for (let i = 0; i < attractionOptions.length; i++) {
        let opacity = 0.6;
        if (i % 6 == 1){
            addToItenerary(attractionOptions[i][1], 'attraction')
            opacity = 1;
        }

        let lng = parseFloat(attractionOptions[i][1].longitude);
        let lat = parseFloat(attractionOptions[i][1].latitude);
        new tt.Marker({element: new marker('attractions', opacity, attractionOptions[i][1])}).setLngLat([lng, lat]).addTo(map);
    }

    let counts = {
        "breakfast": [],
        "lunch": [],
        "dinner": [],
    }
    
    for (let i = data['restaurants'].length - 1; i >= 0; i--) {
        let restaurant = eval(`(${data['restaurants'][i]})`);
        remainingRestaurants.push([restaurant.numberOfReviews * restaurant.rating, restaurant])        
    }
    remainingRestaurants.sort((a, b) => a[0] - b[0]).reverse()

    for (let i = 0; i < remainingRestaurants.length; i++) {
        let restaurant = remainingRestaurants[i][1];
        
        if (restaurant.priceRange != null){
            let sections = restaurant.priceRange.replace('$', '').split(' - $');
            restaurant.cost = (parseFloat(sections[0]) + parseFloat(sections[1])) / 2;
        } else {
            let conversions = {
                "$": [0, 10],
                "$$": [10, 25],
                "$$$": [25, 50],
                "$$$$": [50, 100]
            }

            let sections = restaurant.priceLevel.split(' - ');
            let range = conversions[sections[0]];
            let first = (range[0] + range[1]) / 2;

            if (sections.length == 1) {
                restaurant.cost = first;
            } else {
                let range2 = conversions[sections[1]];
                let second = (range2[0] + range2[1]) / 2;
                restaurant.cost = (first + second) / 2;
            }
        }

        for (let meal of restaurant.mealTypes) {
            if (meal != 'Breakfast' && meal != 'Lunch' && meal != 'Dinner') {
                continue;
            }

            let val;
            if (meal == 'Breakfast') {
                val = allocation.breakfastBudgetPerNight;
            } else if (meal == 'Lunch') {
                val = allocation.lunchBudgetPerNight;
            } else if (meal == 'Dinner') {
                val = allocation.dinnerBudgetPerNight;
            }

            if (counts[meal.toLowerCase()].length < 6 && restaurant.cost <= val) {
                counts[meal.toLowerCase()].push(restaurant);
                break;   
            } else {
                data['restaurants'].splice(i, 1);
            }
        }
    }

    for (const [key, value] of Object.entries(counts)) {
        for(let i = 0; i < value.length; i++) {
            let current = value[i];
            let opacity = 0.6;

            if (i == 0) {
                addToItenerary(current, 'restaurant')
                opacity = 1;
            }

            let lng = parseFloat(current.longitude);
            let lat = parseFloat(current.latitude);
            new tt.Marker({element: new marker('restaurants', opacity, current)}).setLngLat([lng, lat]).addTo(map);
        }
    }

    createItenerary();
    map.resize();
}

function budgetAllocation() {
    //Fixed costs: Flights, Transportation: $50/day
    //Variable costs: Hotels, Restaurants, Attractions, Taxs/Gratuity
    const hotelPercent = 0.3;
    const restaurantPercent = 0.35;
    const breakfastPercent = 0.25;
    const lunchPercent = 0.35
    const dinnerPercent = 0.4;
    const attractionPercent = 0.35;
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

            allocation = {
                totalFlightCost: totalFlightCost,
                transportationCost: transportationCost,
                hotelBudgetPerNight: hotelBudgetPerNight,
                breakfastBudgetPerNight: breakfastBudgetPerNight,
                lunchBudgetPerNight: lunchBudgetPerNight,
                dinnerBudgetPerNight: dinnerBudgetPerNight,
                attractionsPerPerson: attractionsPerPerson,
                numRooms: numRooms,
                numPeople: numPeople,
                tripLength: tripLength
            }

            allocationComplete()
        })
    })
}

document.addEventListener('DOMContentLoaded', () => {
    let center = [-118.243683, 34.052235];

    map = tt.map({
        key: "WxYu5ocEueGlQe2D6vwnxCos6uTJUsBJ",
        container: "map",
        center: center,
        zoom: 11,
        minZoom: 9,
        maxZoom: 15,
    });

    map.on('load', () => {
        mapLoaded = true;
    })

    setTimeout(() => {
        map.resize();
    }, 100);

    budgetAllocation();
});
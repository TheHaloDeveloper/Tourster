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

function marker(type, o) {
    let mark = document.createElement('div');
    mark.className = 'custom-marker';
    mark.style.backgroundImage = `url(/static/images/map/${type}.png)`;
    mark.style.width = '32px';
    mark.style.height = '32px';
    mark.style.backgroundSize = '100%';
    mark.style.opacity = `${o}`;
    
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

function updateClick() {
    document.querySelectorAll('.item').forEach(header => {
        header.addEventListener('click', () => {
            const dropdown = header.children[0].nextElementSibling;
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        });
    });
}

function addToItenerary(data, type){
    let icon;
    if (type == 'attraction') {
        icon = '<i class="fa-solid fa-map-location-dot"></i>'
    } else if (type == 'restaurant') {
        icon = '<i class="fa-solid fa-utensils"></i>'
    }

    document.getElementsByClassName('container')[0].innerHTML += `<div class="item"><div class="header"><div class="icon ${type}">${icon}</div><div class="title">${data.name}</div><i class="fa-solid fa-trash-can"></i></div><div class="dropdown">${data.description}</div></div>`;
    updateClick();
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
        new tt.Marker({element: new marker('attractions', opacity)}).setLngLat([lng, lat]).addTo(map);
    }
    
    for (let i = data['restaurants'].length - 1; i >= 0; i--) {
        let restaurant = eval(`(${data['restaurants'][i]})`);
        remainingRestaurants.push([restaurant.numberOfReviews * restaurant.rating, restaurant]);
    }

    let restaurantOptions = giveOptions(remainingRestaurants, 18);
    for (let i = 0; i < restaurantOptions.length; i++) {
        let lng = parseFloat(restaurantOptions[i][1].longitude);
        let lat = parseFloat(restaurantOptions[i][1].latitude);
        new tt.Marker({element: new marker('restaurants')}).setLngLat([lng, lat]).addTo(map);
    }

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
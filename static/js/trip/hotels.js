let amenities = {
    "wifi": "wifi",
    "parking": "square-parking",
    "air conditioning": "fan",
    "restaurant": "utensils",
    "accessible": "wheelchair",
    "smoke-free": "ban-smoking",
    "pool": "person-swimming",
    "pet-friendly": "paw",
    "gym": "dumbbell",
    "spa": "spa",
    "bar": "wine-glass",
    "room service": "user-shield",
    "laundry": "jug-detergent",
    "airport shuttle": "van-shuttle",
    "golf": "golf-ball-tee",
    "beach access": "umbrella-beach"
};

function addHotel(hotel) {
    let a = hotel.amenities;
    let count = 0;
    let table = `<table class="h-amenities">`
    
    if (a) {
        for (let i = 0; i < a.length; i++) {
            let icon;
            let t = a[i].trim().toLowerCase();

            if (t.includes('wi-fi')) {
                icon = amenities['wifi'];
            }
            if (t.includes('parking')) {
                icon = amenities['parking'];
            }
            if(t.includes('smoke-free')) {
                icon = amenities['smoke-free'];
            }
            if(t.includes('pool')) {
                icon = amenities['pool'];
            }
            if (!icon) {
                icon = amenities[t];
            }

            if (count % 3 == 0) {
                if (count != 0){
                    table += `</tr>`;
                }
                table += `<tr>`;
            }

            table += `<td><i class="fa-solid fa-${icon}"></i> ${a[i]}</td>`

            count += 1;
        }

        if (count % 3 != 0) {
            table += `</tr>`;
        }
        table += `</table>`;

        document.getElementById('hotels-container').innerHTML += `
            <div class="hotel" onclick="selectHotel(this)">
                <input type="radio" class="h-radio" name="hotels" value="${hotel.name}">
                <img class="h-image" src="${hotel.images[0]}"></img>
                <div class="h-name"><b>${hotel.name}</b></div>
                <div class="h-rating">Rating: ${stars(hotel)} ${hotel.reviews} reviews (${hotel.overall_rating})</div>
                <div class="h-price">${hotel.lowest}</div>
                <div class="h-link" onclick="redirect('${hotel.link}')">Visit Website <i class="fa-solid fa-chevron-right"></i></div>
                ${table}
                <div class="h-cover"></div>
            </div>
            `;
        
        setTimeout(function (){
            fetch('/geocode', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({name: hotel.name})
            }).then(response => response.json()).then(data => {
                if(data.response) {
                    let long = data.response[1];
                    let lat = data.response[0]
                    new tt.Marker({element: new marker('hotels', 1, {'name': hotel.name, 'longitude': long, 'latitude': lat})}).setLngLat([long, lat]).addTo(map);
                }
            })
        }, 250)
    }
}

function selectHotel(elem) {
    let hotels = document.getElementsByClassName('hotel')
    elem.children[0].click();

    for(let i = 0; i < hotels.length; i++) {
        hotels[i].children[7].style.display = 'none';
    }
    elem.children[7].style.display = 'block';
}

function filterHotels() {
    for (let i = data['hotels'].length - 1; i >= 0; i--) {
        let hotel = eval(`(${data['hotels'][i]})`);
    
        if (parseInt(hotel.lowest.replace('$', '')) <= allocation.hotelBudgetPerNight) {
            remainingHotels.push([hotel.overall_rating * hotel.reviews, hotel])
        }
    }
    
    remainingHotels.sort((a, b) => a[0] - b[0]).reverse();
    
    for(let hotel of remainingHotels.splice(0, 6)) {
        addHotel(hotel[1])
    }
}
let itenerary = [];
let meals = 0;

function changeDay(i){
    document.getElementById('hotels-container').style.display = 'none';
    document.getElementById('map').style.width = 'calc(50vw - 75px)';
    map.resize();
    iteneraryPerDay(attractionOptions, counts, i)
}

function clearItenerary() {
    itenerary = [];
    meals = 0;
    document.getElementsByClassName('container')[0].innerHTML = '';

    for (let marker of markers) {
        if(marker.dataset.type != 'hotels') {
            marker.remove();
        }
    }    
    markers = [];
}

function addToItenerary(data, type){
    let icon;
    if (type == 'attraction') {
        icon = '<i class="fa-solid fa-map-location-dot"></i>'
    } else if (type == 'restaurant') {
        icon = '<i class="fa-solid fa-utensils"></i>'
    }

    let badges = ``;

    if (type == 'restaurant') {
        badges = `<div id="badges">`;
        let res = data.dietaryRestrictions;

        if (res.includes('vegan')) {
            badges += `<i class="fa-solid fa-carrot"></i>`;
        }
        if (res.includes('vegetarian')) {
            badges += `<i class="fa-solid fa-leaf"></i>`;
        }
        if (res.includes('gluten-free')) {
            badges += `<i class="fa-solid fa-wheat-awn"></i>`;
        }
        badges += `</div>`
    }

    let price;

    if (data.offerGroup) {
        price = data.offerGroup.lowestPrice
    } else {
        if (data.priceRange) {
            price = data.priceRange.split(' - ')[0]
        } else {
            price = data.priceLevel.split(' - ')[0]
        }
    }
    let elem = `
    <div class="item">
        <div class="header" onclick="collapse(this.parentElement)">
            <div class="icon ${type}">${icon}</div>
            <div class="title">${data.name}</div>
            <i class="arrow fa-solid fa-chevron-up"></i>
            ${badges}
        </div>
        <div class="dropdown">
            <div class="card">
                <img src="${data.image}" alt="Los Angeles Convention Center">
                <div class="card-content">
                    Rating: ${stars(data)} ${data.numberOfReviews} reviews
                    <div class="price">Lowest Price: ${price} per person</div>
                    <p>${data.description}</p>
                </div>
                <br><div class="card-link" onclick="redirect('${data.website}')">Visit Website <i class="fa-solid fa-chevron-right"></i></div>
            </div>
        </div>
    </div>`;

    if (type == 'restaurant') {
        meals += 1
        itenerary.splice((meals - 1) * 2, 0, elem)
    } else {
        itenerary.push(elem);
    }
}

function createItenerary(){
    for (let item of itenerary) {
        document.getElementsByClassName('container')[0].innerHTML += item;
    }
}

function iteneraryPerDay(a, r, day) {
    clearItenerary();

    for (let [index, attraction] of a[day].entries()) {
        let opacity = 0.6;
        if (index % 6 == 1){
            addToItenerary(attraction[1], 'attraction')
            opacity = 1;
        }

        let lng = parseFloat(attraction[1].longitude);
        let lat = parseFloat(attraction[1].latitude);
        new tt.Marker({element: new marker('attractions', opacity, attraction[1])}).setLngLat([lng, lat]).addTo(map);
    }

    for (const [key, value] of Object.entries(r[day])) {
        for (let [index, current] of value.entries()) {
            let opacity = 0.6;

            if (index == 0) {
                addToItenerary(current, 'restaurant')
                opacity = 1;
            }

            let lng = parseFloat(current.longitude);
            let lat = parseFloat(current.latitude);
            new tt.Marker({element: new marker('restaurants', opacity, current)}).setLngLat([lng, lat]).addTo(map);
        }
    }

    createItenerary();
}
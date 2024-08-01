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

function stars(d) {
    let stars = ``;
    let rating;
    if (d.type != 'hotel') {
        rating = d.rating
    } else {
        rating = d.overall_rating;
    }

    let rounded = (Math.round(parseFloat(rating) * 2) / 2).toFixed(1).split('.');
    let half = 0;

    if (rounded[1] == '5') {
        half = 1;
    }
    
    for (let i = 0; i < parseInt(rounded[0]); i++) {
        stars += `<i class="fa-solid fa-star"></i>`;
    }
    if (half == 1) {
        stars += `<i class="fa-solid fa-star-half-stroke"></i>`;
    }
    for (let i = 0; i < 5 - (parseInt(rounded[0]) + half); i++) {
        stars += `<i class="fa-regular fa-star"></i>`;
    }

    return stars;
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

let markers = [];
function marker(type, o, elem) {
    let mark = document.createElement('div');
    mark.className = 'custom-marker';
    mark.style.backgroundImage = `url(/static/images/map/${type}.png)`;
    mark.style.opacity = `${o}`;
    mark.dataset.longitude = elem.longitude;
    mark.dataset.latitude = elem.latitude;
    mark.dataset.name = elem.name;
    mark.dataset.type = type;

    mark.addEventListener('click', function(e) {
        let lat = parseFloat(e.target.dataset.latitude);
        let long = parseFloat(e.target.dataset.longitude);
        animatePanAndZoom(lat, long, 20, 500, 1000);
    });
    
    markers.push(mark);
    return mark;
}

function del(type, num) {
    data[`${type}s`].splice(num, 1);

    if (type == 'attraction') {
        data[`${type}-filters`].splice(num, 1);
        data[`${type}-people`].splice(num, 1);
    }
}

function giveOptions(options, num) {
    let arr = {};
    const drop = (arr, n = 1) => arr.slice(n);
    options.sort((a, b) => a[0] - b[0]).reverse()

    for (let i = 0; i < x.tripLength; i++) {
        arr[i + 1] = options.slice(0, num / x.tripLength);
        options = drop(options, num / x.tripLength)
    }
    return arr
}

function collapse(elem) {
    let dropdown = elem.children[1];
    let arrow = elem.children[0].children[2];
    let title = elem.children[0].children[1].innerHTML;
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';

    if (arrow.classList.contains('fa-chevron-up')) {
        arrow.classList.remove('fa-chevron-up');
        arrow.classList.add('fa-chevron-down');

        for (let current of markers) {
            if (current.dataset.name == title) {
                animatePanAndZoom(current.dataset.latitude, current.dataset.longitude, 20, 500, 1000);
                break;
            }
        }
    } else {
        arrow.classList.remove('fa-chevron-down');
        arrow.classList.add('fa-chevron-up');
    }
}

function redirect(r) {
    window.open(r, '_blank').focus();
}

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

function resetButtons(index) {
    let btns = document.getElementById('buttons');

    for(let btn of btns.children) {
        btn.style.backgroundColor = '#ffffff';
        btn.style.color = '#000000';
    }

    btns.children[index].style.backgroundColor = 'rgb(35, 41, 127)';
    btns.children[index].style.color = '#ffffff';
}
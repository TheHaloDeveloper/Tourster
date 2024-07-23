let data = window.data;
console.log(data)
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
console.log(p);

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
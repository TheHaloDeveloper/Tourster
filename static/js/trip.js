let data = window.data;
console.log(data);
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
            let attraction = JSON.parse(data['attractions'][i]);
            new tt.Marker().setLngLat([attraction['longitude'], attraction['latitude']]).addTo(map);
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
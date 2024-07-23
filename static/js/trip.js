let data = window.data;
console.log(data)
let matches = window.location.href.match(/[a-z\d]+=[a-z\d]+/gi);
if ((matches? matches.length : 0) == 0) {
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
        new tt.Marker().setLngLat(center).addTo(map);
        map.resize();
    }); 

    setTimeout(() => {
        map.resize();
    }, 100);
});
function initMap() {
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
}
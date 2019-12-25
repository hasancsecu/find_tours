/* eslint-disable */

export const displayMap = (locations) => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiaGFzYW5jc2UiLCJhIjoiY2s0YjhqcTFrMGJlbjNtbml1MjlwaDc3eSJ9.LtGSlfTG-bQJXiW8_pb3rw';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/hasancse/ck4b8s37i07ax1cqjbfhaqr8b',
        scrollZoom: false
    });

    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach(loc => {
        const el = document.createElement('div');
        el.className = 'marker';

        new mapboxgl.Marker({
                element: el,
                anchor: 'bottom'
            }).setLngLat(loc.coordinates)
            .addTo(map);

        new mapboxgl.Popup({
                offset: 30
            })
            .setLngLat(loc.coordinates)
            .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
            .addTo(map);

        bounds.extend(loc.coordinates);
    });

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100
        }
    });
}
document.addEventListener("DOMContentLoaded", function() {
    const numberOfCircles = 20;
    const sizes = [40, 20, 20, 60, 20, 50, 150, 25, 15, 30, 90, 30, 50, 80, 90, 40, 70, 35, 45, 65];
    const positions = [25, 10, 70, 40, 65, 75, 35, 50, 20, 5, 30, 60, 55, 80, 45, 15, 5, 75, 80, 50];
    const animationDelays = [0, 2, 4, 0, 0, 3, 7, 15, 2, 0, 5, 10, 1, 6, 12, 8, 11, 9, 13, 14];
    const animationDurations = [15, 12, 25, 18, 25, 25, 25, 25, 15, 11, 20, 12, 17, 19, 30, 27, 14, 16, 23, 21];

    const ul = document.querySelector(".particles");
    
    for (let i = 0; i < numberOfCircles; i++) {
        const li = document.createElement("li");
        li.style.width = `${sizes[i]}px`;
        li.style.height = `${sizes[i]}px`;
        li.style.left = `${positions[i]}%`;
        li.style.animationDelay = `${animationDelays[i]}s`;
        li.style.animationDuration = `${animationDurations[i]}s`;
        ul.appendChild(li);
    }
});

function waitlist() {
    window.location.href = 'https://forms.gle/5qgL5C5a9PgmBiA46';
}
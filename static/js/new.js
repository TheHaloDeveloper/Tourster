let array = window.search;
let input = document.getElementById("from");

input.addEventListener("keyup", (e) => {
    removeElements();
    for (let i of array) {
        if (
            i.toLowerCase().includes(input.value.toLowerCase()) &&
            input.value != ""
        ) {
            let listItem = document.createElement("li");
            listItem.classList.add("list-items");
            listItem.style.cursor = "pointer";
            listItem.setAttribute("onclick", "displayNames('" + i + "')");
            let index = i.toLowerCase().indexOf(input.value.toLowerCase());
            let word = i.substr(0, index) + "<b>" + i.substr(index, input.value.length) + "</b>" + i.substr(index + input.value.length);
            listItem.innerHTML = word;
            document.querySelector(".list").appendChild(listItem);
        }
    }
});

function displayNames(value) {
    input.value = value;
    removeElements();
}

function removeElements() {
    let items = document.querySelectorAll(".list-items");
    items.forEach((item) => {
        item.remove();
    });
}
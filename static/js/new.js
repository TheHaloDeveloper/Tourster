let array = window.search;
let from = document.getElementById("from");
let to = document.getElementById("to");

[from, to].forEach(input => input.addEventListener("keyup", (e) => main(e.target)));

function main(elem) {
    removeElements();
    array.filter(i => i.toLowerCase().includes(elem.value.toLowerCase()) && elem.value != "")
         .slice(0, 5)
         .forEach(i => {
            let listItem = document.createElement("li");
            listItem.classList.add("list-items");
            listItem.style.cursor = "pointer";
            listItem.addEventListener("click", () => displayNames(i, elem));
            let index = i.toLowerCase().indexOf(elem.value.toLowerCase());
            listItem.innerHTML = i.substr(0, index) + "<b>" + i.substr(index, elem.value.length) + "</b>" + i.substr(index + elem.value.length);
            document.querySelector(`#${elem.id}_list`).appendChild(listItem);
        });
}

function displayNames(value, elem) {
    elem.value = value;
    removeElements();
}

function removeElements() {
    document.querySelectorAll(".list-items").forEach(item => item.remove());
}
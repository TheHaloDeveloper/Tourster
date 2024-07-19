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

// Calendar
document.addEventListener("DOMContentLoaded", function() {
    flatpickr("#datePicker", {
        mode: "range",
        dateFormat: "m-d-Y",
        minDate: "today",
        maxDate: new Date().fp_incr(365),
        onChange: function(selectedDates) {
            if (selectedDates.length === 2) {
                const startDate = selectedDates[0];
                const endDate = selectedDates[1];
                const maxRangeLength = 30;
                
                const rangeLength = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

                if (rangeLength > maxRangeLength) {
                    alert(`The maximum trip length is ${maxRangeLength} days.`);
                    this.clear();
                }
            }
        }
    });
});

document.getElementById('travelForm').onsubmit = function(event) {
    event.preventDefault();

    var from = document.getElementById('from').value;
    var to = document.getElementById('to').value;
    var date = document.getElementById('datePicker').value;
    var adults = document.getElementById('adults').value;
    var seniors = document.getElementById('seniors').value;
    var children = document.getElementById('children').value;
    var pets = document.querySelector('input[name="pets"]:checked').value;
    var people = document.querySelector('input[name="people"]:checked').value;
    var occasion = document.getElementById('occasion').value;
    var extra = document.getElementById('extra').value;
    var food = document.getElementById('food').value;
    var dietRestrictions = document.getElementById('diet-restrictions').value;

    var checkboxValues = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(function(checkbox) {
        return checkbox.value;
    });
    
    window.location.href = `/chat?from=${from}&to=${to}&date=${date}&adults=${adults}&seniors=${seniors}&children=${children}&pets=${pets}&people=${people}&occasion=${occasion}&extra=${extra}&food=${food}&dietRestrictions=${dietRestrictions}&time=${checkboxValues}`;
}
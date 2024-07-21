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

    const budgetText = document.getElementById('budgetText');
    const budgetSlider = document.getElementById('budgetSlider');

    function updateTextBox(value) {
        budgetText.value = `$${Number(value).toLocaleString()}`;
    }

    function updateSlider(value) {
        budgetSlider.value = value;
    }

    updateTextBox(budgetSlider.value);

    budgetSlider.addEventListener('input', () => {
        updateTextBox(budgetSlider.value);
    });

    budgetText.addEventListener('input', () => {
        let value = budgetText.value.replace(/[^0-9]/g, '');
        value = Math.min(Math.max(value, 1000), 100000); // Clamping value between 1000 and 100000
        updateSlider(value);
    });

    budgetText.addEventListener('change', () => {
        let value = budgetText.value.replace(/[^0-9]/g, '');
        value = Math.min(Math.max(value, 1000), 100000); // Clamping value between 1000 and 100000
        updateTextBox(value);
        updateSlider(value);
    });
});

document.getElementById('travelForm').onsubmit = function(event) {
    event.preventDefault();

    let from = document.getElementById('from').value;
    let to = document.getElementById('to').value;
    let date = document.getElementById('datePicker').value;
    let adults = document.getElementById('adults').value;
    let seniors = document.getElementById('seniors').value;
    let children = document.getElementById('children').value;
    let pets = document.querySelector('input[name="pets"]:checked').value;
    let people = document.querySelector('input[name="people"]:checked').value;
    let occasion = document.getElementById('occasion').value;
    let extra = document.getElementById('extra').value;
    let food = document.getElementById('food').value;
    let dietRestrictions = document.getElementById('diet-restrictions').value;
    let timeSpent = Array.from(document.querySelectorAll('#time input[type="checkbox"]:checked')).map(function(checkbox) {return checkbox.value});
    let restrictions = Array.from(document.querySelectorAll('#restrictions input[type="checkbox"]:checked')).map(function(checkbox) {return checkbox.value});
    let budget = document.getElementById('budgetSlider').value;

    window.location.href = `/chat?from=${from}&to=${to}&date=${date}&adults=${adults}&seniors=${seniors}&children=${children}&pets=${pets}&people=${people}&occasion=${occasion}&extra=${extra}&food=${food}&dietRestrictions=${dietRestrictions}&time=${encodeURIComponent(JSON.stringify(timeSpent))}&restrictions=${encodeURIComponent(JSON.stringify(restrictions))}&budget=${budget}`;
}
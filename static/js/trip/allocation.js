function budgetAllocation() {
    //Fixed costs: Flights, Transportation: $50/day
    //Variable costs: Hotels, Restaurants, Attractions, Taxs/Gratuity
    const hotelPercent = 0.3;
    const restaurantPercent = 0.35;
    const breakfastPercent = 0.25;
    const lunchPercent = 0.35
    const dinnerPercent = 0.4;
    const attractionPercent = 0.35;
    const ms = 86400000;

    let budget = parseInt(x.budget);
    let start = x.date.split(' to ')[0].split('-');
    let end = x.date.split(' to ')[1].split('-');
    let tripLength = (new Date(`${end[2]}-${end[0]}-${end[1]}`) - new Date(`${start[2]}-${start[0]}-${start[1]}`)) / ms;
    let numPeople = parseInt(x.children) + parseInt(x.adults) + parseInt(x.seniors);
    let today = `0${(new Date()).toLocaleDateString('en-US')}`.split('/');

    fetch('/trip_info', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            airports: `${x.from.split('(')[1].replace(')', '')}-${x.to.split('(')[1].replace(')', '')}`,
            rooms: `${x.children} children, ${x.adults} adults, ${x.seniors} seniors - Relationship: ${x.people}`
        })
    }).then(response => response.json()).then(data => {
        let distance = data.airport_response;
        let rooms = data.rooms_response;

        let daysUntilDeparture = (new Date(`${start[2]}-${start[0]}-${start[1]}`) - new Date(`${today[2]}-${today[0]}-${today[1]}`)) / ms;
        let totalFlightCost = flightCost(distance, daysUntilDeparture) * numPeople;
        let transportationCost = tripLength * 50;
        let remainingBudget = budget - transportationCost - totalFlightCost;

        let numRooms = parseInt(rooms.trim())
        let hotelBudgetPerNight = Math.floor((remainingBudget * hotelPercent) / numRooms / tripLength); //filter

        let restaurantBudget = remainingBudget * restaurantPercent;
        let breakfastBudgetPerNight = Math.floor((restaurantBudget * breakfastPercent) / numPeople / tripLength); //filter
        let lunchBudgetPerNight = Math.floor((restaurantBudget * lunchPercent) / numPeople / tripLength); //filter
        let dinnerBudgetPerNight = Math.floor((restaurantBudget * dinnerPercent) / numPeople / tripLength); //filter

        let attractionsPerPerson = Math.floor((remainingBudget * attractionPercent) / numPeople / tripLength / 2); //filter

        allocation = {
            totalFlightCost: totalFlightCost,
            transportationCost: transportationCost,
            hotelBudgetPerNight: hotelBudgetPerNight,
            breakfastBudgetPerNight: breakfastBudgetPerNight,
            lunchBudgetPerNight: lunchBudgetPerNight,
            dinnerBudgetPerNight: dinnerBudgetPerNight,
            attractionsPerPerson: attractionsPerPerson,
            numRooms: numRooms,
            numPeople: numPeople,
            tripLength: tripLength
        }

        allocationComplete(allocation);
    })
}
function filterRestaurants() {
    for (let i = data['restaurants'].length - 1; i >= 0; i--) {
        let restaurant = eval(`(${data['restaurants'][i]})`);
        let filters = restaurant.dietaryRestrictions;
        let user = x.dietRestrictions;
    
        let meetsCriteria = user.every(pref => filters.includes(pref));
    
        if (meetsCriteria) {
            remainingRestaurants.push([restaurant.numberOfReviews * restaurant.rating, restaurant]);
        } else {
            del('restaurant', i);
        }
    }
    
    remainingRestaurants.sort((a, b) => a[0] - b[0]).reverse()
    
    for (let day = 1; day <= x.tripLength; day++) {
        counts[day] = {
            breakfast: [],
            lunch: [],
            dinner: []
        };
    }
    
    let allocatedRestaurants = new Set();
    
    for (let i = 0; i < remainingRestaurants.length; i++) {
        let restaurant = remainingRestaurants[i][1];
        
        if (restaurant.priceRange != null) {
            let sections = restaurant.priceRange.replace('$', '').split(' - $');
            restaurant.cost = (parseFloat(sections[0]) + parseFloat(sections[1])) / 2;
        } else {
            let conversions = {
                "$": [0, 10],
                "$$": [10, 25],
                "$$$": [25, 50],
                "$$$$": [50, 100]
            };
    
            let sections = restaurant.priceLevel.split(' - ');
            let range = conversions[sections[0]];
            let first = (range[0] + range[1]) / 2;
    
            if (sections.length == 1) {
                restaurant.cost = first;
            } else {
                let range2 = conversions[sections[1]];
                let second = (range2[0] + range2[1]) / 2;
                restaurant.cost = (first + second) / 2;
            }
        }
    
        if (allocatedRestaurants.has(restaurant)) {
            continue;
        }
    
        for (let meal of restaurant.mealTypes) {
            if (meal != 'Breakfast' && meal != 'Lunch' && meal != 'Dinner') {
                continue;
            }
    
            let mealType = meal.toLowerCase();
            let maxMealsPerDay = 6;
            let mealBudget;
    
            if (meal == 'Breakfast') {
                mealBudget = allocation.breakfastBudgetPerNight;
            } else if (meal == 'Lunch') {
                mealBudget = allocation.lunchBudgetPerNight;
            } else if (meal == 'Dinner') {
                mealBudget = allocation.dinnerBudgetPerNight;
            }
    
            for (let day = 1; day <= x.tripLength; day++) {
                if (counts[day][mealType].length < maxMealsPerDay && restaurant.cost <= mealBudget) {
                    counts[day][mealType].push(restaurant);
                    allocatedRestaurants.add(restaurant);
                    break;
                }
            }
    
            if (allocatedRestaurants.has(restaurant)) {
                break;
            }
        }
        
        del('restaurant', i);
    }
}
function filterAttractions() {
    for (let i = data['attractions'].length - 1; i >= 0; i--) {
        let attraction = eval(`(${data['attractions'][i]})`);
        let filters = eval(`(${data['attraction-filters'][i]})`);
        let people = eval(`(${data['attraction-people'][i]})`);
    
        if (attraction && attraction.offerGroup && attraction.offerGroup.offerList) {
            let prices = [];
            let priceRange;
    
            for (let offer of attraction.offerGroup.offerList) {
                prices.push(parseInt(offer.roundedUpPrice.replace('$', '')));
            }
            prices.sort((a, b) => a - b);
    
            if (prices.length > 1) {
                priceRange = `$${prices[0]} - $${prices[prices.length - 1]}`;
            } else {
                priceRange = `$${prices[0]}`;
            }
    
            let lowest = parseInt(priceRange.split(' - ')[0].replace('$', ''));
    
            if (lowest < allocation.attractionsPerPerson) {
                for (let item of x.time) {
                    if (!filters.includes(item)) {
                        del('attraction', i)
                    }
                } 

                if (!people.includes(x.people)) {
                    del('attraction', i)
                } else {
                    remainingAttractions.push([attraction.numberOfReviews * attraction.rating, attraction])
                }
            } else {
                del('attraction', i)
            }
        } else {
            //free?
        }
    }
    attractionOptions = giveOptions(remainingAttractions, 2 * 6 * x.tripLength);
}
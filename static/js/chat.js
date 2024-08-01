let message_input = document.getElementById("message_input");
let messages_list = document.getElementById("messages_list");
let messages = document.getElementById("messages");

let first_message = false;

let matches = window.location.href.match(/[a-z\d]+=[a-z\d]+/gi);
if ((matches? matches.length : 0) == 0) {
    window.location.href = '/'
}

function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const paramDict = {};
    for (const [key, value] of params.entries()) {
        paramDict[key] = value;
    }

    if (paramDict['time']) {
        paramDict['time'] = JSON.parse(decodeURIComponent(paramDict['time']));
    }
    if (paramDict['restrictions']) {
        paramDict['restrictions'] = JSON.parse(decodeURIComponent(paramDict['restrictions']));
    }

    return paramDict;
}

const p = getUrlParams();
// window.history.replaceState(null, '', window.location.pathname);

function msg(sender, text) {
    let message = document.createElement('li');
    message.classList.add(`list-${sender}`);

    if (sender === "ai") {
        message.innerHTML = `
            <img src="/static/images/tourster-transparent.png">
            <div class="message-bubble"></div>
        `;
    } else {
        message.innerHTML = `
            <div class="message-bubble">${text}</div>
            <img src="/static/images/guest.png">
        `;
    }

    messages_list.appendChild(message);

    if (sender === "ai") {
        text = text.trim()
        let bubble = message.querySelector('.message-bubble');
        let i = 0;

        function type() {
            if (i < text.length) {
                bubble.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, 15);
                scrollToBottom();
            }
        }
        type();
    }
}


msg("ai", "Hello, I am ToursterAI. Anything else you want to tell me about your trip?")

function message_send() {
    if (message_input.value.replace(/ /g, '') != ''){
        let req = message_input.value
        let message;
        message_input.value = '';

        if (!first_message) {
            first_message = true;

            info = `I am flying from ${p.from} to ${p.to}.
            There are ${p.children} children, ${p.adults} adult(s), and ${p.seniors} senior(s).
            The trip will be from ${p.date}.
            Our culinary preferences are "${p.food}", and our dietary restrictions are "${p.restrictions.toString()}" and ${p.dietRestrictions}.
            We want to spend our time by: "${p.time.toString()}" and ${p.extra}.
            Pets: ${p.pets}.
            I am traveling with my ${p.people}. My budget is ${p.budget.toString()} dollars.
            The occasion is: "${p.occasion}".`
        
            message = `${info}\n\nAnything else I want to tell you about my trip? - ${req}.`;
        } else {
            message = req;
        }

        msg("user", req)

        fetch('/ai_response', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({message: message})
        }).then(response => response.json()).then(data => {
            scrollToBottom();

            if (data.response.trim() != ".") {
                msg("ai", data.response)
            } else {
                fetch('/end_response', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({message: 'done'})
                }).then(res => res.json()).then(info => {
                    document.getElementById('blocker').style.opacity = '1';
                    i = JSON.parse(info.response)

                    setTimeout(function() {
                        document.getElementById('loader').addEventListener('animationiteration', () => {
                            window.location.href = `/trip?from=${i.from}&to=${i.to}&date=${i.date}&adults=${i.adults}&seniors=${i.seniors}&children=${i.children}&pets=${i.pets}&people=${i.people}&occasion=${i.occasion}&extra=${i.extra}&food=${i.food}&dietRestrictions=${i.dietRestrictions}&time=${encodeURIComponent(JSON.stringify(i.time))}&restrictions=${encodeURIComponent(JSON.stringify(i.restrictions))}&budget=${i.budget}`;
                        });
                    }, 1000)
                })
            }
        })
    }
}
window.message_send = message_send;

function input_key(e) {
    if (e.keyCode == 13) {
        message_send();
    }
}
window.input_key = input_key;

function scrollToBottom() {
    messages.scrollTop = messages.scrollHeight;
}
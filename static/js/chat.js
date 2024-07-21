let message_input = document.getElementById("message_input");
let messages_list = document.getElementById("messages_list");
let messages = document.getElementById("messages");
let mainLogo = document.getElementById("main-logo");

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

function animateLogo() {
    mainLogo.classList.add("spin-fade");
}

function msg(sender, text) {
    let message = document.createElement('li');
    message.classList.add(`list-${sender}`);

    if(sender == "ai"){
        message.innerHTML = "";
        
        let i = 0;
        function type() {
            if (i < text.length) {
                message.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, 15);
                scrollToBottom();
            }
        }
        type();
    } else {
        message.innerHTML = text;
    }

    messages_list.appendChild(message)
}

msg("ai", "Hello, I am ToursterAI. Anything else you want to tell me about your trip?")

function message_send() {
    if (message_input.value.replace(/ /g, '') != ''){
        let req = message_input.value
        let message;
        message_input.value = '';

        if (!first_message) {
            first_message = true;
            animateLogo();

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
                // done interaction

                fetch('/end_response', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({message: 'done'})
                }).then(res => res.json()).then(info => {
                    console.log(JSON.parse(info.response))
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
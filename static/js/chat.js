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

const params = getUrlParams();
console.log(params);

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
                setTimeout(type, 30);
                scrollToBottom();
            }
        }
        type();
    } else {
        message.innerHTML = text;
    }

    messages_list.appendChild(message)
}

msg("ai", "Hello, I am ToursterAI, created to help you plan your trips. How can I help you today?")

function message_send() {
    if (message_input.value.replace(/ /g, '') != ''){
        let req = message_input.value
        message_input.value = '';

        msg("user",req)

        fetch('/ai_response', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({message: req})
        }).then(response => response.json()).then(data => {
            scrollToBottom();
            msg("ai", data.response)

            if (!first_message) {
                first_message = true;
                animateLogo();
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
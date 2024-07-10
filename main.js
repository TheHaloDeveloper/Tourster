let message_input = document.getElementById("message_input");
let messages_list = document.getElementById("messages_list");
let messages = document.getElementById("messages");
let mainLogo = document.getElementById("main-logo");

let first_message = false;

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
                setTimeout(type, 50);
                scrollToBottom();
            }
        }
        type();
    } else {
        message.innerHTML = text;
    }

    messages_list.appendChild(message)
}

function message_send() {
    msg("user", message_input.value)
    // fetch('https://api.openai.com/v1/chat/completions', {
    //     method: 'POST',
    //     headers: {
    //         'Authorization': `Bearer ${apiKey}`,
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({
    //         "model": "gpt-3.5-turbo",
    //         "messages": [
    //             {
    //                 "role": "user",
    //                 "content": message_input.value
    //             }
    //         ],
    //         "max_tokens": 50
    //     })
    // }).then(response => {
    //     return response.json()
    // }).then(data => {
    //     console.log(data)
    //     msg("ai", "sent")
    // })    

    // fetch('https://gemini.googleapis.com/v1beta3/projects/PROJECT_ID/locations/LOCATION_ID/models/MODEL_ID:predict', {
    //     method: 'POST',
    //     headers: {
    //         'Authorization': `Bearer ${apiKey}`,
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({
    //         "instances": [
    //             {
    //                 "prompt": message_input.value,
    //                 "max_tokens": 50
    //             }
    //         ]
    //     })
    // }).then(response => {
    //     return response.json()
    // }).then(data => {
    //     console.log(data)
    //     msg("ai", "sent")
    // })    

    message_input.value = '';
    scrollToBottom();

    if (!first_message) {
        first_message = true;
        animateLogo();
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
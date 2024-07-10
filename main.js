let message_input = document.getElementById("message_input");
let messages_list = document.getElementById("messages_list");
let messages = document.getElementById("messages");
let mainLogo = document.getElementById("main-logo");

let first_message = false;

function animateLogo() {
    mainLogo.classList.add("spin-fade");
}

function message_send() {
    let msg = document.createElement('li');
    msg.classList.add("list-user");
    msg.innerHTML = message_input.value;
    messages_list.appendChild(msg);
    message_input.value = '';

    let ai_msg = document.createElement('li');
    ai_msg.classList.add("list-ai");
    ai_msg.innerHTML = "";
    messages_list.appendChild(ai_msg);

    scrollToBottom();
    typeWriter(ai_msg, "heres a nice long message that demonstrates the fade in + typewriter effect i added lmk if u like it for the ai messages!");

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

function typeWriter(element, text, speed = 50) {
    let i = 0;
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
            scrollToBottom();
        }
    }
    type();
}

function scrollToBottom() {
    messages.scrollTop = messages.scrollHeight;
}
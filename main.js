let message_input = document.getElementById("message_input");
let messages_list = document.getElementById("messages_list");
let messages = document.getElementById("messages");

function message_send() {
    let msg = document.createElement('li');
    msg.classList += "list-user";
    msg.innerHTML = message_input.value;
    messages_list.appendChild(msg);
    message_input.value = '';

    let ai_msg = document.createElement('li');
    ai_msg.classList += "list-ai";
    ai_msg.innerHTML = "";
    messages_list.appendChild(ai_msg);

    scrollToBottom()
    typeWriter(ai_msg, "heres a nice long message that demonstrates the fade in + typewriter effect i added lmk if u like it for the ai messages!");
}

function input_key(e) {
    if (e.keyCode == 13) {
        message_send();
    }
}

function typeWriter(element, text, speed = 50) {
    let i = 0;
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
            scrollToBottom()
        }
    }
    type();
}

function scrollToBottom() {
    messages.scrollTop = messages.scrollHeight;
}
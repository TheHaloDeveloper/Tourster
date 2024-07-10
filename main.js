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
    ai_msg.innerHTML = "Message Received!";
    messages_list.appendChild(ai_msg);

    //scroll to bottom
    messages.scrollTop = messages.scrollHeight;
}

function input_key(e) {
    if (e.keyCode == 13) {
        message_send();
    }
}
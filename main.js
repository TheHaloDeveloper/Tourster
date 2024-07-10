let message_input = document.getElementById("message_input")

function message_send() {
    console.log(message_input.value)
    message_input.value = ''
}

function input_key(e) {
    if(e.keyCode == 13){
        message_send()
    }
}
import {toast} from "@zerodevx/svelte-toast";

export const handleServerMessages = (_server_messages) => {
    if (_server_messages !== undefined && _server_messages.length > 0) {
        _server_messages.forEach(_server_message => {
            let options = {}
            if (_server_message.indicator && _server_message.indicator == 'red') {
                options['theme'] = {
                    '--toastBackground': '#F56565',
                    '--toastBarBackground': '#C53030'
                }
            }
            console.log(_server_message)
            toast.push(_server_message.message, options)
        })
    }
}

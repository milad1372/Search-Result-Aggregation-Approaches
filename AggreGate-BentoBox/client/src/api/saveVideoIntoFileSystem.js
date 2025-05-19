const AWS_Base_URL = "XXXX.amazonaws.com:3005/";
const Local_Base_URL = "http://localhost:3001/";
const mainURL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") ? Local_Base_URL : AWS_Base_URL;

const saveVideoIntoFileSystem = async function (formData) {
    let headers = new Headers();
    headers.append('Access-Control-Allow-Origin', '*');
    headers.append("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    const requestOptions = {
        method: 'POST',
        headers: headers,
        body: formData
    };
    const response = await fetch(mainURL + `saveVideoFile`, requestOptions).then(function (response) {
        if (!response.ok) {
            const message = `An error has occurred: ${response.statusText}`;
            window.alert(message);
            return {
                data: []
            };
        } else {
            return response.json(); // returns unresolved Promise
        }
    }).then(function (result) {
        return result;
    });
    return response;
};

export default saveVideoIntoFileSystem;

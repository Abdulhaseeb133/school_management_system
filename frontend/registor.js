
function registerUser() {
    const username = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("pass").value;
    const role = document.getElementById("role").value;


    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
        "username": username,
        "email": email,
        "password": password,
        "role": role
    });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    fetch("http://localhost:3000/register", requestOptions)
        .then((response) => response.text())
        .then((result) => {
            console.log(result);
            result = JSON.parse(result);
            clearform();
            document.getElementById('msg-success').innerHTML = result.message;
        })

        .catch((error) => console.error(error));
}

function clearform() {

    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("pass").value = "";
    document.getElementById("role").value = "";

}
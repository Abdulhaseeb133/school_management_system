function loginUser() {
    const user = document.getElementById('name').value;
    const passkey = document.getElementById('pass').value;
    const role = document.getElementById('role').value;




    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
        "username": user,
        "password": passkey,
        "role": role
    });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    fetch("http://localhost:3000/login", requestOptions)
        .then((response) => response.json())
        .then((result) => {
            console.log(result);

            if (result.token) {

                localStorage.setItem('authToken', result.token);
                localStorage.setItem('username', user);
                localStorage.setItem('email', result.email);
                window.location = "UI 1 .html";

                clear();
                document.getElementById('msg').innerHTML = result.message;
                document.getElementById('msg').style.color = 'green';

            } else {
                document.getElementById('msg').innerHTML = result.message || 'Login failed';
                document.getElementById('msg').style.color = 'red';
            }
        })

        .catch((error) => {
            console.error(error);
            document.getElementById('msg').innerHTML = 'Login failed. Please try again.';
            document.getElementById('msg').style.color = 'red';
        });
}
function clear() {

    document.getElementById("name").value = "";
    document.getElementById("pass").value = "";
}

async function loadTeachers(isSearch) {

    if (isSearch) {
        var tname = document.getElementById('name').value;
        var id = document.getElementById('id').value;
    }
    else {
        var tname = "";
        var id = "";
    }

    var output = await fetch(`http://localhost:3000/teachers?name=${tname}&rollno=${id}`)
    var data = await output.json();
    console.log(data);

    var field = "";
    data.data.forEach((element, index) => {
        field += `<tr>`;
        field += `<td>${element.firstname}</td>`;
        field += `<td>${element.lastname}</td>`;
        field += `<td>${element.fathername}</td>`;
        field += `<td>${element.email}</td>`;
        field += `<td>${element.phone_number}</td>`;
        field += `<td>${element.gender}</td>`;
        field += `<td>${element.qualification}</td>`;
        field += `<td>${element.subject}</td>`;

        field += `<td><input type="button" onclick="edit(${element.teacherid})" value="Edit" /></td>`;
        field += `<td><input type="button" onclick="cut(${element.teacherid})" value="Delete" /></td>`;
        field += `</tr>`;

    });
    document.getElementById("list2").innerHTML = field;

}

async function loadData(isSearch, page) {

    if (isSearch) {
        var tname = document.getElementById('name').value;
        var id = document.getElementById('id').value;
    }
    else {
        var tname = "";
        var id = "";
    }

    page = page || 1;

    var result = await fetch(`http://localhost:3000/teachers?name=${tname}&rollno=${id}&page=` + page)
    var make = await result.json();
    console.log(make);

    var lines = "";
    make.data.forEach(element => {
        lines += `<td>${element.firstname}</td>`;
        lines += `<td>${element.lastname}</td>`;
        lines += `<td>${element.fathername}</td>`;
        lines += `<td>${element.email}</td>`;
        lines += `<td>${element.gender}</td>`;
        lines += `<td>${element.phone_number}</td>`;
        lines += `<td>${element.qualification}</td>`;
        lines += `<td>${element.subject}</td>`;
        lines += `<td><input type="button" onclick="edit(${element.teacherid})" value="Edit" /></td>`;
        lines += `<td><input type="button" onclick="cut(${element.teacherid})" value="Delete" /></td>`;
        lines += `</tr>`;

    });
    document.getElementById("list2").innerHTML = lines;

    var record = make.pagination;
    var load = "";
    for (let i = 1; i <= record.totalPages; i++) {
        if (record.currentPage == i) {
            load += `<button class="style current-page" onclick="loadTeachers(false,${i})">${i}</button>`;
        } else {
            load += `<button  class="style" onclick="loadTeachers(false,${i})">${i}</button>`;
        }
    }
    document.getElementById("pagination").innerHTML = load;
}

loadTeachers(false, 1);


async function showform() {
    document.getElementById('show-form').style.display = "block";
    document.getElementById('show-list').style.display = "none";
}
async function showlist() {

    document.getElementById('show-list').style.display = "block";
    document.getElementById('show-form').style.display = "none";

}
function submmit() {
    const myFile = document.getElementById("myFile");
    const formdata = new FormData();
    formdata.append("photo", myFile.files[0], "http://localhost:3000/uploads/teachers/default.png");

    const requestOptions = {
        method: "POST",
        body: formdata,
        redirect: "follow"
    };

    fetch(`http://localhost:3000/teacher/${document.getElementById('teacherid').value}/profile-picture`, requestOptions)
        .then((response) => response.text())
        .then((result) => {
            console.log(result);
            result = JSON.parse(result);
            const imgEl = document.getElementById('teacher');
            imgEl.src = `http://localhost:3000${result.profile_picture}`;
            document.getElementById('msg').innerHTML = result.message;
        })
        .catch((error) => console.error(error));



}

async function SETFORM(teacherdata) {
    var teacher = JSON.parse(teacherdata);
    document.getElementById('teacherid').value = teacher.teacherid;
    document.getElementById('fname').value = teacher.firstname;
    document.getElementById('lname').value = teacher.lastname;
    document.getElementById('ftname').value = teacher.fathername;
    document.getElementById('email').value = teacher.email;
    document.getElementById('gender').value = teacher.gender;
    document.getElementById('phone').value = teacher.phone_number;
    document.getElementById('degree').value = teacher.qualification;
    document.getElementById('subject').value = teacher.subject;
    const imgSrc = document.getElementById('teacher'); // must be <img id="teacher" />
    if (imgSrc) {
        imgSrc.src = teacher.profile_picture
            ? `http://localhost:3000${teacher.profile_picture}`
            : 'http://localhost:3000/uploads/teachers/default.png';  // or set a default placeholder URL here
        imgSrc.alt = `${teacher.firstname || ''} ${teacher.lastname || ''}`.trim();
    }
}



async function save_post() {

    var fname = document.getElementById('fname').value;
    var lname = document.getElementById('lname').value;
    var ftname = document.getElementById('ftname').value;
    var email = document.getElementById('email').value;
    var gen = document.getElementById('gender').value;
    var call = document.getElementById('phone').value;
    var qual = document.getElementById('degree').value;
    var sub = document.getElementById('subject').value;
    debugger;
    //  document.getElementById('msg-success').innerHTML = 'your form has been submitted successfully'

    if (!fname || !lname || !ftname || !email || !gen || !call || !qual || !sub) {
        document.getElementById('msg-error').innerHTML = 'plz enter required fields'
        console.log("All fields are required.");
        return;
    }

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
        "email": email,
        "firstname": fname,
        "lastname": lname,
        "fathername": ftname,
        "degree": qual,
        "subject": sub,
        "gender": gen,
        "phone_number": call
    });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw

    };

    fetch("http://localhost:3000/teacher", requestOptions)
        .then((response) => response.text())
        .then((result) => {
            console.log(result);

            clearform();
        })
        .catch((error) => console.error(error));

}

async function clearform() {
    document.getElementById('teacherid').value = "";


    document.getElementById('fname').value = "";
    document.getElementById('lname').value = "";
    document.getElementById('ftname').value = "";
    document.getElementById('email').value = "";
    document.getElementById('degree').value = "";
    document.getElementById('subject').value = "";
    document.getElementById('gender').value = "";
    document.getElementById('phone').value = "";

}

async function save() {



    var apid = document.getElementById('teacherid').value;

    if (!apid) {
        await save_post();
    }
    else {
        await update(apid);
    }



}

async function edit(teacherid) {

    const requestOptions = {
        method: "GET",
        redirect: "follow"
    };

    fetch(`http://localhost:3000/teacher/${teacherid}`, requestOptions)
        .then((response) => response.text())
        .then((result) => {
            console.log(result);
            SETFORM(result);
            showform();
        })
        .catch((error) => console.error(error));



}

async function update(teacherid) {
    var url = 'http://localhost:3000/teachers/' + teacherid;
    document.getElementById('show-form').style.display = "block";
    document.getElementById('show-list').style.display = "none";

    var fname = document.getElementById('fname').value;
    var lname = document.getElementById('lname').value;
    var ftname = document.getElementById('ftname').value;
    var email = document.getElementById('email').value;
    var qual = document.getElementById('degree').value;
    var sub = document.getElementById('subject').value;
    var gen = document.getElementById('gender').value;
    var call = document.getElementById('phone').value;

    if (!email || !fname || !lname || !ftname || !qual || !sub || !gen || !call) {
        document.getElementById('msg-error').innerHTML = 'there is an error in submitting the form'
        console.log("All fields are required.");
        return;
    }

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
        "firstname": fname,
        "lastname": lname,
        "fathername": ftname,
        "email": email,
        "degree": qual,
        "subject": sub,
        "gender": gen,
        "phone_number": call
    });

    const requestOptions = {
        method: "PUT",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    fetch(url, requestOptions)
        .then((response) => response.text())
        .then((result) => {
            console.log(result);
            clearform();
            result = JSON.parse(result);
            document.getElementById('msg').innerHTML = result.message;
        })
        .catch((error) => console.error(error));


}

async function cut(teacherid) {
    var material = 'http://localhost:3000/teachers/' + teacherid;
    document.getElementById('show-form').style.display = "block";
    document.getElementById('show-list').style.display = "none";

    var ans = confirm('ARE YOU SURE YOU WANT TO DELETE?')
    if (!ans) {
        return;
    }


    const requestOptions = {
        method: "DELETE",
        redirect: "follow"
    };
    fetch(material, requestOptions)
        .then((response) => response.text())
        .then((result) => {
            console.log(result);
            result = JSON.parse(result);


            document.getElementById('msg').innerHTML = 'your form has been deleted';
        })
        .catch((error) => console.error(error));


}
function clearSearch() {

    document.getElementById('name').value = "";
    document.getElementById('id').value = "";

    Search(false);
}
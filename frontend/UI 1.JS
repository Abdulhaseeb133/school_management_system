async function Search(isSearch) {

    if (isSearch) {
        var stname = document.getElementById('name').value;
        var id = document.getElementById('roll').value;
        var areaname = document.getElementById('area').value;
    }
    else {
        var stname = "";
        var id = "";
        var areaname = "";
    }

    var output = await fetch(`http://localhost:3000/students?name=${stname}&rollno=${id}&areaid=${areaname}`)
    var data = await output.json();
    console.log(data);

    var result = "";
    data.data.forEach((element, index) => {
        result += `<tr>`;
        result += `<td>${element.rollno}</td>`;
        result += `<td>${element.email}</td>`;
        result += `<td>${element.firstname}</td>`;
        result += `<td>${element.lastname}</td>`;
        result += `<td>${element.fathername}</td>`;
        result += `<td>${element.class2}</td>`;
        result += `<td>${element.age}</td>`;
        result += `<td>${element.marks}</td>`;
        result += `<td>${element.fees}</td>`;
        result += `<td>${element.admission_year}</td>`;
        result += `<td>${element.areaname}</td>`;
        result += `<td>${element.gender}</td>`;
        result += `<td>${element.phone_number}</td>`;
        result += `<td><input type="button" onclick="edit(${element.studentid})" value="Edit" /></td>`;
        result += `<td><input type="button" onclick="cut(${element.studentid})" value="Delete" /></td>`;
        result += `</tr>`;

    });
    document.getElementById("list1").innerHTML = result;

}

async function loadStudents(isSearch, page) {

    if (isSearch) {
        var stname = document.getElementById('name').value;
        var id = document.getElementById('roll').value;
        var areaname = document.getElementById('area').value;
    }
    else {
        var stname = "";
        var id = "";
        var areaname = "";
    }

    page = page || 1;

    var output = await fetch(`http://localhost:3000/students?name=${stname}&rollno=${id}&areaid=${areaname}&page=` + page)
    var record = await output.json();
    console.log(record);

    var rows = "";
    record.data.forEach(element => {
        rows += `<td>${element.rollno}</td>`;
        rows += `<td>${element.email}</td>`;
        rows += `<td>${element.firstname}</td>`;
        rows += `<td>${element.lastname}</td>`;
        rows += `<td>${element.fathername}</td>`;
        rows += `<td>${element.class2}</td>`;
        rows += `<td>${element.age}</td>`;
        rows += `<td>${element.marks}</td>`;
        rows += `<td>${element.fees}</td>`;
        rows += `<td>${element.admission_year}</td>`;
        rows += `<td>${element.areaname}</td>`;
        rows += `<td>${element.gender}</td>`;
        rows += `<td>${element.phone_number}</td>`;
        rows += `<td><input type="button" onclick="edit(${element.studentid})" value="Edit" /></td>`;
        rows += `<td><input type="button" onclick="cut(${element.studentid})" value="Delete" /></td>`;
        rows += `</tr>`;

    });
    document.getElementById("list1").innerHTML = rows;


    var load = "";
    for (let i = 1; i <= record.totalPages; i++) {
        if (record.currentPage == i) {
            load += `<button class="style current-page" onclick="loadStudents(false,${i})">${i}</button>`;
        } else {
            load += `<button  class="style" onclick="loadStudents(false,${i})">${i}</button>`;
        }
    }
    document.getElementById("pagination").innerHTML = load;
}

loadStudents(false, 1);


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
    formdata.append("photo", myFile.files[0], "http://localhost:3000/uploads/students/default.png");

    const requestOptions = {
        method: "POST",
        body: formdata,
        redirect: "follow"
    };

    fetch(`http://localhost:3000/students/${document.getElementById('studentid').value}/profile-picture`, requestOptions)
        .then((response) => response.text())
        .then((result) => {
            console.log(result);
            result = JSON.parse(result);
            const imgEl = document.getElementById('student-img');
            imgEl.src = `http://localhost:3000${result.profile_picture}`;
            document.getElementById('msg').innerHTML = result.message;
        })
        .catch((error) => console.error(error));



}

async function SETFORM(studentdata) {
    var student = JSON.parse(studentdata);
    document.getElementById('studentid').value = student.studentid;

    document.getElementById('rollno').value = student.rollno;
    document.getElementById('email').value = student.email;
    document.getElementById('firstname').value = student.firstname;
    document.getElementById('lastname').value = student.lastname;
    document.getElementById('fathername').value = student.fathername;
    document.getElementById('class2').value = student.class2;
    document.getElementById('age').value = student.age;
    document.getElementById('marks').value = student.marks;
    document.getElementById('fees').value = student.fees;
    document.getElementById('admission_year').value = student.admission_year;
    document.getElementById('gender').value = student.gender;
    document.getElementById('phone_number').value = student.phone_number;
    document.getElementById('country').value = student.countryid;
    const imgEl = document.getElementById('student-img'); // must be <img id="student-img" />
    if (imgEl) {
        imgEl.src = student.profile_picture
            ? `http://localhost:3000${student.profile_picture}`
            : 'http://localhost:3000/uploads/students/default.png';  // or set a default placeholder URL here
        imgEl.alt = `${student.firstname || ''} ${student.lastname || ''}`.trim();
    }

    loadStudentLocation(student);


}

async function loadStudentLocation(student) {
    await getstate(); // wait until states are loaded
    document.getElementById('state').value = student.stateid;

    await getcity(); // wait until cities are loaded
    document.getElementById('city').value = student.cityid;

    await GETAREAS(); // wait until areas are loaded
    document.getElementById('areas').value = student.areaid;
}


async function save_post() {

    var rollno = document.getElementById('rollno').value;
    var email = document.getElementById('email').value;
    var fname = document.getElementById('firstname').value;
    var lname = document.getElementById('lastname').value;
    var ftname = document.getElementById('fathername').value;
    var C2 = document.getElementById('class2').value;
    var age = document.getElementById('age').value;
    var marks = document.getElementById('marks').value;
    var fee = document.getElementById('fees').value;
    var admissionyear = document.getElementById('admission_year').value;
    var aid = document.getElementById('areas').value;
    var gen = document.getElementById('gender').value;
    var call = document.getElementById('phone_number').value;

    //  document.getElementById('msg-success').innerHTML = 'your form has been submitted successfully'

    if (!rollno || !email || !fname || !lname || !ftname || !C2 || !age || !marks || !fee || !admissionyear || !aid || !call) {
        document.getElementById('msg-error').innerHTML = 'there is an error in submitting the form'
        console.log("All fields are required.");
        return;
    }

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
        "rollno": rollno,
        "email": email,
        "firstname": fname,
        "lastname": lname,
        "fathername": ftname,
        "class2": C2,
        "age": age,
        "marks": marks,
        "fees": fee,
        "admission_year": admissionyear,
        "areaid": aid,
        "gender": gen,
        "phone_number": call
    });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw

    };

    fetch("http://localhost:3000/students", requestOptions)
        .then((response) => response.text())
        .then((result) => {
            console.log(result);

            clearform();
        })
        .catch((error) => console.error(error));

}

async function clearform() {
    document.getElementById('studentid').value = "";


    document.getElementById('rollno').value = "";
    document.getElementById('email').value = "";
    document.getElementById('firstname').value = "";
    document.getElementById('lastname').value = "";
    document.getElementById('fathername').value = "";
    document.getElementById('class2').value = "";
    document.getElementById('age').value = "";
    document.getElementById('marks').value = "";
    document.getElementById('fees').value = "";
    document.getElementById('admission_year').value = "";
    document.getElementById('areaid').value = "";
    document.getElementById('gender').value = "";
    document.getElementById('phone_number').value = "";

}

async function save() {



    var apid = document.getElementById('studentid').value;

    if (!apid) {
        await save_post();
    }
    else {
        await update(apid);
    }



}

async function edit(studentid) {

    const requestOptions = {
        method: "GET",
        redirect: "follow"
    };

    fetch(`http://localhost:3000/students/${studentid}`, requestOptions)
        .then((response) => response.text())
        .then((result) => {
            console.log(result);
            SETFORM(result);
            showform();
        })
        .catch((error) => console.error(error));



}

async function update(studentid) {
    var url = 'http://localhost:3000/students/' + studentid;
    document.getElementById('show-form').style.display = "block";
    document.getElementById('show-list').style.display = "none";

    var rollno = document.getElementById('rollno').value;
    var email = document.getElementById('email').value;
    var fname = document.getElementById('firstname').value;
    var lname = document.getElementById('lastname').value;
    var ftname = document.getElementById('fathername').value;
    var C2 = document.getElementById('class2').value;
    var age = document.getElementById('age').value;
    var marks = document.getElementById('marks').value;
    var fee = document.getElementById('fees').value;
    var admissionyear = document.getElementById('admission_year').value;
    var aid = document.getElementById('areas').value;
    var gen = document.getElementById('gender').value;
    var call = document.getElementById('phone_number').value;

    if (!rollno || !email || !fname || !lname || !ftname || !C2 || !age || !marks || !fee || !admissionyear || !aid || !call) {
        document.getElementById('msg-error').innerHTML = 'there is an error in submitting the form'
        console.log("All fields are required.");
        return;
    }

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
        "rollno": rollno,
        "email": email,
        "firstname": fname,
        "lastname": lname,
        "fathername": ftname,
        "class2": C2,
        "age": age,
        "marks": marks,
        "fees": fee,
        "admission_year": admissionyear,
        "areaid": aid,
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

async function cut(studentid) {
    var information = 'http://localhost:3000/students/' + studentid;
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

    fetch(information, requestOptions)
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
    document.getElementById('roll').value = "";
    Search(false);
}
function check() {
    var input = localStorage.getItem('email');
    if (input) {
        document.getElementById("user-email").innerHTML = "hi " + input;
    }
    else {
        // window.location = "login.html";
    }
}
function logoutUser() {
    var ans = confirm("are you sure you want to logout")
    if (!ans) {
        return;
    }
    else {
        localStorage.clear();
        window.location = "login.html";
    }

}
//Search(false);
check();
GETCOUNTRY();
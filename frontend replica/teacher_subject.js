async function loadData() {

    var output = await fetch(`http://localhost:3000/teacher_subject`);
    var data = await output.json();
    console.log(data);

    var field = "";
    data.forEach((element, index) => {
        field += `<tr>`;
        field += `<td>${element.id}</td>`;
        field += `<td>${element.teacher_name}</td>`;
        field += `<td>${element.subjectname}</td>`;
        field += `<td><input type="button" onclick="cut(${element.id})" value="Delete" /></td>`;
        field += `</tr>`;

    });
    document.getElementById("list4").innerHTML = field;

}


async function loadTeachers() {
    var type = await fetch('http://localhost:3000/teacherdd');
    var source = await type.json();
    console.log(source);
    var option = "";
    option = '<option value ="">Please select a teacher</option>'
    source.forEach(element => {
        option += `<option value ="${element.teacherid}">${element.name}</option>`
    });
    document.getElementById('teacher').innerHTML = option;
}



async function loadsubjects() {
    var type = await fetch('http://localhost:3000/subjectdd');
    var source = await type.json();
    console.log(source);
    var option = "";
    option = '<option value ="">Please select a subject</option>'
    source.forEach(element => {
        option += `<option value ="${element.subjectid}">${element.subjectname}</option>`
    });
    document.getElementById('teacher_subject').innerHTML = option;
}
async function save_post() {
    var teacher = document.getElementById('teacher').value;
    var subject = document.getElementById('teacher_subject').value;
    //  document.getElementById('msg-success').innerHTML = 'your form has been submitted successfully'
    if (!teacher || !subject) {
        document.getElementById('msg-error').innerHTML = 'there is an error in submitting the form'
        console.log("All fields are required.");
        return;
    }

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
        "teacherid": teacher,
        "subjectid": subject
    });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    fetch("http://localhost:3000/teacher_subject", requestOptions)
        .then((response) => response.text())
        .then((result) => {
            console.log(result);
            result = JSON.parse(result);
            if (result.message) {
                document.getElementById('msg').innerHTML = result.message;
                document.getElementById('msg').classList.remove('error-text');
                document.getElementById('msg').classList.add('msg');
            }
            else {
                document.getElementById('msg').innerHTML = result.error;
                document.getElementById('msg').classList.remove('msg');
                document.getElementById('msg').classList.add('error-text');
            }
            loadData();
        })
        .catch((error) => console.error(error));

}

async function cut(id) {

    var information = 'http://localhost:3000/teacher_subject/' + id;


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
            loadData();

            document.getElementById('msg').innerHTML = 'your information has been deleted';
        })
        .catch((error) => console.error(error));


}

loadData();
loadTeachers();
loadsubjects();
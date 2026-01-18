async function SUBJECTS() {

    var output = await fetch(`http://localhost:3000/subject`);
    var data = await output.json();
    console.log(data);

    var field = "";
    data.forEach((element, index) => {
        field += `<tr>`;
        field += `<td>${element.subjectid}</td>`;
        field += `<td>${element.subjectname}</td>`;
        field += `<td>${element.subjectcode}</td>`;
        field += `<td>${element.description}</td>`;
        field += `<td>${new Date("2026-01-10T08:15:25.000Z")
            .toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric"
            })
            .replace(/ /g, "-")
            }</td>`;
        field += `<td><input type="button" onclick="edit(${element.subjectid})" value="Edit" /></td>`;
        field += `<td><input type="button" onclick="cut(${element.subjectid})" value="Delete" /></td>`;
        field += `</tr>`;

    });
    document.getElementById("list3").innerHTML = field;
}
SUBJECTS();
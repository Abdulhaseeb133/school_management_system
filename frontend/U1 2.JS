async function GETCOUNTRY() {
    var type = await fetch('http://localhost:3000/country');
    var source = await type.json();
    console.log(source);
    var option = "";
    option = '<option value ="">Please select a country</option>'
    source.forEach(element => {
        option += `<option value ="${element.countryid}">${element.countryname}</option>`
    });
    document.getElementById('country').innerHTML = option;
}

async function getstate() {
    var countryid = document.getElementById('country').value;
    console.log(countryid);
    if (!countryid) {
        document.getElementById('state').innerHTML = "";
        document.getElementById('city').innerHTML = "";
        document.getElementById('areas').innerHTML = "";

        return;


    }
    var app = await fetch(' http://localhost:3000/state/' + countryid)
    var reverse = await app.json();
    console.log(reverse);
    var pop = "";
    pop = '<option value ="">Please select a state</option>'
    reverse.forEach(element => {
        pop += `<option value ="${element.stateid}">${element.statename}</option>`
    });
    document.getElementById('state').innerHTML = pop;

}
async function getcity() {
    var stateid = document.getElementById('state').value;
    console.log(stateid);
    if (!stateid) {
        document.getElementById('city').innerHTML = "";
        document.getElementById('areas').innerHTML = "";
        return;

    }
    var work = await fetch(' http://localhost:3000/city/' + stateid)
    var read = await work.json();
    console.log(read);
    var give = "";
    give = '<option value ="">Please select a city</option>'
    read.forEach(element => {
        give += `<option value ="${element.cityid}">${element.cityname}</option>`
    });
    document.getElementById('city').innerHTML = give;

}
async function GETAREAS() {
    var cityid = document.getElementById('city').value;
    console.log(cityid);
    if (!cityid) {
        document.getElementById('areas').innerHTML = "";
        return;

    }
    var give = await fetch('http://localhost:3000/area/' + cityid)
    var program = await give.json();
    console.log(program);
    var area = ""
    area = '<option value ="">Please select a area</option>'
    program.forEach(element => {
        area += `<option value="${element.areaid}">${element.areaname}</option>`
    });
    document.getElementById('areas').innerHTML = area;

}
async function areadropdown() {


    var endpoint = await fetch('http://localhost:3000/area')
    var sql = await endpoint.json();
    console.log(sql);
    var areas = ""
    areas = '<option value ="">Please select a area</option>'
    sql.forEach(element => {
        areas += `<option value="${element.areaid}">${element.areaname}</option>`
    });
    document.getElementById('area').innerHTML = areas;
}
areadropdown();
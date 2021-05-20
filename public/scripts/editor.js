const baseURL = 'http://localhost:8081';
let currID = 0;

const initResetButton = () => {
    // if you want to reset your DB data, click this button:
    document.querySelector('#reset').onclick = ev => {
        fetch(`${baseURL}/reset/`)
            .then(response => response.json())
            .then(data => {
                console.log('reset:', data);
            });
    };
};

const showForm = ev => {
    document.querySelector('#companions').innerHTML =``;
    document.querySelector('#doctor').innerHTML = `
        <form name='form1'>
            <!-- Name -->
            <label for="name">Name</label>
            <br>
            <input type="text" id="name">
            <br>

            <!-- Seasons -->
            <label for="seasons">Seasons</label>
            <br>
            <input type="text" id="seasons">
            <br>

            <!-- Ordering -->
            <label for="ordering">Ordering</label>
            <br>
            <input type="text" id="ordering">
            <br>

            <!-- Image -->
            <label for="image_url">Image</label>
            <br>
            <input type="text" id="image_url">
            <br>

            <!-- Buttons -->
            <button class="btn btn-main" id="save">Save</button>
            <button class="btn" id="cancel">Cancel</button>
        </form>
    `;
    document.querySelector('#save').onclick = checkForm;
    document.querySelector('#cancel').onclick = cancelForm;
};

const checkEdit = ev => {
    let input = document.forms['form1']['name'].value;
    if (input == "") {
        alert("Please input a name for your new doctor")
        return 
    }
    
    input = document.forms['form1']['seasons'].value
    input = input.split(', ')
    console.log(input)
    input.forEach(function (item) {
        if (isNaN(item)) {
            alert("Please input your doctor's seasons as numbers separated by commas and *spaces*")
            return 
        }});

    submitEdit();
}

const submitEdit = () => {
    
    let newName = document.forms['form1']['name'].value;
    let newSeasons = document.forms['form1']['seasons'].value;
    newSeasons= newSeasons.split(', ').map(Number);
    let newOrdering = document.forms['form1']['ordering'].value;
    let newImage = document.forms['form1']['image_url'].value;
    
    fetch( `/doctors/${currID}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"name": newName, "seasons": newSeasons, "ordering": newOrdering, "image_url": newImage})
    })
    .then(response => response.json())
    .then(data => {
        const doctor = doctors.filter(doctor => doctor._id === currID)[0];
    
        document.querySelector('#doctor').innerHTML = `
            <div>    
            <h2>${newName}</h2>
            <a id='edit'> edit</a>
            <a id='delete'> delete</a>
            </div>
            <br>
            <img src="${newImage}" />
            <p>Seasons: ${newSeasons}</p>
            <br>
        `;
        document.querySelector('#edit').onclick = editForm;
        document.querySelector('#delete').onclick = deleteConfirm;
    });
    
}

const checkForm = ev => {
    let input = document.forms['form1']['name'].value;
    if (input == "") {
        alert("Please input a name for your new doctor")
        return
    }
    
    input = document.forms['form1']['seasons'].value
    input = input.split(', ')
    console.log(input)
    input.forEach(function (item) {
        if (isNaN(item)) {
            alert("Please input your doctor's seasons as numbers separated by commas and *spaces*")
            return
        }});

    submitForm();
    
};

const submitForm = () => {
    let newName = document.forms['form1']['name'].value;
    let newSeasons = document.forms['form1']['seasons'].value;
    newSeasons= newSeasons.split(', ').map(Number);
    let newOrdering = document.forms['form1']['ordering'].value;
    let newImage = document.forms['form1']['image_url'].value;
    
    fetch( `/doctors`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"name": newName, "seasons": newSeasons, "ordering": newOrdering, "image_url": newImage})
    })
    .then(response => response.json())
    .then(data => {
        const id = data._id;
        const doc = doctors.filter(doctor => doctor._id === id)[0];
        window.location.reload();
    });

}

const cancelForm = ev => {
    document.querySelector('#companions').innerHTML =``;
    document.querySelector('#doctor').innerHTML = ``;
};

const cancelEdit = ev => {
    const doctor = doctors.filter(doctor => doctor._id === currID)[0];
    
    
    document.querySelector('#doctor').innerHTML = `
        <div>    
        <h2>${doctor.name}</h2>
        <a id='edit'> edit</a>
        <a id='delete'> delete</a>
        </div>
        <br>
        <img src="${doctor.image_url}" />
        <p>Seasons: ${doctor.seasons}</p>
        <br>
    `;
    document.querySelector('#edit').onclick = editForm;
    document.querySelector('#delete').onclick = deleteConfirm;
};


const attachEventHandlers = () => {
    document.querySelector('#create').onclick = showForm;
    
    document.querySelectorAll('#doctors a').forEach(a => {
        a.onclick = showDetail;
    });
    
}

const editForm = ev => {
    const doctor = doctors.filter(doctor => doctor._id === currID)[0];
    document.querySelector('#doctor').innerHTML = `
        <form name='form1'>
            <!-- Name -->
            <label for="name">Name</label>
            <br>
            <input type="text" id="name" value=${doctor.name}>
            <br>

            <!-- Seasons -->
            <label for="seasons">Seasons</label>
            <br>
            <input type="text" id="seasons" value=${doctor.seasons}>
            <br>

            <!-- Ordering -->
            <label for="ordering">Ordering</label>
            <br>
            <input type="text" id="ordering" value=${doctor.ordering}>
            <br>

            <!-- Image -->
            <label for="image_url">Image</label>
            <br>
            <input type="text" id="image_url" value=${doctor.image_url}>
            <br>

            <!-- Buttons -->
            <button class="btn btn-main" id="save">Save</button>
            <button class="btn" id="cancel">Cancel</button>
        </form>
    `;
    document.querySelector('#cancel').onclick = cancelEdit;
    document.querySelector('#save').onclick = checkEdit;
};

const deleteConfirm = ev => {
    result = window.confirm('are you sure you wish to delete?')
    if (result) {
        deleteEntry();
        setTimeout(function(){window.location.reload();},70);
    }
    else {
        return
    }
};

const deleteEntry = ev => {
    const id = currID;
    const url = `/doctors/${id}`;
    fetch(url, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                // send to catch block:
                throw Error(response.statusText);
            } else {
                // because the endpoint returns a 
                // null value, use the text() method
                // instead of the .json() method:
                return response.text();
            }
        })
        .then(data => {
            console.log('Success:', data);
        })
        .catch(err => {
            console.error(err);
            alert('Error!');
        });
};

const showDetail = ev => {
    const id = ev.currentTarget.dataset.id;
    currID = id

    // find the current doctor from the doctors array:
    const doctor = doctors.filter(doctor => doctor._id === id)[0];
    console.log(doctor);
    
    // append the doctor template to the DOM:
    document.querySelector('#doctor').innerHTML = `
        <div>    
        <h2>${doctor.name}</h2>
        <a id='edit'> edit</a>
        <a id='delete'> delete</a>
        </div>
        <br>
        <img src="${doctor.image_url}" />
        <p>Seasons: ${doctor.seasons}</p>
        <br>
    `;
    document.querySelector('#edit').onclick = editForm;
    document.querySelector('#delete').onclick = deleteConfirm;

    fetch(`/doctors/${id}/companions`)
            .then(response => response.json())
            .then(data => {
                const listComps = data.map(item =>
                    `
                    <div>
                        <img src="${item.image_url}"/>
                        <a>${item.name}</a>
                    </div>`
                );
                document.getElementById('companions').innerHTML = `
                    <div> <h2>Companions</h2> ${listComps.join('')} </div>
                `
            });

}

// invoke this function when the page loads:
initResetButton();

let doctors;
//fetches all doctors in database to display on left panel
fetch('/doctors')
    .then(response => response.json())
    .then(data => {
        doctors = data;
        const listItems = data.map(item =>
            `
            <li>
                <a href="#" data-id="${item._id}">${item.name}</a>
            </li>`
        );
        document.getElementById('doctors').innerHTML = `
            <ul>
                ${listItems.join('')}
            </ul>
            `
    })
    .then(attachEventHandlers);








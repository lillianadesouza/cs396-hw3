const baseURL = 'http://localhost:8081';

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

const checkForm = ev => {
    let input = document.forms['form1']['name'].value;
    console.log(input)
    if (input == "") {
        alert("Please input a name for your new doctor")
        return
    }
    
    input = document.forms['form1']['seasons'].value
    input = input.split(', ')
    console.log(input)
    for(input1 in input) {
        if (isNaN(input1)) {
            alert("Please input your doctor's seasons as numbers separated by commas")
            return
        }
    }
    
};

const cancelForm = ev => {
    document.querySelector('#companions').innerHTML =``;
    document.querySelector('#doctor').innerHTML = ``;
};


const attachEventHandlers = () => {
    document.querySelector('#create').onclick = showForm;
    
    document.querySelectorAll('#doctors a').forEach(a => {
        a.onclick = showDetail;
    });
    
}

const editForm = ev => {
    document.querySelector('#companions').innerHTML =``;
    document.querySelector('#doctor').innerHTML = ``;
};

const deleteConfirm = ev => {
    
};

const showDetail = ev => {
    const id = ev.currentTarget.dataset.id;

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








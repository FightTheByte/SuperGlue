async function saveTabInfo(){
    const indicator = await document.getElementById("indicator");
    await chrome.tabs.query(
        {
            pinned: true,
        },
        (tabs) => {
            if(tabs.length === 0){
                alert('no pinned tabs to save')
                return;
            }
            let urlObject = {};
            tabs.forEach((tab, index) => {
                urlObject[index] = tab.url;
            });
            localStorage.setItem(getKey(), JSON.stringify(urlObject));
            indicator.classList.remove("red");
            indicator.classList.add("green");
        }
    );
};

function getKey(){
    const radio1 = document.getElementById("radio1");
    const radio2 = document.getElementById("radio2");
    const key = radio1.checked
    ?"superglue1"
    :radio2.checked
    ?"superglue2"
    :"superglue3"
    return key;
}

async function restoreTabInfo(){
    const urls = await JSON.parse(localStorage.getItem(getKey()));
    if(urls == undefined || urls == null){
        alert('no saved tabs')
        return;
    }
    await chrome.tabs.query(
        {
            pinned: true,
        },
        (tabs) => {
            tabs.forEach(async(tab) => {
                await chrome.tabs.remove(tab.id);
            })
        }
    );
    Object
    .keys(urls)
    .forEach((key) => {
        chrome.tabs.create(
            {
                pinned: true,
                url: urls[key]
            }
        )
    })
};

async function handleClickSave(){
    await saveTabInfo();
}; 

function handleClickRestore(){
    restoreTabInfo();
};

function handleClickDelete(){
    let key = getKey();
    if(confirm(`Are you sure you want to delete save in slot ${key[9]}`)){
        localStorage.setItem(key, null);
    };
    checkSave(key);
}

async function checkSave(saveSlot){
    const indicator = await document.getElementById("indicator");
    const urls = await JSON.parse(localStorage.getItem(saveSlot));
    if(urls === null){
        indicator.classList.remove("green");
        indicator.classList.add("red");
    } else {
        indicator.classList.remove("red");
        indicator.classList.add("green");
    }
}

document.addEventListener('DOMContentLoaded', async function(){
    await checkSave('superglue1');

    const radio1 = document.getElementById("radio1");
    const radio2 = document.getElementById("radio2");
    const radio3 = document.getElementById("radio3");
    radio1.onclick = () => checkSave("superglue1");
    radio2.onclick = () => checkSave("superglue2");
    radio3.onclick = () => checkSave("superglue3");

    const saveButton = document.getElementById("save-tabs");
    saveButton.addEventListener('click', handleClickSave);

    const restoreButton = document.getElementById("restore-tabs");
    restoreButton.addEventListener('click', handleClickRestore);

    const deleteButton = document.getElementById("delete-tabs");
    deleteButton.addEventListener('click', handleClickDelete);
});


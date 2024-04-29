async function saveTabInfo(){
    const indicator = await document.getElementById("indicator");
    let key = getKey();

    const bookmark = await new Promise((resolve) => {
        chrome.bookmarks.search(
            {
                title: key
            },
            (bookmark) => {
                resolve(bookmark)
            }
        )
    })
    
    let id = bookmark[0].id;

    await new Promise((resolve) => {
        chrome.bookmarks.removeTree(id, () => {
            resolve();
        })
    })

    const folder = await new Promise((resolve) => {
        chrome.bookmarks.create(
            {
                parentId: "1",
                title: key
            },
            (folder) => {
                resolve(folder);
            }
        )
    })
    
    const tabs = await new Promise((resolve) => {
        chrome.tabs.query(
            {
                pinned: true
            },
            (tabs) => {
                resolve(tabs);
            }
        )
    })

    if(tabs.length === 0){
        alert('no pinned tabs to save')
        return;
    }

    tabs.forEach((tab, index) => {
        chrome.bookmarks.create({
            parentId: folder.id,
            title: String(index),
            url: tab.url 
        })
    });
            
    indicator.classList.remove("red");
    indicator.classList.add("green");

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

async function deleteBookmarks(){
    const indicator = await document.getElementById("indicator");
    let key = getKey();

    const bookmark = await new Promise((resolve) => {
        chrome.bookmarks.search(
            {
                title: key
            },
            (bookmark) => {
                resolve(bookmark)
            }
        )
    })
    
    let id = bookmark[0].id;

    await new Promise((resolve) => {
        chrome.bookmarks.removeTree(id, () => {
            resolve();
        })
    })

    const folder = await new Promise((resolve) => {
        chrome.bookmarks.create(
            {
                parentId: "1",
                title: key
            },
            (folder) => {
                resolve(folder);
            }
        )
    })

    indicator.classList.remove("green");
    indicator.classList.add("red");
}

async function restoreTabInfo(){

    const bookmark = await new Promise((resolve) => {
        chrome.bookmarks.search(
            {
                title: getKey()
            },
            (bookmark) => {
                resolve(bookmark);
            }
        )
    })
    
    const urls = await new Promise((resolve) => {
        chrome.bookmarks.getChildren(bookmark[0].id,
        (tree) => {
            resolve(tree)
        })
    })
    
    console.log(urls)
    if(urls.length === 0){
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
    
    urls.forEach((url) => {
        chrome.tabs.create(
            {
                pinned: true,
                url: url.url
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
        deleteBookmarks();
    };
    checkSave(key);
}

async function checkSave(){
    const bookmark = await new Promise((resolve) => {
        chrome.bookmarks.search(
            {
                title: getKey()
            },
            (bookmark) => {
                resolve(bookmark);
            }
        )
    })
    
    const urls = await new Promise((resolve) => {
        chrome.bookmarks.getChildren(bookmark[0].id,
        (tree) => {
            resolve(tree)
        })
    })
    

    if(urls.length === 0){
        indicator.classList.remove("green");
        indicator.classList.add("red");
    } else {
        indicator.classList.remove("red");
        indicator.classList.add("green");
    }
}

function checkBookmarks(){
    chrome.bookmarks.search(
        {title: "superglue1"},
        (bookmarks) => {
            if(bookmarks.length === 0){
                for(let i = 1; i < 4; i++ ){
                    chrome.bookmarks.create(
                        {
                            parentId: "1",
                            title: `superglue${i}`
                        }
                    )
                }    
            }
        }
    )
}

document.addEventListener('DOMContentLoaded', async function(){
    await checkBookmarks();
    await checkSave();

    const radio1 = document.getElementById("radio1");
    const radio2 = document.getElementById("radio2");
    const radio3 = document.getElementById("radio3");
    radio1.onclick = () => checkSave();
    radio2.onclick = () => checkSave();
    radio3.onclick = () => checkSave();

    const saveButton = document.getElementById("save-tabs");
    saveButton.addEventListener('click', handleClickSave);

    const restoreButton = document.getElementById("restore-tabs");
    restoreButton.addEventListener('click', handleClickRestore);

    const deleteButton = document.getElementById("delete-tabs");
    deleteButton.addEventListener('click', handleClickDelete);
});


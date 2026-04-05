let fileHandle;
let currentData = {};

const loadBtn = document.getElementById('loadBtn');
const saveBtn = document.getElementById('saveBtn');
const container = document.getElementById('base_div_id');
const fileNameDisplay = document.getElementById('fileNameDisplay');

// פונקציה רקורסיבית לרינדור הטבלה
// פונקציה רקורסיבית משופרת עם "נתיב" (path)
function renderTable(data, path = []) {
    if (typeof data !== 'object' || data === null) {
        return `<div contenteditable="true" class="value-node" data-path='${JSON.stringify(path)}'>${data === null ? '' : data}</div>`;
    }

    let html = '<table class="table1">';
    for (const key in data) {
        const currentPath = [...path, key];
        html += `
            <tr>
                <td class="label-cell">
                    <div contenteditable="true" class="key-node" data-path='${JSON.stringify(currentPath)}'>${key}</div>
                    <button class="add-row-btn" onclick="addNewSibling('${JSON.stringify(path).replace(/'/g, "\\'")}', '${key}')">+</button>
                </td>
                <td>
                    ${renderTable(data[key], currentPath)}
                </td>
            </tr>`;
    }
    html += '</table>';
    return html;
}

// פונקציה להוספת "אח" (Sibling) מתחת למפתח קיים
window.addNewSibling = (parentPathStr, afterKey) => {
    const parentPath = JSON.parse(parentPathStr);
    
    // מוצאים את האובייקט ההורה בתוך currentData
    let parentObj = currentData;
    for (const p of parentPath) {
        parentObj = parentObj[p];
    }

    // יצירת אובייקט חדש עם המפתח החדש במיקום הנכון (אחרי afterKey)
    const newObj = {};
    for (const [key, value] of Object.entries(parentObj)) {
        newObj[key] = value;
        if (key === afterKey) {
            newObj["מפתח_חדש"] = null; // ערך ברירת מחדל
        }
    }

    // עדכון המודל ורינדור מחדש
    if (parentPath.length === 0) {
        currentData = newObj;
    } else {
        // עדכון הרפרנס בתוך currentData
        let target = currentData;
        for (let i = 0; i < parentPath.length - 1; i++) {
            target = target[parentPath[i]];
        }
        target[parentPath[parentPath.length - 1]] = newObj;
    }

    container.innerHTML = renderTable(currentData);
};

// טעינת קובץ
loadBtn.addEventListener('click', async () => {
    try {
        [fileHandle] = await window.showOpenFilePicker({
            types: [{ description: 'YAML Files', accept: { 'text/yaml': ['.yaml', '.yml'] } }]
        });
        
        const file = await fileHandle.getFile();
        const content = await file.text();
        
        currentData = jsyaml.load(content);
        fileNameDisplay.textContent = file.name;
        
        container.innerHTML = renderTable(currentData);
        
    } catch (err) {
        console.error("טעינה בוטלה או נכשלה", err);
    }
});

// שמירת קובץ
saveBtn.addEventListener('click', async () => {
    if (!fileHandle) {
        alert("אנא טען קובץ קודם");
        return;
    }

    // כאן צריך "לקצור" את הנתונים מה-DOM בחזרה ל-JSON
    // לצורך הפשטות בשלב זה, נשתמש במידע הקיים. 
    // הערה: בשלב הבא נצטרך להוסיף פונקציה שסורקת את ה-DOM ומעדכנת את currentData
    
    try {
        const yamlString = jsyaml.dump(currentData);
        const writable = await fileHandle.createWritable();
        await writable.write(yamlString);
        await writable.close();
        alert("הקובץ נשמר בהצלחה!");
    } catch (err) {
        console.error("שמירה נכשלה", err);
    }
});

// האזנה לשינויי טקסט ועדכון ה-currentData בהתאם
container.addEventListener('blur', (e) => {
    if (e.target.hasAttribute('data-path')) {
        const path = JSON.parse(e.target.getAttribute('data-path'));
        const newValue = e.target.innerText;
        updateDataAtPath(currentData, path, newValue);
    }
}, true);

function updateDataAtPath(obj, path, value) {
    let current = obj;
    for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
    }
    
    const lastKey = path[path.length - 1];
    
    // אם זה שינוי של מפתח (Key) זה יותר מורכב, כרגע זה מעדכן ערכים (Values)
    current[lastKey] = value;
}
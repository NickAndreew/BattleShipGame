-$("#logOutButtonId").on("click", function(){
    $.post("/api/logout").done(function() { console.log("logged out"); window.location.href = "/web/authentication.html";});
});

$("#createGameButton").on("click", function(){
    $.post("/api/createGame").done(function(response) { console.log("game has been created -> "+response);
        window.location.href = "/web/game_play.html?gp="+response;
    }).fail(function(){ console.log("failed to create new game!")});
});


loadTables();
createLeaderBoard();

var counter = 0 ;
var counter1 = 0 ;
var data;

window.setInterval(function(){

    $.getJSON("/api/games", function(newData){
        if(counter!=newData.games.length){
            loadTables();
            console.log("Games List updated!");
        }
    });
    $.getJSON("http://localhost:8080/api/leaderboard/", function (data){
        if(counter1!=data.length){
            createLeaderBoard();
            console.log("Leader Board updated!");
        }
    });

//    $("#tableId").find("tbody").remove();
//    $("#leaderBoardId").find("tbody").remove();

    console.log("Page reloaded");
}, 3000);

function loadTables(){
    $("#tableId").find("tbody").remove();
    $.getJSON("/api/games", function(newData){

        data = newData;
        console.log(data);
        $("#userEmailId").text(data.player.email);

        var tbody = document.createElement("tbody");
        $("#tableId").append(tbody);

        counter = data.games.length;

        for(var i=0; i<=data.games.length-1 ;i++){
            if(data.games[i].over==false){
                var tr = document.createElement("tr");
                tbody.append(tr);

                var td = document.createElement("td");
                $(td).attr("class", "td1");
                $(td).text(data.games[i].id);
                tr.append(td);
                var td1 = document.createElement("td");
                $(td1).attr("class", "td2");
                if(data.games[i].gamePlays.length > 1){
                    $(td1).text(data.games[i].gamePlays[0].player.email+"  vs.  "+data.games[i].gamePlays[1].player.email);
                } else if(data.games[i].gamePlays.length == 1){
                    $(td1).text(data.games[i].gamePlays[0].player.email+"  vs.  - - - ");
                }
                tr.append(td1);
                var td2 = document.createElement("td");
                $(td2).attr("class", "td3");
                if (data.games[i].gamePlays.length==1 && data.player.email!=data.games[i].gamePlays[0].player.email){
                    var a = document.createElement("a");
                    a.setAttribute("onclick", "joinGame("+data.games[i].id+");");
                    a.setAttribute("class", "buttonTablCl");
                    a.setAttribute("data-attribute", data.games[i].id);
                    $(a).text("Join");
                    $(a).css("color", "green");
                    td2.append(a);
                    tr.append(td2);
                } else if (data.games[i].gamePlays.length==1 && data.player.email==data.games[i].gamePlays[0].player.email) {
                    var a = document.createElement("a");
                    a.setAttribute("class", "buttonTablCl");
                    if(data.player.email==data.games[i].gamePlays[0].player.email){
                        a.setAttribute("onclick", "continueGame("+data.games[i].gamePlays[0].gamePlay_id+");");
                    }
                    $(a).text("Continue");
                    $(a).css("color", "darkgreen");
                    td2.append(a);
                    tr.append(td2);
                } else if (data.games[i].gamePlays.length > 1) {
                    if (data.player.email==data.games[i].gamePlays[0].player.email | data.player.email==data.games[i].gamePlays[1].player.email){
                        var a = document.createElement("a");
                        a.setAttribute("class", "buttonTablCl");
                        if(data.player.email==data.games[i].gamePlays[0].player.email){
                            a.setAttribute("onclick", "continueGame("+data.games[i].gamePlays[0].gamePlay_id+");");
                        } else if(data.player.email==data.games[i].gamePlays[1].player.email){
                            a.setAttribute("onclick", "continueGame("+data.games[i].gamePlays[1].gamePlay_id+");");
                        }
                        $(a).text("Continue");
                        $(a).css("color", "darkgreen");
                        td2.append(a);
                        tr.append(td2);
                    } else {

                        tr.append(td2);
                    }
                } else {
                    $(td2).text("Waiting for Opponent");
                    tr.append(td2);
                }
            } else if (data.player.email==data.games[i].gamePlays[0].player.email | data.player.email==data.games[i].gamePlays[1].player.email) {
                var tr = document.createElement("tr");
                tbody.append(tr);
                var td = document.createElement("td");
                $(td).attr("class", "td1");
                $(td).text(data.games[i].id);
                tr.append(td);
                var td1 = document.createElement("td");
                $(td1).attr("class", "td2");
                $(td1).text(data.games[i].gamePlays[0].player.email+" vs. "+data.games[i].gamePlays[1].player.email);
                tr.append(td1);
                var td2 = document.createElement("td");
                $(td2).attr("class", "td3");

                if (data.player.email==data.games[i].gamePlays[0].player.email | data.player.email==data.games[i].gamePlays[1].player.email){
                    var a = document.createElement("a");
                    a.setAttribute("class", "buttonTablCl");
                    if(data.player.email==data.games[i].gamePlays[0].player.email){
                        a.setAttribute("onclick", "continueGame("+data.games[i].gamePlays[0].gamePlay_id+");");
                    } else if(data.player.email==data.games[i].gamePlays[1].player.email){
                        a.setAttribute("onclick", "continueGame("+data.games[i].gamePlays[1].gamePlay_id+");");
                    }
                    $(a).text("Review");
                    $(a).css("color", "red");
                    td2.append(a);
                    tr.append(td2);
                } else {

                    tr.append(td2);
                }
            }
        }
    });
}


function joinGame(gameID){
    $.post("/api/games/" + gameID + "/players").done(function(response) {
        var ID = response;
        console.log("you have joined the game!");
        window.location.href = "https://vast-waters-37875.herokuapp.com/web/game_play.html?gp="+response;
    }).fail(function(){console.log("fail!");});
}

function continueGame(gamePlay_id){
    window.location.href = "https://vast-waters-37875.herokuapp.com/web/game_play.html?gp="+gamePlay_id;
}

function createLeaderBoard(){
    $("#leaderBoardId").find("tbody").remove();
    var tbody = document.createElement("tbody");

    $.getJSON( "https://vast-waters-37875.herokuapp.com/api/leaderboard/", function (data){

        counter1 = data.length;

        for(var i = 0 ; i<=data.length-1 ; i++){
            $(tbody).append($("<tr>").append($("<td>").text(data[i].player.email)).append($("<td>").text(data[i].total_scores)).append($("<td>").text(data[i].wins_total)).append($("<td>").text(data[i].ties_total)).append($("<td>").text(data[i].loses_total)));
        }
        $("td").attr("style", "text-align:center");
        $(tbody).find("td").attr("class", "tdLeaderBoardCl");
    });
    $("#leaderBoardId").append(tbody)
};

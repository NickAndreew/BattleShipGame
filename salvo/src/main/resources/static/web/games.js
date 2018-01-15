$("#logOutButtonId").on("click", function(){
    $.post("/api/logout").done(function() { console.log("logged out"); window.location.href = "/web/authentication.html";});
});

$("#createGameButton").on("click", function(){
    $.post("/api/createGame").done(function(response) { console.log("game has been created -> "+response);
        window.location.href = "/web/game_play.html?gp="+response;
    }).fail(function(){ console.log("failed to create new game!")});
});

createLeaderBoard();
var data;

$.getJSON("/api/games", function(newData){

    data = newData;
    console.log(data);
    $("#userEmailId").text(data.player.email);

    var tbody = $("#tableId").find("tbody");

    for(var i=0; i<=data.games.length-1 ;i++){
        var tr = document.createElement("tr");
        tbody.append(tr);

        var td = document.createElement("td");
        $(td).text(data.games[i].id);
        tr.append(td);
        var td1 = document.createElement("td");
        if(data.games[i].gamePlays.length > 1){
            $(td1).text(data.games[i].gamePlays[0].player.email+" vs. "+data.games[i].gamePlays[1].player.email);
        } else if(data.games[i].gamePlays.length == 1){
            $(td1).text(data.games[i].gamePlays[0].player.email);
        }
        tr.append(td1);
        var td2 = document.createElement("td");
        if (data.games[i].gamePlays.length==1 && data.player.email!=data.games[i].gamePlays[0].player.email){
            var a = document.createElement("a");
            a.setAttribute("onclick", "joinGame("+data.games[i].id+");");
            a.setAttribute("class", "buttonCl");
            a.setAttribute("data-attribute", data.games[i].id);
            $(a).text("Join");
            td2.append(a);
            tr.append(td2);
        } else if (data.games[i].gamePlays.length==1 && data.player.email==data.games[i].gamePlays[0].player.email) {
            var a = document.createElement("a");
            a.setAttribute("class", "buttonCl");
            if(data.player.email==data.games[i].gamePlays[0].player.email){
                a.setAttribute("href", "/web/game_play.html?gp="+data.games[i].gamePlays[0].gamePlay_id);
            }
            $(a).text("Continue");
            td2.append(a);
            tr.append(td2);
        } else if (data.games[i].gamePlays.length > 1) {
            if (data.player.email==data.games[i].gamePlays[0].player.email | data.player.email==data.games[i].gamePlays[1].player.email){
                var a = document.createElement("a");
                a.setAttribute("class", "buttonCl");
                if(data.player.email==data.games[i].gamePlays[0].player.email){
                    a.setAttribute("href", "/web/game_play.html?gp="+data.games[i].gamePlays[0].gamePlay_id);
                } else if(data.player.email==data.games[i].gamePlays[1].player.email){
                    a.setAttribute("href", "/web/game_play.html?gp="+data.games[i].gamePlays[1].gamePlay_id);
                }
                $(a).text("Continue");
                td2.append(a);
                tr.append(td2);
            } else {

                tr.append(td2);
            }
        } else {
            $(td2).text("Waiting for Opponent");
            tr.append(td2);
        }
    }
});

function joinGame(gameID){
    $.post("/api/games/" + gameID + "/players").done(function(response) {
        var ID = response;
        console.log("you have joined the game!");
        window.location.href = "game_play.html?gp="+response;
    }).fail(function(){console.log("fail!");});
}

function createLeaderBoard(){
    $.getJSON("http://localhost:8080/api/leaderboard/", function (data){
        for(var i = 0 ; i<=data.length-1 ; i++){
            $("#leaderBoardId").append($("<tr>").append($("<td>").text(data[i].player.email)).append($("<td>").text(data[i].total_scores)).append($("<td>").text(data[i].wins_total)).append($("<td>").text(data[i].loses_total)).append($("<td>").text(data[i].ties_total)));
        }
        $("td").attr("style", "text-align:center");
    });
};

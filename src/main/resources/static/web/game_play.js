//// HIDES TABLE FOR PLAYER SHOTS BEFORE THE START OF THE GAME: .....
$("#enemiesTableId").attr("style", "display:none");
$("#makeShotsButtonID").hide();
$("#allStatsDivId").hide();
$("#enemyShipsConditionDivId").hide();
$("#gameViewUnloadedId").hide();
$("#alertMessage").text("");


//// HANDLES LOG OUT: .....
$("#logOutButtonId").click(function(){
    $.post("/api/logout").done(function() { console.log("logged out"); window.location.href = "/web/authentication.html";});
});

loadMainJsonAndMethods();

window.setInterval(function(){
    reloadMainJson();
    console.log("Page reloaded");
}, 3000);


//// LOADS THE MAIN JSON FOR THE CURRENT GAME PLAY: .....
function loadMainJsonAndMethods(){
    var enemyEmail;
    var state;

    var locationBrowser = window.location.search.split("?gp=")[1];
    $.getJSON("/api/game_view/"+locationBrowser, function(data){
        if (data!="") {
            enemyEmail = data.enemy;
            state = data.state;

            if(enemyEmail == ""){
                enemyEmail = "Waiting for player to join..";
            }

            $("#enemyId").text("Opponent: "+enemyEmail);
            $("#stateId").text("State: "+state);
            $("#userEmailId").text(data.player.email);
            if(data.ships.length!=0){
                $("#putShipsButtonId").hide();
                $("#enemyShipsConditionDivId").show();
            }
            createListOfLocations();
        //    createListOfPlayerSalvoes();
        //    createListOfEnemiesSalvoes();
            createGridTable();
            createGridOfPlayersShots();
            putPlayersShotsOnTheGrid();
        //    putEnemiesShotsOnPlayersGrid();
            putShipsOnGrid();
            createSalvoHistory();

            var countYrShots = 0;
            var countEnShots = 0;
            var countYrHits = 0;
            var countEnHits = 0;
            var countYrMisses = 0;
            var countEnMisses = 0;
            var countYrShpsSunked = 0;
            var countEnShpsSunked = 0;


            //// CHECK THE GAME FOR 'GAME OVER'
            if(data.state=="won"){
                $("#gamePlayDivId").css({"display": "none"});
                $("#enemyShipsConditionDivId").css({"display": "none"});
                $("#gameOverDivId").css({"display": "block"});
                $("#stateGameOverId").css("color", "darkgreen");
                $("#gameOverStatsId").css({"display": "block"});
            } else if(data.state=="lost"){
                $("#gamePlayDivId").css({"display": "none"});
                $("#enemyShipsConditionDivId").css({"display": "none"});
                $("#gameOverDivId").css({"display": "block"});
                $("#stateGameOverId").css("color", "darkred");
                $("#gameOverStatsId").css({"display": "block"});
            } else if(data.state=="tie"){
                $("#gamePlayDivId").css({"display": "none"});
                $("#enemyShipsConditionDivId").css({"display": "none"});
                $("#gameOverDivId").css({"display": "block"});
                $("#stateGameOverId").css("color", "darkgray");
                $("#gameOverStatsId").css({"display": "block"});
            } else if (data.state=="enemy_places_ships" | data.state=="place_ships" | data.state=="waiting_for_player_to_join") {
                $("#makeShotsButtonID").hide();
                $("#enemyShipsConditionDivId").hide();
            } else {
                $("#makeShotsButtonID").show();
                $("#enemyShipsConditionDivId").show();
            }

            if($("#gameOverStatsId").css("display")=="block"){
                $("#yourShotsId").text(countYrShots);
                $("#enemyShotsId").text(countEnShots);
                $("#yourHitsId").text(countYrHits);
                $("#enemyHitsId").text(countEnHits);
                $("#yourShipsSunkedId").text(countYrShpsSunked);
                $("#enemyShipsSunkedId").text(countEnShpsSunked);
                $("#yourMissesId").text(countYrMisses);
                $("#enemyMissesId").text(countEnMisses);
            }

            //// FUNCTIONS FOR FILLING OUT THE PAGE WITH INFO
            function createListOfLocations(){
                for(var i = 0; i <=data.ships.length-1 ;i++){
                    $("#shipLocationsListId").append($("<p>").text("Ship Type: "+data.ships[i].type+", located at: "+data.ships[i].location).attr("class", "paragrCl"));
                }
            }

            function createListOfPlayerSalvoes(){
                for(var i = 0; i <=data.your_salvos.length-1 ;i++){
                    $("#salvoesLocationListId").append($("<p>").text("Player: "+data.your_salvos[i].player.email+" on the turn "+data.your_salvos[i].turn+", made a shot on: "+data.your_salvos[i].location).attr("class", "paragrCl"));
                }
            }

            function createListOfEnemiesSalvoes(){
                for(var i = 0; i <=data.enemies_salvos.length-1 ;i++){
                    $("#enemiesSalvoesListId").append($("<p>").text("Enemy: "+data.enemies_salvos[i].player.email+" on the turn "+data.enemies_salvos[i].turn+", made a shot on: "+data.enemies_salvos[i].location).attr("class", "paragrCl"));
                }
            }

            function createGridTable() {
                var grid = document.createElement("table");
                grid.setAttribute("class", "table-striped table-condenced");
                grid.setAttribute("id", "yourTableId");
                var letters = ["","A","B","C","D","E","F","G","H","I","J"];
                for (var i = 0; i < 11; i++) {
                    var row = document.createElement("tr");
                    grid.appendChild(row);


                    for (var j = 0; j < 11; j++) {
                        var cell = document.createElement("td");
                        cell.setAttribute("class", "cellClass");
                        if(j==0 && i!=0){
                            $(cell).text(i);
                        }
                        if(i==0 && j!=0){
                            $(cell).text(letters[j]);
                        }

                        if (i != 0 && j != 0) {
                            row.appendChild(cell);
                            var hit = document.createElement("div");
                                hit.setAttribute("class", "hitCl");
                            var miss = document.createElement("div");
                                miss.setAttribute("class", "missCl");
                            cell.setAttribute("ondrop", "drop(event)");
                            cell.setAttribute("ondragover", "allowDrop(event)");
                            cell.setAttribute("data-location", (letters[j]+i));
                            cell.append(hit);
                            cell.append(miss);
                        } else {
                            row.appendChild(cell);
                        }
                    }
                }
                document.getElementById("yourTableId").appendChild(grid);
            }

            function createGridOfPlayersShots() {
                var grid = document.createElement("table");
                grid.setAttribute("class", " table-striped table-condenced");
                grid.setAttribute("id", "enemiesTableId");
                var letters = ["","A","B","C","D","E","F","G","H","I","J"];
                for (var i = 0; i < 11; i++) {
                    var row = document.createElement("tr");
                    grid.appendChild(row);


                    for (var j = 0; j < 11; j++) {
                        var cell = document.createElement("td");
                        cell.setAttribute("class", "cellClass");
                        if(j==0 && i!=0){
                            $(cell).text(i);
                        }
                        if(i==0 && j!=0){
                            $(cell).text(letters[j]);
                        }

                        if (i != 0 && j != 0) {
                            row.appendChild(cell);
                            var MS = "makeShot('"+(letters[j]+i)+"')";
                            var hit = document.createElement("div");
                            hit.setAttribute("class", "hitCl");
                            var miss = document.createElement("div");
                            var sight = document.createElement("div");
                            sight.setAttribute("class", "sightCl");
                            miss.setAttribute("class", "missCl");
                            cell.setAttribute("onclick", MS);
                            cell.setAttribute("data-location", (letters[j]+i));
                            cell.setAttribute("clickable", "true");
                            cell.append(hit);
                            cell.append(miss);
                            cell.append(sight);
                        } else {
                            row.appendChild(cell);
                        }
                    }
                }
                document.getElementById("enemiesTableId").appendChild(grid);
            }



            //// PLACES SHIPS ON THE GRID WHEN THEY ARE ALREADY ADDED TO THE GAME PLAY .....
            function putShipsOnGrid(){
                if(data.ships.length == 5){
                    $(".h_v").hide();
                    $("#shipsContainerId").hide();
                    $("#enemiesTableId").show();
                    $("#allStatsDivId").show();

                    for(var i=0; i<=data.ships.length-1 ; i++){
                        if(data.ships[i].type == "CARRIER"){
                            for(var j=0 ; j <= 1 ; j++){
                                if(data.ships[i].location[j].split("")[0]==data.ships[i].location[j+1].split("")[0]){
                                    //verical
                                    $("#yourTableId").find("[data-location="+data.ships[i].location[0]+"]").append($("#drop1"));
                                    $("#drop1").attr("draggable", "false");
                                    $(".carrier").css({"background-image": "url('/s-v.png')", "background-size": "75px 710px", "background-position-x": "0px", "background-position-y": "0px", "height": "200px", "width": "39px", "overflow": "hidden"});
                                } else if(data.ships[i].location[j].split("")[1]==data.ships[i].location[j+1].split("")[1]){
                                    //horizontal
                                    $("#yourTableId").find("[data-location="+data.ships[i].location[0]+"]").append($("#drop1"));
                                    $("#drop1").attr("draggable", "false");
                                    $(".carrier").css({"background-image": "url('/s-h.png')", "background-size": "710px 75px", "background-position-x": "-0px", "background-position-y": "38px", "width": "200px", "height": "39px", "overflow": "hidden"});
                                }

                            }
                        }

                        if(data.ships[i].type == "BATTLESHIP"){
                            for(var j=0 ; j <= 1 ; j++){
                                if(data.ships[i].location[j].split("")[0]==data.ships[i].location[j+1].split("")[0]){
                                    //verical
                                    $("#yourTableId").find("[data-location="+data.ships[i].location[0]+"]").append($("#drop2"));
                                    $("#drop2").attr("draggable", "false");
                                    $(".battleship").css({"background-image": "url('/s-v.png')", "background-size": "75px 710px", "background-position-x": "0px", "background-position-y": "-200px", "height": "160px", "width": "39px", "overflow": "hidden"});
                                } else if(data.ships[i].location[j].split("")[1]==data.ships[i].location[j+1].split("")[1]){
                                    //horizontal
                                    $("#yourTableId").find("[data-location="+data.ships[i].location[0]+"]").append($("#drop2"));
                                    $("#drop2").attr("draggable", "false");
                                    $(".battleship").css({"background-image": "url('/s-h.png')", "background-size": "710px 75px", "background-position-x": "-200px", "background-position-y": "37px", "width": "160px", "height": "39px", "overflow": "hidden"});
                                }

                            }
                        }

                        if(data.ships[i].type == "SUBMARINE"){
                            for(var j=0 ; j <= 1 ; j++){
                                if(data.ships[i].location[j].split("")[0]==data.ships[i].location[j+1].split("")[0]){
                                    //verical
                                    $("#yourTableId").find("[data-location="+data.ships[i].location[0]+"]").append($("#drop3"));
                                    $("#drop3").attr("draggable", "false");
                                    $(".submarine").css({"background-image": "url('/s-v.png')", "background-size": "75px 710px", "background-position-x": "1px", "background-position-y": "-355px", "height": "120px", "width": "39px", "overflow": "hidden"});
                                } else if(data.ships[i].location[j].split("")[1]==data.ships[i].location[j+1].split("")[1]){
                                    //horizontal
                                    $("#yourTableId").find("[data-location="+data.ships[i].location[0]+"]").append($("#drop3"));
                                    $("#drop3").attr("draggable", "false");
                                    $(".submarine").css({"background-image": "url('/s-h.png')", "background-size": "710px 75px", "background-position-x": "-355px", "background-position-y": "37px", "width": "120px", "height": "39px", "overflow": "hidden"});
                                }

                            }
                        }

                        if(data.ships[i].type == "DESTROYER"){
                            for(var j=0 ; j <= 1 ; j++){
                                if(data.ships[i].location[j].split("")[0]==data.ships[i].location[j+1].split("")[0]){
                                    //verical
                                    $("#yourTableId").find("[data-location="+data.ships[i].location[0]+"]").append($("#drop4"));
                                    $("#drop4").attr("draggable", "false");
                                    $(".destroyer").css({"background-image": "url('/s-v.png')", "background-size": "75px 710px", "background-position-x": "1px", "background-position-y": "-472px", "height": "120px", "width": "39px", "overflow": "hidden"});
                                } else if(data.ships[i].location[j].split("")[1]==data.ships[i].location[j+1].split("")[1]){
                                    //horizontal
                                    $("#yourTableId").find("[data-location="+data.ships[i].location[0]+"]").append($("#drop4"));
                                    $("#drop4").attr("draggable", "false");
                                    $(".destroyer").css({"background-image": "url('/s-h.png')", "background-size": "710px 75px", "background-position-x": "-475px", "background-position-y": "37px", "width": "120px", "height": "39px", "overflow": "hidden"});
                                }

                            }
                        }

                        if(data.ships[i].type == "PATROL_BOAT"){
                            if(data.ships[i].location[0].split("")[0]==data.ships[i].location[1].split("")[0]){
                                //verical
                                $("#yourTableId").find("[data-location="+data.ships[i].location[0]+"]").append($("#drop5"));
                                $("#drop5").attr("draggable", "false");
                                $(".patrol_boat").css({"background-image": "url('/s-v.png')", "background-size": "75px 710px", "background-position-x": "1px", "background-position-y": "-590px", "height": "80px", "width": "39px", "overflow": "hidden"});
                            } else if(data.ships[i].location[0].split("")[1]==data.ships[i].location[1].split("")[1]){
                                //horizontal
                                $("#yourTableId").find("[data-location="+data.ships[i].location[0]+"]").append($("#drop5"));
                                $("#drop5").attr("draggable", "false");
                                $(".patrol_boat").css({"background-image": "url('/s-h.png')", "background-size": "710px 75px", "background-position-x": "-590px", "background-position-y": "37px", "width": "80px", "height": "39px", "overflow": "hidden"});
                            }
                        }
                    }
                }
            }

            function putPlayersShotsOnTheGrid(){
                for(var i=0; i <= data.your_salvos.length-1 ; i++){
                    for(var j=0 ; j <= data.your_salvos[i].shots.length-1 ; j++){
                        if(data.your_salvos[i].shots[j].shot=="hit"){
                        //                    $("#yourTableId").find("[data-location="+"B2    "+"]").find(".draggable").attr('id');
                        //                                    if ($("#yourTableId").find("[data-location="+data.your_salvos[i].shots[j].location+"]").find(".draggable").attr('id')!=null){
                            $("#enemiesTableId").find("[data-location="+data.your_salvos[i].shots[j].location+"]").find(".hitCl").css({"display" : "block", "position" : "relative"});
                        //                                    } else if ($("#yourTableId").find("[data-location="+data.your_salvos[i].shots[j].location+"]").find(".draggable").attr('id')==null) {
                        //                                        $("#yourTableId").find("[data-location="+data.your_salvos[i].shots[j].location+"]").find(".hitCl").css({"display" : "block", "position" : "relative"});
                        //                                    }
                        } else if(data.your_salvos[i].shots[j].shot=="miss"){
                        //                                    if ($("#yourTableId").find("[data-location="+data.your_salvos[i].shots[j].location+"]").find(".draggable").attr('id')!=null){
                            $("#enemiesTableId").find("[data-location="+data.your_salvos[i].shots[j].location+"]").find(".missCl").css({"display" : "block", "position" : "relative"});
                        //                                    } else if ($("#yourTableId").find("[data-location="+data.your_salvos[i].shots[j].location+"]").find(".draggable").attr('id')==null){
                        //                                        $("#yourTableId").find("[data-location="+data.your_salvos[i].shots[j].location+"]").find(".missCl").css({"display" : "block", "position" : "relative"});
                        //                                    }
                         }
                    }
                }
            }

            function putEnemiesShotsOnPlayersGrid(){

                var hit = document.createElement("div");
                    hit.setAttribute("class", "hitCl");
                var miss = document.createElement("div");
                    miss.setAttribute("class", "missCl");

                for(var i=0; i <= data.enemies_salvos.length-1 ; i++){
                    for(var j=0 ; j <= data.enemies_salvos[i].shots.length-1 ; j++){
                        if(data.enemies_salvos[i].shots[j].shot=="hit"){
                            if ($("#yourTableId").find("[data-location="+data.enemies_salvos[i].shots[j].location+"]").find(".draggable").attr('id')!=null){
                                $("#yourTableId").find("[data-location="+data.enemies_salvos[i].shots[j].location+"]").find(".hitCl").css({"display" : "block", "position" : "absolute"});
                            } else if ($("#yourTableId").find("[data-location="+data.enemies_salvos[i].shots[j].location+"]").find(".draggable").attr('id')==null) {
                                $("#yourTableId").find("[data-location="+data.enemies_salvos[i].shots[j].location+"]").find(".hitCl").css({"display" : "block", "position" : "relative"});
                            }
                        } else if(data.enemies_salvos[i].shots[j].shot=="miss"){
                            if ($("#yourTableId").find("[data-location="+data.enemies_salvos[i].shots[j].location+"]").find(".draggable").attr('id')!=null){
                                $("#yourTableId").find("[data-location="+data.enemies_salvos[i].shots[j].location+"]").find(".missCl").css({"display" : "block", "position" : "absolute"});
                            } else if ($("#yourTableId").find("[data-location="+data.enemies_salvos[i].shots[j].location+"]").find(".draggable").attr('id')==null){
                                $("#yourTableId").find("[data-location="+data.enemies_salvos[i].shots[j].location+"]").find(".missCl").css({"display" : "block", "position" : "relative"});
                            }
                        }
                    }
                }
            }


        //// CREATE TABLE FOR SALVOS HISTORY: .....
            function createSalvoHistory(){
                for(var i = 0 ; i <= data.your_salvos.length-1 ; i++){
                    for(var j = 0 ; j <= data.your_salvos[i].shots.length-1 ; j++){
                        if(data.your_salvos[i].shots[j].shot=="hit"){
                            if(data.your_salvos[i].shots[j].ship=="CARRIER"){
                                if(data.your_salvos[i].shots[j].condition=="damaged"){
                                    $("#carrierShotsId").append("*");
                                } else if(data.your_salvos[i].shots[j].condition=="sunked"){
                                    $("#carrierShotsId").text("SUNKED!");
                                    $("#carrierPicId").css({"background-image": "url('/s-h.png')", "background-size": "500px 50px", "background-position-x": "0px", "background-position-y": "0px", "width": "140px", "height": "25px", "overflow": "hidden"})
                                }
                            } else if(data.your_salvos[i].shots[j].ship=="BATTLESHIP"){
                                if(data.your_salvos[i].shots[j].condition=="damaged"){
                                    $("#battleshipShotsId").append("*");
                                } else if(data.your_salvos[i].shots[j].condition=="sunked"){
                                    $("#battleshipShotsId").text("SUNKED!");
                                    $("#battleshipPicId").css({"background-image": "url('/s-h.png')", "background-size": "500px 50px", "background-position-x": "-142px", "background-position-y": "2px", "width": "105px", "height": "25px", "overflow": "hidden"})
                                }
                            } else if(data.your_salvos[i].shots[j].ship=="SUBMARINE"){
                                if(data.your_salvos[i].shots[j].condition=="damaged"){
                                    $("#submarineShotsId").append("*");
                                } else if(data.your_salvos[i].shots[j].condition=="sunked"){
                                    $("#submarineShotsId").text("SUNKED!");
                                    $("#submarinePicId").css({"background-image": "url('/s-h.png')", "background-size": "500px 50px", "background-position-x": "248px", "background-position-y": "2px", "width": "78px", "height": "25px", "overflow": "hidden"})
                                }
                            } else if(data.your_salvos[i].shots[j].ship=="DESTROYER"){
                                if(data.your_salvos[i].shots[j].condition=="damaged"){
                                    $("#destroyerShotsId").append("*");
                                } else if(data.your_salvos[i].shots[j].condition=="sunked"){
                                    $("#destroyerShotsId").text("SUNKED!");
                                    $("#destroyerPicId").css({"background-image": "url('/s-h.png')", "background-size": "500px 50px", "background-position-x": "164px", "background-position-y": "2px", "width": "78px", "height": "25px", "overflow": "hidden"})
                                }
                            } else if(data.your_salvos[i].shots[j].ship=="PATROL_BOAT"){
                                if(data.your_salvos[i].shots[j].condition=="damaged"){
                                    $("#patrol_boatShotsId").append("*");
                                } else if(data.your_salvos[i].shots[j].condition=="sunked"){
                                    $("#patrol_boatShotsId").text("SUNKED!");
                                    $("#patrol_boatPicId").css({"background-image": "url('/s-h.png')", "background-size": "500px 50px", "background-position-x": "-412px", "background-position-y": "2px", "width": "60px", "height": "25px", "overflow": "hidden"})
                                }
                            }
                        }
                    }
                }
            }
        } else {
            $("#gameViewUnloadedId").show();
            $("#gameViewOnload").hide();
        }
    });
}


function reloadMainJson(){
    var enemyEmail;
    var state;
    var type;
    var locationBrowser = window.location.search.split("?gp=")[1];
    $.getJSON("/api/game_view/"+locationBrowser, function(data){
        if (data.game_id!="") {

            enemyEmail = data.enemy;
            state = data.state;
            type = data.type;
            if(enemyEmail == ""){
                enemyEmail = "Waiting for player to join..";
            }

            $("#enemyId").text("Opponent: "+enemyEmail);
            $("#stateId").text("State: "+state);
            $("#hostJoinId").text("Type: "+type);



            if (data.state!="your_turn") {
                $("#enemiesTableId").find("td").attr("clickable", "false");
            } else {
                $("#enemiesTableId").find("td").attr("clickable", "true");
            }
            putPlayersShotsOnTheGrid();
            putEnemiesShotsOnPlayersGrid();
    //        createSalvoHistory();

            var gameId = data.game_id;
            var playerId = data.player.id;

            var countYrShots = 0;
            var countEnShots = 0;
            var countYrHits = 0;
            var countEnHits = 0;
            var countYrMisses = 0;
            var countEnMisses = 0;
            var countYrShpsSunked = 0;
            var countEnShpsSunked = 0;

            for(var i = 0 ; i <= data.your_salvos.length-1 ; i++){
                for(var j = 0 ; j <= data.your_salvos[i].shots.length-1 ; j++){
                    countYrShots++;
                    if(data.your_salvos[i].shots[j].shot=="hit"){
                        countYrHits++;
                        if(data.your_salvos[i].shots[j].condition=="sunked"){
                            countYrShpsSunked++;
                            console.log(countYrShpsSunked);
                        }
                    } else if(data.your_salvos[i].shots[j].shot=="miss"){
                        countYrMisses++;
                    }
                }
            }

            for(var i = 0 ; i <= data.enemies_salvos.length-1 ; i++){
                for(var j = 0 ; j <= data.enemies_salvos[i].shots.length-1 ; j++){
                    countEnShots++;
                    if(data.enemies_salvos[i].shots[j].shot=="hit"){
                        countEnHits++;
                        if(data.enemies_salvos[i].shots[j].condition=="sunked"){
                            countEnShpsSunked++;
                            console.log(countEnShpsSunked);
                        }
                    } else if(data.enemies_salvos[i].shots[j].shot=="miss"){
                        countEnMisses++;
                    }
                }
            }

            if($("#gameOverStatsId").css("display")=="block"){
                $("#yourShotsId").text(countYrShots);
                $("#enemyShotsId").text(countEnShots);
                $("#yourHitsId").text(countYrHits);
                $("#enemyHitsId").text(countEnHits);
                $("#yourShipsSunkedId").text(countYrShpsSunked);
                $("#enemyShipsSunkedId").text(countEnShpsSunked);
                $("#yourMissesId").text(countYrMisses);
                $("#enemyMissesId").text(countEnMisses);
            }

            //// CHECK THE GAME FOR 'GAME OVER'
            if(data.game_over==true){
                $("#allStatsDivId").show();
                $("#gamePlayDivId").css("display", "none");
                $("#enemyShipsConditionDivId").css("display", "none");
                $("#gameOverDivId").css("display", "block");
                $("#gameOverStatsId").css("display", "block");
                if(data.state=="won"){
                    $("#stateGameOverId").css("color", "darkgreen");
                    $("#stateGameOverId").text(data.state);
                } else if(data.state=="lost"){
                    $("#stateGameOverId").css("color", "darkred");
                    $("#stateGameOverId").text(data.state);
                } else if(data.state=="tie"){
                    $("#stateGameOverId").css("color", "darkgray");
                    $("#stateGameOverId").text(data.state);
                }
            } else if (data.state=="enemy_places_ships" | data.state=="place_ships" | data.state=="waiting_for_player_to_join") {
                $("#makeShotsButtonID").hide();
                $("#enemyShipsConditionDivId").hide();
            } else {
                $("#makeShotsButtonID").show();
                $("#enemyShipsConditionDivId").show();
            }



            function putPlayersShotsOnTheGrid(){
                for(var i=0; i <= data.your_salvos.length-1 ; i++){
                    for(var j=0 ; j <= data.your_salvos[i].shots.length-1 ; j++){
                        if(data.your_salvos[i].shots[j].shot=="hit"){
    //                    $("#yourTableId").find("[data-location="+"B2    "+"]").find(".draggable").attr('id');
    //                                    if ($("#yourTableId").find("[data-location="+data.your_salvos[i].shots[j].location+"]").find(".draggable").attr('id')!=null){
                            $("#enemiesTableId").find("[data-location="+data.your_salvos[i].shots[j].location+"]").find(".hitCl").css({"display" : "block", "position" : "relative"});
    //                                    } else if ($("#yourTableId").find("[data-location="+data.your_salvos[i].shots[j].location+"]").find(".draggable").attr('id')==null) {
    //                                        $("#yourTableId").find("[data-location="+data.your_salvos[i].shots[j].location+"]").find(".hitCl").css({"display" : "block", "position" : "relative"});
    //                                    }
                        } else if(data.your_salvos[i].shots[j].shot=="miss"){
    //                                    if ($("#yourTableId").find("[data-location="+data.your_salvos[i].shots[j].location+"]").find(".draggable").attr('id')!=null){
                            $("#enemiesTableId").find("[data-location="+data.your_salvos[i].shots[j].location+"]").find(".missCl").css({"display" : "block", "position" : "relative"});
    //                                    } else if ($("#yourTableId").find("[data-location="+data.your_salvos[i].shots[j].location+"]").find(".draggable").attr('id')==null){
    //                                        $("#yourTableId").find("[data-location="+data.your_salvos[i].shots[j].location+"]").find(".missCl").css({"display" : "block", "position" : "relative"});
    //                                    }
                        }
                    }
                }
            }

            function putEnemiesShotsOnPlayersGrid(){

                var hit = document.createElement("img");
                    hit.setAttribute("class", "hitCl");
                var miss = document.createElement("img");
                    miss.setAttribute("class", "missCl");

                for(var i=0; i <= data.enemies_salvos.length-1 ; i++){
                    for(var j=0 ; j <= data.enemies_salvos[i].shots.length-1 ; j++){
                        if(data.enemies_salvos[i].shots[j].shot=="hit"){
                            if ($("#yourTableId").find("[data-location="+data.enemies_salvos[i].shots[j].location+"]").find(".draggable").attr('id')!=null){
                                $("#yourTableId").find("[data-location="+data.enemies_salvos[i].shots[j].location+"]").find(".hitCl").css({"display" : "block", "position" : "absolute"});
                            } else if ($("#yourTableId").find("[data-location="+data.enemies_salvos[i].shots[j].location+"]").find(".draggable").attr('id')==null) {
                                $("#yourTableId").find("[data-location="+data.enemies_salvos[i].shots[j].location+"]").find(".hitCl").css({"display" : "block", "position" : "relative"});
                            }
                        } else if(data.enemies_salvos[i].shots[j].shot=="miss"){
                            if ($("#yourTableId").find("[data-location="+data.enemies_salvos[i].shots[j].location+"]").find(".draggable").attr('id')!=null){
                                $("#yourTableId").find("[data-location="+data.enemies_salvos[i].shots[j].location+"]").find(".missCl").css({"display" : "block", "position" : "absolute"});
                            } else if ($("#yourTableId").find("[data-location="+data.enemies_salvos[i].shots[j].location+"]").find(".draggable").attr('id')==null){
                                $("#yourTableId").find("[data-location="+data.enemies_salvos[i].shots[j].location+"]").find(".missCl").css({"display" : "block", "position" : "relative"});
                            }
                        }
                    }
                }
            }
        } else {
            $("#gameViewUnloadedId").show();
            $("#gameViewOnload").hide();
        }
    });
}


//// ADD SHIPS TO THE GAME PLAY: .....
$("#putShipsButtonId").click(function(){
    console.log("Carrier - "+getCarrierLocation($(".carrier").parent().parent().attr("data-location"), $(".carrier").attr("data-align")));
    console.log("Battleship - "+getBattleshipLocation($(".battleship").parent().parent().attr("data-location"), $(".battleship").attr("data-align")));
    console.log("Submarine - "+getSubmarineLocation($(".submarine").parent().parent().attr("data-location"), $(".submarine").attr("data-align")));
    console.log("Destroyer - "+getDestroyerLocation($(".destroyer").parent().parent().attr("data-location"), $(".destroyer").attr("data-align")));
    console.log("Patrol Boat - "+getPatrolBoatLocation($(".patrol_boat").parent().parent().attr("data-location"), $(".patrol_boat").attr("data-align")));

    var carrier = getCarrierLocation($(".carrier").parent().parent().attr("data-location"), $(".carrier").attr("data-align"));
    var battleship = getBattleshipLocation($(".battleship").parent().parent().attr("data-location"), $(".battleship").attr("data-align"));
    var submarine = getSubmarineLocation($(".submarine").parent().parent().attr("data-location"), $(".submarine").attr("data-align"));
    var destroyer = getDestroyerLocation($(".destroyer").parent().parent().attr("data-location"), $(".destroyer").attr("data-align"));
    var patrol_boat = getPatrolBoatLocation($(".patrol_boat").parent().parent().attr("data-location"), $(".patrol_boat").attr("data-align"));

    var locationBrowser = window.location.search.split("?gp=")[1];
    var URL = "/api/gamePlays/"+locationBrowser+"/ships";

    if(carrier.length==5 && battleship.length==4 && submarine.length==3 && destroyer.length==3 && patrol_boat.length==2) {
        $.post({
            url : URL,
            data : JSON.stringify([{location : carrier, type : "CARRIER"},
                {location : battleship, type : "BATTLESHIP"},
                {location : submarine, type : "SUBMARINE"},
                {location : destroyer, type : "DESTROYER"},
                {location : patrol_boat, type : "PATROL_BOAT"}]),
            dataType: "text",
            contentType: "application/json"
        })
        .done(function(response){
            $("#alertMessage").text(response);
            setTimeout(function(){
//                alert(response);
                $("#alertMessage").text("");
            }, 3000);


            $("#shipsContainerId").hide();
            $("#putShipsButtonId").hide();
            $("#enemiesTableId").show();
            $(".h_v").hide();
            $("#drop1").attr("draggable", "false");
            $("#drop2").attr("draggable", "false");
            $("#drop3").attr("draggable", "false");
            $("#drop4").attr("draggable", "false");
            $("#drop5").attr("draggable", "false");
         })
        .fail(function(response) {
            $("#alertMessage").text(response);
            setTimeout(function(){
//                alert(response);
                $("#alertMessage").text("");
            }, 3000);
        });
    } else {
            $("#alertMessage").text("You haven't placed the ships on the grid! Please try again.");
        setTimeout(function(){
//          alert("You haven't placed the ships on the grid! Please try again.");
            $("#alertMessage").text("");
        }, 3000);

    }
});



//// ROTATION BUTTONS MANAGERS: .....
$("#carrier_rotate").click(function(){
    if ($(".carrier").attr("data-align") == "horizontal"){
        console.log("button was clicked");
        $(".carrier").css({"background-image": "url('/s-v.png')", "background-size": "75px 710px", "background-position-x": "0px", "background-position-y": "0px", "height": "200px", "width": "39px", "overflow": "hidden"});
        $(".carrier").attr("data-align", "vertical");
    } else if ($(".carrier").attr("data-align") == "vertical"){
        console.log("button was clicked");
        $(".carrier").css({"background-image": "url('/s-h.png')", "background-size": "710px 75px", "background-position-x": "-0px", "background-position-y": "38px", "width": "200px", "height": "39px", "overflow": "hidden"});
        $(".carrier").attr("data-align", "horizontal");
    }
});

$("#battleship_rotate").click(function(){
    if ($(".battleship").attr("data-align") == "horizontal"){
        console.log("button was clicked");
        $(".battleship").css({"background-image": "url('/s-v.png')", "background-size": "75px 710px", "background-position-x": "0px", "background-position-y": "-200px", "height": "160px", "width": "39px", "overflow": "hidden"});
        $(".battleship").attr("data-align", "vertical");
    } else if ($(".battleship").attr("data-align") == "vertical"){
        console.log("button was clicked");
        $(".battleship").css({"background-image": "url('/s-h.png')", "background-size": "710px 75px", "background-position-x": "-200px", "background-position-y": "37px", "width": "160px", "height": "39px", "overflow": "hidden"});
        $(".battleship").attr("data-align", "horizontal");
    }
});

$("#submarine_rotate").click(function(){
    if ($(".submarine").attr("data-align") == "horizontal"){
        console.log("button was clicked");
        $(".submarine").css({"background-image": "url('/s-v.png')", "background-size": "75px 710px", "background-position-x": "1px", "background-position-y": "-355px", "height": "120px", "width": "39px", "overflow": "hidden"});
        $(".submarine").attr("data-align", "vertical");
    } else if ($(".submarine").attr("data-align") == "vertical"){
        console.log("button was clicked");
        $(".submarine").css({"background-image": "url('/s-h.png')", "background-size": "710px 75px", "background-position-x": "-355px", "background-position-y": "37px", "width": "120px", "height": "39px", "overflow": "hidden"});
        $(".submarine").attr("data-align", "horizontal");
    }
});

$("#destroyer_rotate").click(function(){
    if ($(".destroyer").attr("data-align") == "horizontal"){
        console.log("button was clicked");
        $(".destroyer").css({"background-image": "url('/s-v.png')", "background-size": "75px 710px", "background-position-x": "1px", "background-position-y": "-472px", "height": "120px", "width": "39px", "overflow": "hidden"});
        $(".destroyer").attr("data-align", "vertical");
    } else if ($(".destroyer").attr("data-align") == "vertical"){
        console.log("button was clicked");
        $(".destroyer").css({"background-image": "url('/s-h.png')", "background-size": "710px 75px", "background-position-x": "-475px", "background-position-y": "37px", "width": "120px", "height": "39px", "overflow": "hidden"});
        $(".destroyer").attr("data-align", "horizontal");
    }
});

$("#patrol_boat_rotate").click(function(){
    if ($(".patrol_boat").attr("data-align") == "horizontal"){
        console.log("button was clicked");
        $(".patrol_boat").css({"background-image": "url('/s-v.png')", "background-size": "75px 710px", "background-position-x": "1px", "background-position-y": "-590px", "height": "80px", "width": "39px", "overflow": "hidden"});
        $(".patrol_boat").attr("data-align", "vertical");
    } else if ($(".patrol_boat").attr("data-align") == "vertical"){
        console.log("button was clicked");
        $(".patrol_boat").css({"background-image": "url('/s-h.png')", "background-size": "710px 75px", "background-position-x": "-590px", "background-position-y": "37px", "width": "80px", "height": "39px", "overflow": "hidden"});
        $(".patrol_boat").attr("data-align", "horizontal");
    }
});


//// DRAG AND DROP FUNCTIONS: .....
function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    ev.target.appendChild(document.getElementById(data));
}



//// SHIP LOCATIONS GETTERS: .....
function getCarrierLocation(cell, align){
    var letters = ["","A","B","C","D","E","F","G","H","I","J"];
    var numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    var location = [];
    if( align == "horizontal" ){
        for(var i = 0; i<=letters.length-1 ; i++){
            if(letters[i]==cell.split("")[0] && cell.split("")[2]==null){
                location.push(letters[i]+cell.split("")[1]);
                location.push(letters[i+1]+cell.split("")[1]);
                location.push(letters[i+2]+cell.split("")[1]);
                location.push(letters[i+3]+cell.split("")[1]);
                location.push(letters[i+4]+cell.split("")[1]);
            } else if(letters[i]==cell.split("")[0] && cell.split("")[2]!=null){
                location.push(letters[i]+cell.split("")[1]+cell.split("")[2]);
                location.push(letters[i+1]+cell.split("")[1]+cell.split("")[2]);
                location.push(letters[i+2]+cell.split("")[1]+cell.split("")[2]);
                location.push(letters[i+3]+cell.split("")[1]+cell.split("")[2]);
                location.push(letters[i+4]+cell.split("")[1]+cell.split("")[2]);
            }
        }
    } else if( align == "vertical" ){
        for(var i = 0; i <= letters.length-1 ; i++){
            if(numbers[i]==cell.split("")[1]){
                location.push(cell.split("")[0]+numbers[i]);
                location.push(cell.split("")[0]+numbers[i+1]);
                location.push(cell.split("")[0]+numbers[i+2]);
                location.push(cell.split("")[0]+numbers[i+3]);
                location.push(cell.split("")[0]+numbers[i+4]);
            }
        }
    }
    return location;
}

function getBattleshipLocation(cell, align){
    var letters = ["","A","B","C","D","E","F","G","H","I","J"];
    var numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    var location = [];
    if( align == "horizontal" ){
        for(var i = 0; i<=letters.length-1 ; i++){
            if(letters[i]==cell.split("")[0] && cell.split("")[2]==null){
                location.push(letters[i]+cell.split("")[1]);
                location.push(letters[i+1]+cell.split("")[1]);
                location.push(letters[i+2]+cell.split("")[1]);
                location.push(letters[i+3]+cell.split("")[1]);
            } else if(letters[i]==cell.split("")[0] && cell.split("")[2]!=null){
                location.push(letters[i]+cell.split("")[1]+cell.split("")[2]);
                location.push(letters[i+1]+cell.split("")[1]+cell.split("")[2]);
                location.push(letters[i+2]+cell.split("")[1]+cell.split("")[2]);
                location.push(letters[i+3]+cell.split("")[1]+cell.split("")[2]);
            }
        }
    } else if( align == "vertical" ){
        for(var i = 0; i <= letters.length-1 ; i++){
            if(numbers[i]==cell.split("")[1]){
                location.push(cell.split("")[0]+numbers[i]);
                location.push(cell.split("")[0]+numbers[i+1]);
                location.push(cell.split("")[0]+numbers[i+2]);
                location.push(cell.split("")[0]+numbers[i+3]);
            }
        }
    }
    return location;
}

function getSubmarineLocation(cell, align){
    var letters = ["","A","B","C","D","E","F","G","H","I","J"];
    var numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    var location = [];
    if( align == "horizontal" ){
        for(var i = 0; i<=letters.length-1 ; i++){
            if(letters[i]==cell.split("")[0] && cell.split("")[2]==null){
                location.push(letters[i]+cell.split("")[1]);
                location.push(letters[i+1]+cell.split("")[1]);
                location.push(letters[i+2]+cell.split("")[1]);
            } else if(letters[i]==cell.split("")[0] && cell.split("")[2]!=null){
                location.push(letters[i]+cell.split("")[1]+cell.split("")[2]);
                location.push(letters[i+1]+cell.split("")[1]+cell.split("")[2]);
                location.push(letters[i+2]+cell.split("")[1]+cell.split("")[2]);
            }
        }
    } else if( align == "vertical" ){
        for(var i = 0; i <= letters.length-1 ; i++){
            if(numbers[i]==cell.split("")[1]){
                location.push(cell.split("")[0]+numbers[i]);
                location.push(cell.split("")[0]+numbers[i+1]);
                location.push(cell.split("")[0]+numbers[i+2]);
            }
        }
    }
    return location;
}

function getDestroyerLocation(cell, align){
    var letters = ["","A","B","C","D","E","F","G","H","I","J"];
    var numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    var location = [];
    if( align == "horizontal" ){
        for(var i = 0; i<=letters.length-1 ; i++){
            if(letters[i]==cell.split("")[0] && cell.split("")[2]==null){
                location.push(letters[i]+cell.split("")[1]);
                location.push(letters[i+1]+cell.split("")[1]);
                location.push(letters[i+2]+cell.split("")[1]);
            } else if(letters[i]==cell.split("")[0] && cell.split("")[2]!=null){
                location.push(letters[i]+cell.split("")[1]+cell.split("")[2]);
                location.push(letters[i+1]+cell.split("")[1]+cell.split("")[2]);
                location.push(letters[i+2]+cell.split("")[1]+cell.split("")[2]);
            }
        }
    } else if( align == "vertical" ){
        for(var i = 0; i <= letters.length-1 ; i++){
            if(numbers[i]==cell.split("")[1]){
                location.push(cell.split("")[0]+numbers[i]);
                location.push(cell.split("")[0]+numbers[i+1]);
                location.push(cell.split("")[0]+numbers[i+2]);
            }
        }
    }
    return location;
}

function getPatrolBoatLocation(cell, align){
    var letters = ["","A","B","C","D","E","F","G","H","I","J"];
    var numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    var location = [];
    if( align == "horizontal" ){
        for(var i = 0; i<=letters.length-1 ; i++){
            if(letters[i]==cell.split("")[0] && cell.split("")[2]==null){
                location.push(letters[i]+cell.split("")[1]);
                location.push(letters[i+1]+cell.split("")[1]);
            } else if(letters[i]==cell.split("")[0] && cell.split("")[2]!=null){
                location.push(letters[i]+cell.split("")[1]+cell.split("")[2]);
                location.push(letters[i+1]+cell.split("")[1]+cell.split("")[2]);
            }
        }
    } else if( align == "vertical" ){
        for(var i = 0; i <= letters.length-1 ; i++){
            if(numbers[i]==cell.split("")[1]){
                location.push(cell.split("")[0]+numbers[i]);
                location.push(cell.split("")[0]+numbers[i+1]);
            }
        }
    }
    return location;
}


//// SALVO METHODS: .....

var count = 0;

function makeShot(locationValue){

    if(count < 5){ // MAXIMUM NUMBER OF SHOTS = '5', MIGHT BE BETTER TO HAVE LIMIT OF '3' SHOTS .....
        if ($("#enemiesTableId").find("[data-location="+locationValue+"]").css("background-color") == "rgb(173, 216, 230)" && !$("#enemiesTableId").find("[data-location="+locationValue+"]").attr("data-shot") && $("#enemiesTableId").find("[data-location="+locationValue+"]").find(".hitCl").css("display")!="block" && $("#enemiesTableId").find("[data-location="+locationValue+"]").find(".missCl").css("display")!="block" && $("#enemiesTableId").find("[data-location="+locationValue+"]").attr("clickable") == "true"){  // if cell is 'lightblue'
            $("#enemiesTableId").find("[data-location="+locationValue+"]").find(".sightCl").css("display", "block");
            $("#enemiesTableId").find("[data-location="+locationValue+"]").attr("src", "/target-sight.jpg");
            $("#enemiesTableId").find("[data-location="+locationValue+"]").attr("data-shot", "shot");
            count++;

        } else if (($("#enemiesTableId").find("[data-location="+locationValue+"]").attr("src")) != null && $("#enemiesTableId").find("[data-location="+locationValue+"]").attr("data-shot")){ // if cell is 'brown' and if it has 'data-shot' attribute
            $("#enemiesTableId").find("[data-location="+locationValue+"]").find(".sightCl").css("display", "none");
            $("#enemiesTableId").find("[data-location="+locationValue+"]").removeAttr("data-shot");
            $("#enemiesTableId").find("[data-location="+locationValue+"]").removeAttr("src");
            count--;
        }
    } else if ($("#enemiesTableId").find("[data-location="+locationValue+"]").find(".sightCl") != null && $("#enemiesTableId").find("[data-location="+locationValue+"]").attr("data-shot")){ // if cell if 'brown'
        $("#enemiesTableId").find("[data-location="+locationValue+"]").find(".sightCl").css({"display" : "none"});
        $("#enemiesTableId").find("[data-location="+locationValue+"]").removeAttr("data-shot");
        $("#enemiesTableId").find("[data-location="+locationValue+"]").removeAttr("src");
        count--;
    }
};


//// ADDING SALVOS TO GAME PLAY: .....
$("#makeShotsButtonID").click(function(){

    var shotsList = [];
    for(var i=0 ; i <= $($("#enemiesTableId").find("[data-shot]")).length-1 ; i++){
        var $html = $($("#enemiesTableId").find("[data-shot]")[i]);
        var str = $html.prop('outerHTML');
        if(str.split("data-location=",2)[1].split("")[3]=="0"){
            var str1 = str.split("data-location=",2)[1].split("")[1]+str.split("data-location=",2)[1].split("")[2]+str.split("data-location=",2)[1].split("")[3];
        } else if(str.split("data-location=",2)[1].split("")[3]!="0"){
            var str1 = str.split("data-location=",2)[1].split("")[1]+str.split("data-location=",2)[1].split("")[2];
        }
        console.log(str1);

        shotsList.push(str1);
//        console.log(str1);
    }

    console.log(shotsList);

    var locationBrowser1 = window.location.search.split("?gp=")[1];
    var URL1 = "/api/players/"+locationBrowser1+"/salvos";

    if (shotsList.length==5) {
        $.post({
            url : URL1,
            data : JSON.stringify({locations : shotsList }),
            dataType: "text",
            contentType: "application/json"
        })
        .done(function(response){
            $("#alertMessage").text(response);
            setTimeout(function(){
//                alert(response);
                $("#alertMessage").text("");
            }, 3000);


            for(var q = 0 ; q <= shotsList.length-1 ; q++){
                console.log(shotsList[q]);
                $("#enemiesTableId").find("[data-location="+shotsList[q]+"]").find(".sightCl").css("display", "none");
                $("#enemiesTableId").find("[data-location="+shotsList[q]+"]").removeAttr("data-shot");
            }

            setTimeout(function(){
                var locationBrowser = window.location.search.split("?gp=")[1];
                $.getJSON("/api/game_view/"+locationBrowser, function(data){
                    $("#carrierShotsId").text("");
                    $("#battleshipShotsId").text("");
                    $("#submarineShotsId").text("");
                    $("#destroyerShotsId").text("");
                    $("#patrol_boatShotsId").text("");
                    //// CREATE TABLE FOR SALVOS HISTORY: .....
                    for(var i = 0 ; i <= data.your_salvos.length-1 ; i++){
                        for(var j = 0 ; j <= data.your_salvos[i].shots.length-1 ; j++){
                            if(data.your_salvos[i].shots[j].shot=="hit"){
                                if(data.your_salvos[i].shots[j].ship=="CARRIER"){
                                    if(data.your_salvos[i].shots[j].condition=="damaged"){
                                        $("#carrierShotsId").append("*");
                                    } else if(data.your_salvos[i].shots[j].condition=="sunked"){
                                        $("#carrierShotsId").text("SUNKED!");
                                        $("#carrierPicId").css({"background-image": "url('/s-h.png')", "background-size": "500px 50px", "background-position-x": "0px", "background-position-y": "0px", "width": "140px", "height": "25px", "overflow": "hidden"})
                                    }
                                } else if(data.your_salvos[i].shots[j].ship=="BATTLESHIP"){
                                    if(data.your_salvos[i].shots[j].condition=="damaged"){
                                        $("#battleshipShotsId").append("*");
                                    } else if(data.your_salvos[i].shots[j].condition=="sunked"){
                                        $("#battleshipShotsId").text("SUNKED!");
                                        $("#battleshipPicId").css({"background-image": "url('/s-h.png')", "background-size": "500px 50px", "background-position-x": "-142px", "background-position-y": "2px", "width": "105px", "height": "25px", "overflow": "hidden"})
                                    }
                                } else if(data.your_salvos[i].shots[j].ship=="SUBMARINE"){
                                    if(data.your_salvos[i].shots[j].condition=="damaged"){
                                        $("#submarineShotsId").append("*");
                                    } else if(data.your_salvos[i].shots[j].condition=="sunked"){
                                        $("#submarineShotsId").text("SUNKED!");
                                        $("#submarinePicId").css({"background-image": "url('/s-h.png')", "background-size": "500px 50px", "background-position-x": "248px", "background-position-y": "2px", "width": "78px", "height": "25px", "overflow": "hidden"})
                                    }
                                } else if(data.your_salvos[i].shots[j].ship=="DESTROYER"){
                                    if(data.your_salvos[i].shots[j].condition=="damaged"){
                                        $("#destroyerShotsId").append("*");
                                    } else if(data.your_salvos[i].shots[j].condition=="sunked"){
                                        $("#destroyerShotsId").text("SUNKED!");
                                        $("#destroyerPicId").css({"background-image": "url('/s-h.png')", "background-size": "500px 50px", "background-position-x": "164px", "background-position-y": "2px", "width": "78px", "height": "25px", "overflow": "hidden"})
                                    }
                                } else if(data.your_salvos[i].shots[j].ship=="PATROL_BOAT"){
                                    if(data.your_salvos[i].shots[j].condition=="damaged"){
                                        $("#patrol_boatShotsId").append("*");
                                    } else if(data.your_salvos[i].shots[j].condition=="sunked"){
                                        $("#patrol_boatShotsId").text("SUNKED!");
                                        $("#patrol_boatPicId").css({"background-image": "url('/s-h.png')", "background-size": "500px 50px", "background-position-x": "-412px", "background-position-y": "2px", "width": "60px", "height": "25px", "overflow": "hidden"})
                                    }
                                }
                            }
                        }
                    }


                    var countYrShots = 0;
                    var countEnShots = 0;
                    var countYrHits = 0;
                    var countEnHits = 0;
                    var countYrMisses = 0;
                    var countEnMisses = 0;
                    var countYrShpsSunked = 0;
                    var countEnShpsSunked = 0;

                    if(data.game_over==true){
                        $("#allStatsDivId").show();
                        $("#gamePlayDivId").css("display", "none");
                        $("#enemyShipsConditionDivId").css("display", "none");
                        $("#gameOverDivId").css("display", "block");
                        $("#gameOverStatsId").css("display", "block");
                        if(data.state=="won"){
                            $("#stateGameOverId").css("color", "darkgreen");
                        } else if(data.state=="lost"){
                            $("#stateGameOverId").css("color", "darkred");
                        } else if(data.state=="tie"){
                            $("#stateGameOverId").css("color", "darkgray");
                        }
                    }


                    for(var i = 0 ; i <= data.your_salvos.length-1 ; i++){
                        for(var j = 0 ; j <= data.your_salvos[i].shots.length-1 ; j++){
                            countYrShots++;
                            if(data.your_salvos[i].shots[j].shot=="hit"){
                                countYrHits++;
                                if(data.your_salvos[i].shots[j].condition=="sunked"){
                                    countYrShpsSunked++;
                                    console.log(countYrShpsSunked);
                                }
                            } else if(data.your_salvos[i].shots[j].shot=="miss"){
                                countYrMisses++;
                            }
                        }
                    }
                    for(var i = 0 ; i <= data.enemies_salvos.length-1 ; i++){
                        for(var j = 0 ; j <= data.enemies_salvos[i].shots.length-1 ; j++){
                            countEnShots++;
                            if(data.enemies_salvos[i].shots[j].shot=="hit"){
                                countEnHits++;
                                if(data.enemies_salvos[i].shots[j].condition=="sunked"){
                                    countEnShpsSunked++;
                                    console.log(countEnShpsSunked);
                                }
                            } else if(data.enemies_salvos[i].shots[j].shot=="miss"){
                                countEnMisses++;
                            }
                        }
                    }

                    if($("#gameOverStatsId").css("display")=="block"){
                        $("#yourShotsId").text(countYrShots);
                        $("#enemyShotsId").text(countEnShots);
                        $("#yourHitsId").text(countYrHits);
                        $("#enemyHitsId").text(countEnHits);
                        $("#yourShipsSunkedId").text(countYrShpsSunked);
                        $("#enemyShipsSunkedId").text(countEnShpsSunked);
                        $("#yourMissesId").text(countYrMisses);
                        $("#enemyMissesId").text(countEnMisses);
                    }
                    for(var q=0 ; q <= shotsList.length-1 ; q++){
                        console.log(shotsList[q]);
                        $("#enemiesTableId").find("[data-location="+shotsList[q]+"]").css({"background-color" : "lightblue"});
                        $("#enemiesTableId").find("[data-location="+shotsList[q]+"]").find(".sightCl").css({"display": "none"});
                        $("#enemiesTableId").find("[data-location="+shotsList[q]+"]").removeAttr("data-shot");
                    }

                });
            }, 500);
        })
        .fail(function(response) {
//            $("#alertMessage").text(response);
//            $("#alertMessage").text(response);
            $("#alertMessage").text("Please wait for the other player to shoot..");
            $("#alertMessage").css("color", "black");
            setTimeout(function(){
//              alert(response);
                $("#alertMessage").text("");
            }, 3000);


            for(var q=0 ; q <= shotsList.length-1 ; q++){
                console.log(shotsList[q]);
                $("#enemiesTableId").find("[data-location="+shotsList[q]+"]").css({"background-color" : "lightblue"});
                $("#enemiesTableId").find("[data-location="+shotsList[q]+"]").find(".sightCl").css({"display": "none"});
                $("#enemiesTableId").find("[data-location="+shotsList[q]+"]").removeAttr("data-shot");
            }
        });



    count = 0;
    } else if(shotsList.length!=5) {
        $("#alertMessage").text("Please choose 5 locations.");
        $("#alertMessage").css("color", "brown");
        setTimeout(function(){
//            alert(response);
            $("#alertMessage").text("");
        }, 3000);
    }
});


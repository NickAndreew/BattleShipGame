//// HIDES TABLE FOR PLAYER SHOTS BEFORE THE START OF THE GAME: .....
$("#enemiesTableId").attr("style", "display:none");


//// HANDLES LOG OUT: .....
$("#logOutButtonId").click(function(){
    $.post("/api/logout").done(function() { console.log("logged out"); window.location.href = "/web/authentication.html";});
});


//// LOADS THE MAIN JSON FOR THE CURRENT GAME PLAY: .....
var playerEmail;
var enemyEmail;

var locationBrowser = window.location.search.split("?gp=")[1];
$.getJSON("/api/game_view/"+locationBrowser, function(data){
    playerEmail = data.player.email;
    enemyEmail = data.enemy.email;

    if(enemyEmail == undefined){
        enemyEmail = "Waiting for player to join..";
    }


    $("#playerId").text("You: "+data.player.email);
    $("#enemyId").text("Opponent: "+enemyEmail);

//    $("#startPlayButtonId").on("click", function(){
//        putShipsOnGrid();
//    });

    createListOfLocations();
//    createListOfPlayerSalvoes();
//    createListOfEnemiesSalvoes();
    createGridTable();
    createGridOfPlayersShots();
    putPlayersShotsOnTheGrid();
//    putEnemiesShotsOnPlayersGrid();
    putShipsOnGrid();

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
        grid.setAttribute("class", "table-bordered dropTarget");
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
                    cell.setAttribute("ondrop", "drop(event)");
                    cell.setAttribute("ondragover", "allowDrop(event)");
                    cell.setAttribute("data-location", (letters[j]+i));
                } else {
                    row.appendChild(cell);
                }
            }
        }
        document.getElementById("yourTableId").appendChild(grid);
    }

    function createGridOfPlayersShots() {
        var grid = document.createElement("table");
        grid.setAttribute("class", "table-bordered");
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
                    cell.setAttribute("onclick", MS);
                    cell.setAttribute("data-location", (letters[j]+i));
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

            for(var i=0; i<=data.ships.length-1 ; i++){
                if(data.ships[i].type == "CARRIER"){
                    for(var j=0 ; j <= 1 ; j++){
                        if(data.ships[i].location[j].split("")[0]==data.ships[i].location[j+1].split("")[0]){
                            //verical
                            $("#yourTableId").find("[data-location="+data.ships[i].location[0]+"]").append($("#drop1"));
                            $("#drop1").attr("draggable", "false");
                            $(".carrier").css({"background-image": "url('s-v.png')", "background-size": "75px 710px", "background-position-x": "0px", "background-position-y": "0px", "height": "200px", "width": "39px", "overflow": "hidden"});
                        } else if(data.ships[i].location[j].split("")[1]==data.ships[i].location[j+1].split("")[1]){
                            //horizontal
                            $("#yourTableId").find("[data-location="+data.ships[i].location[0]+"]").append($("#drop1"));
                            $("#drop1").attr("draggable", "false");
                            $(".carrier").css({"background-image": "url('s-h.png')", "background-size": "710px 75px", "background-position-x": "-0px", "background-position-y": "38px", "width": "200px", "height": "39px", "overflow": "hidden"});
                        }

                    }
                }

                if(data.ships[i].type == "BATTLESHIP"){
                    for(var j=0 ; j <= 1 ; j++){
                        if(data.ships[i].location[j].split("")[0]==data.ships[i].location[j+1].split("")[0]){
                            //verical
                            $("#yourTableId").find("[data-location="+data.ships[i].location[0]+"]").append($("#drop2"));
                            $("#drop2").attr("draggable", "false");
                            $(".battleship").css({"background-image": "url('s-v.png')", "background-size": "75px 710px", "background-position-x": "0px", "background-position-y": "-200px", "height": "160px", "width": "39px", "overflow": "hidden"});
                        } else if(data.ships[i].location[j].split("")[1]==data.ships[i].location[j+1].split("")[1]){
                            //horizontal
                            $("#yourTableId").find("[data-location="+data.ships[i].location[0]+"]").append($("#drop2"));
                            $("#drop2").attr("draggable", "false");
                            $(".battleship").css({"background-image": "url('s-h.png')", "background-size": "710px 75px", "background-position-x": "-200px", "background-position-y": "37px", "width": "160px", "height": "39px", "overflow": "hidden"});
                        }

                    }
                }

                if(data.ships[i].type == "SUBMARINE"){
                    for(var j=0 ; j <= 1 ; j++){
                        if(data.ships[i].location[j].split("")[0]==data.ships[i].location[j+1].split("")[0]){
                            //verical
                            $("#yourTableId").find("[data-location="+data.ships[i].location[0]+"]").append($("#drop3"));
                            $("#drop3").attr("draggable", "false");
                            $(".submarine").css({"background-image": "url('s-v.png')", "background-size": "75px 710px", "background-position-x": "1px", "background-position-y": "-355px", "height": "120px", "width": "39px", "overflow": "hidden"});
                        } else if(data.ships[i].location[j].split("")[1]==data.ships[i].location[j+1].split("")[1]){
                            //horizontal
                            $("#yourTableId").find("[data-location="+data.ships[i].location[0]+"]").append($("#drop3"));
                            $("#drop3").attr("draggable", "false");
                            $(".submarine").css({"background-image": "url('s-h.png')", "background-size": "710px 75px", "background-position-x": "-355px", "background-position-y": "37px", "width": "120px", "height": "39px", "overflow": "hidden"});
                        }

                    }
                }

                if(data.ships[i].type == "DESTROYER"){
                    for(var j=0 ; j <= 1 ; j++){
                        if(data.ships[i].location[j].split("")[0]==data.ships[i].location[j+1].split("")[0]){
                            //verical
                            $("#yourTableId").find("[data-location="+data.ships[i].location[0]+"]").append($("#drop4"));
                            $("#drop4").attr("draggable", "false");
                            $(".destroyer").css({"background-image": "url('s-v.png')", "background-size": "75px 710px", "background-position-x": "1px", "background-position-y": "-472px", "height": "120px", "width": "39px", "overflow": "hidden"});
                        } else if(data.ships[i].location[j].split("")[1]==data.ships[i].location[j+1].split("")[1]){
                            //horizontal
                            $("#yourTableId").find("[data-location="+data.ships[i].location[0]+"]").append($("#drop4"));
                            $("#drop4").attr("draggable", "false");
                            $(".destroyer").css({"background-image": "url('s-h.png')", "background-size": "710px 75px", "background-position-x": "-475px", "background-position-y": "37px", "width": "120px", "height": "39px", "overflow": "hidden"});
                        }

                    }
                }

                if(data.ships[i].type == "PATROL_BOAT"){
                    if(data.ships[i].location[0].split("")[0]==data.ships[i].location[1].split("")[0]){
                        //verical
                        $("#yourTableId").find("[data-location="+data.ships[i].location[0]+"]").append($("#drop5"));
                        $("#drop5").attr("draggable", "false");
                        $(".patrol_boat").css({"background-image": "url('s-v.png')", "background-size": "75px 710px", "background-position-x": "1px", "background-position-y": "-590px", "height": "80px", "width": "39px", "overflow": "hidden"});
                    } else if(data.ships[i].location[0].split("")[1]==data.ships[i].location[1].split("")[1]){
                        //horizontal
                        $("#yourTableId").find("[data-location="+data.ships[i].location[0]+"]").append($("#drop5"));
                        $("#drop5").attr("draggable", "false");
                        $(".patrol_boat").css({"background-image": "url('s-h.png')", "background-size": "710px 75px", "background-position-x": "-590px", "background-position-y": "37px", "width": "80px", "height": "39px", "overflow": "hidden"});
                    }
                }
            }
        }
    }

    function putPlayersShotsOnTheGrid(){
        for(var i=0;i<=data.your_salvos.length-1 ; i++){
            for(var j=0 ; j <= data.your_salvos[i].location.length-1 ; j++){
                //$("#enemiesTableId").find("[data-location="+data.your_salvos[i].location[j]+"]")
                $("#enemiesTableId").find("[data-location="+data.your_salvos[i].location[j]+"]").css({"background-color" : "brown"});
            }
        }
    }

    function putEnemiesShotsOnPlayersGrid(){
        for(var i=0;i<=data.your_salvos.length-1 ; i++){
            for(var j=0 ; j <= data.your_salvos[i].location.length-1 ; j++){
                $("#yourTableId").find("[data-location="+data.enemies_salvos[i].location[j]+"]").text(data.enemies_salvos[i].turn);

            }
        }
    }
})


//// ADD SHIPS TO THE GAME PLAY: .....
$("#putShipsButtonId").click(function(){
    console.log("Carrier - "+getCarrierLocation($(".carrier").parent().parent().attr("data-location"), $(".carrier").attr("data-align")));
    console.log("Battleship - "+getBattleshipLocation($(".battleship").parent().parent().attr("data-location"), $(".battleship").attr("data-align")));
    console.log("Submarine - "+getSubmarineLocation($(".submarine").parent().parent().attr("data-location"), $(".submarine").attr("data-align")));
    console.log("Destroyer - "+getDestroyerLocation($(".destroyer").parent().parent().attr("data-location"), $(".destroyer").attr("data-align")));
    console.log("Patrol Boat - "+getPatrolBoatLocation($(".patrol_boat").parent().parent().attr("data-location"), $(".patrol_boat").attr("data-align")));

    var locationBrowser = window.location.search.split("?gp=")[1];
    var URL = "/api/gamePlays/"+locationBrowser+"/ships";


    $.post({
        url : URL,
        data : JSON.stringify([{location : getCarrierLocation($(".carrier").parent().parent().attr("data-location"), $(".carrier").attr("data-align")), type : "CARRIER"},
            {location : getBattleshipLocation($(".battleship").parent().parent().attr("data-location"), $(".battleship").attr("data-align")), type : "BATTLESHIP"},
            {location : getSubmarineLocation($(".submarine").parent().parent().attr("data-location"), $(".submarine").attr("data-align")), type : "SUBMARINE"},
            {location : getDestroyerLocation($(".destroyer").parent().parent().attr("data-location"), $(".destroyer").attr("data-align")), type : "DESTROYER"},
            {location : getPatrolBoatLocation($(".patrol_boat").parent().parent().attr("data-location"), $(".patrol_boat").attr("data-align")), type : "PATROL_BOAT"}]),
        dataType: "text",
        contentType: "application/json"
    })
    .done(function(response, status, jqXHR){
        alert( "Ships have been added: "+ response);
    })
    .fail(function(jqXHR, status, httpError) {
        alert("Failed to add ships: " + status + " " + httpError);
    });

    $("#shipsContainerId").hide();
    location.reload();
});



//// ROTATION BUTTONS MANAGERS: .....
$("#carrier_rotate").click(function(){
    if ($(".carrier").attr("data-align") == "horizontal"){
        console.log("button was clicked");
        $(".carrier").css({"background-image": "url('s-v.png')", "background-size": "75px 710px", "background-position-x": "0px", "background-position-y": "0px", "height": "200px", "width": "39px", "overflow": "hidden"});
        $(".carrier").attr("data-align", "vertical");
    } else if ($(".carrier").attr("data-align") == "vertical"){
        console.log("button was clicked");
        $(".carrier").css({"background-image": "url('s-h.png')", "background-size": "710px 75px", "background-position-x": "-0px", "background-position-y": "38px", "width": "200px", "height": "39px", "overflow": "hidden"});
        $(".carrier").attr("data-align", "horizontal");
    }
});

$("#battleship_rotate").click(function(){
    if ($(".battleship").attr("data-align") == "horizontal"){
        console.log("button was clicked");
        $(".battleship").css({"background-image": "url('s-v.png')", "background-size": "75px 710px", "background-position-x": "0px", "background-position-y": "-200px", "height": "160px", "width": "39px", "overflow": "hidden"});
        $(".battleship").attr("data-align", "vertical");
    } else if ($(".battleship").attr("data-align") == "vertical"){
        console.log("button was clicked");
        $(".battleship").css({"background-image": "url('s-h.png')", "background-size": "710px 75px", "background-position-x": "-200px", "background-position-y": "37px", "width": "160px", "height": "39px", "overflow": "hidden"});
        $(".battleship").attr("data-align", "horizontal");
    }
});

$("#submarine_rotate").click(function(){
    if ($(".submarine").attr("data-align") == "horizontal"){
        console.log("button was clicked");
        $(".submarine").css({"background-image": "url('s-v.png')", "background-size": "75px 710px", "background-position-x": "1px", "background-position-y": "-355px", "height": "120px", "width": "39px", "overflow": "hidden"});
        $(".submarine").attr("data-align", "vertical");
    } else if ($(".submarine").attr("data-align") == "vertical"){
        console.log("button was clicked");
        $(".submarine").css({"background-image": "url('s-h.png')", "background-size": "710px 75px", "background-position-x": "-355px", "background-position-y": "37px", "width": "120px", "height": "39px", "overflow": "hidden"});
        $(".submarine").attr("data-align", "horizontal");
    }
});

$("#destroyer_rotate").click(function(){
    if ($(".destroyer").attr("data-align") == "horizontal"){
        console.log("button was clicked");
        $(".destroyer").css({"background-image": "url('s-v.png')", "background-size": "75px 710px", "background-position-x": "1px", "background-position-y": "-472px", "height": "120px", "width": "39px", "overflow": "hidden"});
        $(".destroyer").attr("data-align", "vertical");
    } else if ($(".destroyer").attr("data-align") == "vertical"){
        console.log("button was clicked");
        $(".destroyer").css({"background-image": "url('s-h.png')", "background-size": "710px 75px", "background-position-x": "-475px", "background-position-y": "37px", "width": "120px", "height": "39px", "overflow": "hidden"});
        $(".destroyer").attr("data-align", "horizontal");
    }
});

$("#patrol_boat_rotate").click(function(){
    if ($(".patrol_boat").attr("data-align") == "horizontal"){
        console.log("button was clicked");
        $(".patrol_boat").css({"background-image": "url('s-v.png')", "background-size": "75px 710px", "background-position-x": "1px", "background-position-y": "-590px", "height": "80px", "width": "39px", "overflow": "hidden"});
        $(".patrol_boat").attr("data-align", "vertical");
    } else if ($(".patrol_boat").attr("data-align") == "vertical"){
        console.log("button was clicked");
        $(".patrol_boat").css({"background-image": "url('s-h.png')", "background-size": "710px 75px", "background-position-x": "-590px", "background-position-y": "37px", "width": "80px", "height": "39px", "overflow": "hidden"});
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

        if($("#enemiesTableId").find("[data-location="+locationValue+"]").css("background-color") == "rgb(173, 216, 230)" && !$("#enemiesTableId").find("[data-location="+locationValue+"]").attr("data-shot")){  // if cell is 'lightblue'
            $("#enemiesTableId").find("[data-location="+locationValue+"]").css({"background-color" : "brown"});
            $("#enemiesTableId").find("[data-location="+locationValue+"]").attr("data-shot", "shot");
            count++;

        } else if  (($("#enemiesTableId").find("[data-location="+locationValue+"]").css("background-color")) == "rgb(165, 42, 42)" && $("#enemiesTableId").find("[data-location="+locationValue+"]").attr("data-shot")){ // if cell is 'brown' and if it has 'data-shot' attribute
            $("#enemiesTableId").find("[data-location="+locationValue+"]").css({"background-color" : "lightblue"});
            $("#enemiesTableId").find("[data-location="+locationValue+"]").removeAttr("data-shot");
            count--;
        }

    } else if(($("#enemiesTableId").find("[data-location="+locationValue+"]").css("background-color")) == "rgb(165, 42, 42)" && $("#enemiesTableId").find("[data-location="+locationValue+"]").attr("data-shot")){ // if cell if 'brown'
        $("#enemiesTableId").find("[data-location="+locationValue+"]").css({"background-color" : "lightblue"});
        $("#enemiesTableId").find("[data-location="+locationValue+"]").removeAttr("data-shot");
        count--;
    }

//    console.log($($("#enemiesTableId").find("[data-shot]")));
//    console.log("count = "+count);

};

var turnNumber = 0;

//// ADDING SALVOS TO GAME PLAY: .....
$("#makeShotsButtonID").click(function(){

    var shotsList = [];
    for(var i=0 ; i<=$($("#enemiesTableId").find("[data-shot]")).length-1 ; i++){
        var $html = $($("#enemiesTableId").find("[data-shot]")[i]);
        var str = $html.prop('outerHTML');
        var str1 = str.split("data-location=",2)[1].split("")[1]+str.split("data-location=",2)[1].split("")[2];
        shotsList.push(str1);
//        console.log(str1);
    }
    turnNumber++;
    console.log(shotsList);

    var locationBrowser1 = window.location.search.split("?gp=")[1];
    var URL1 = "/api/players/"+locationBrowser1+"/salvos";

    $.post({
        url : URL1,
        data : JSON.stringify({locations : shotsList, turn : turnNumber }),
        dataType: "text",
        contentType: "application/json"
    })
    .done(function(response, status, jqXHR){
        alert( "Ships have been added: "+ response);
    })
    .fail(function(jqXHR, status, httpError) {
        alert("Failed to add ships: " + status + " " + httpError);
    });

    for(var q=0 ; q <= shotsList.length-1 ; q++){
        console.log(shotsList[q]);
//        $("#enemiesTableId").find("[data-location="+shotsList[q]+"]").css({"background-color" : "lightblue"});
        $("#enemiesTableId").find("[data-location="+shotsList[q]+"]").removeAttr("data-shot");
    }
    count = 0;
});
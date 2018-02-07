$("#signInButtonId").on("click", function(){
    var emailInput = $("#emailInputId").val();
    var passwordInput = $("#passwordInputId").val();
    logIn(emailInput, passwordInput);
});

$("#signUpButtonId").on("click", function(){
    var emailInput = $("#emailInputId").val();
    var passwordInput = $("#passwordInputId").val();
    signUp(emailInput, passwordInput);
});

$("#logOutButtonId").on("click", function(){
    var emailInput = $("#emailInputId").val();
    var passwordInput = $("#passwordInputId").val();
    signUp(emailInput, passwordInput);
});

function logIn(emailInput, passwordInput){
    if(validateEmail(emailInput)){
        $.post("/api/login", {
            email: emailInput,
            password: passwordInput
        }).done(function() { console.log("logged in!"); window.location.href = "/web/games.html"; }).fail(function(){console.log("fail!");});
    } else {
        $("#emailInputId").val("");
        $("#passwordInputId").val("");
    }
}

function signUp (emailInput, passwordInput){
    if(validateEmail(emailInput)){
        $.post("/api/createPlayer", {
            email: emailInput,
            password: passwordInput
        }).done(function(response) { console.log(response); logIn(emailInput, passwordInput); }).fail(function(response){console.log(response)});
    } else {
        $("#emailInputId").val("");
        $("#passwordInputId").val("");
    }
}


function validateEmail(inputText) {
    var mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if(inputText.match(mailFormat)){
        return true;
    } else {
        alert("You have entered an invalid email address!");
        return false;
    }
}




//$.getJSON("/api/games", function(result){
//    console.log(result);
//    createGameTable();
//    createGameInfoTable();
//
//    function createGameTable(){
//        for(var i = 0; i < result.length ; i++){
//            $("#gamesId").append($("<li>").append("Game - "+result[i].id +"; Started at: "+ result[i].created+";"));
//         }
//    }
//
//    function createGameInfoTable(){
//        for(var i = 0; i < result.length ; i++){
//            $("#gamesListId").append($("<li>").append("Game - "+result[i].id +", "+ getPlayerEmails(i) +"; "));
//        }
//    }
//
//    function getPlayerEmails(i){
//        var playerEmails = "Players : ";
//        if(result[i].gamePlays.length > 0){
//            for(var j=0; j <= result[i].gamePlays.length-1; j++){
//                if(j==result[i].gamePlays.length-1){
//                    playerEmails += result[i].gamePlays[j].player.email + ", Player joined the game at: " + result[i].gamePlays[j].started;
//                } else {
//                    playerEmails += result[i].gamePlays[j].player.email + ", Player joined the game at: " + result[i].gamePlays[j].started + ", ";
//                }
//            }
//        } else if(result[i].gamePlays.length == 0){
//            playerEmails = result[i].gamePlays.player.email + ", Player joined the game at: " + result[i].gamePlays[j].started;
//        }
//        return playerEmails;
//    }
//});


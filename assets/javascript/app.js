// Initialize Firebase
var config = {
    apiKey: "AIzaSyCTpS5j8nkGXNgdwMYc2xd-2S-RqmesLQM",
    authDomain: "rps-game-d58e7.firebaseapp.com",
    databaseURL: "https://rps-game-d58e7.firebaseio.com",
    projectId: "rps-game-d58e7",
    storageBucket: "",
    messagingSenderId: "942997925537"
  };
firebase.initializeApp(config);

// Global variables.
var database = firebase.database();
var player1Ref = database.ref("players/player-1");
var player2Ref = database.ref("players/player-2");
var connectedRef = database.ref(".info/connected");
var connectionsRef = database.ref("/connections");
var messagesRef = database.ref("/messages");
var player1MessagesRef = database.ref("messages/player-1");
var player2MessagesRef = database.ref("messages/player-2");

var player1Present = false;
var player2Present = false;

// Anonymous function that fires after 500 millis (because we want to make sure Firebase has updated) and applies sessionstorage id based on player states.
// function setID() {

//     sessionStorage.clear();

//     if (player1Present && !player2Present) {
//         sessionStorage.setItem("player", "player1");
//     } else if (player1Present && player2Present) {
//         sessionStorage.setItem("player", "player2");
//     } else {
//         return;
//     }
 
// };

// Function for grabbing message input and sending to Firebase.
function submitMessage(e) {

    e.preventDefault();

    var message = $("#chat-input").val().trim();

    if (sessionStorage.getItem("player") === "player1") {
        player1MessagesRef.push(message);
    } else if (sessionStorage.getItem("player") === "player2") {
        player2MessagesRef.push(message);
    } else {
        return;
    }

    $("#chat-input").val("");

};

// Function for rendering the chat box text.
function renderChat(data) {

    var newP = $("<p>");
    var chatBox = $("#chat-box");

    if (data.ref.parent.key === "player-1") {
        // console.log(data.val());
        newP
            .addClass("p1-chat-text")
            .text(data.val());
        chatBox.append(newP);
    } else if (data.ref.parent.key === "player-2") {
        // console.log(data.val());
        newP
            .addClass("p2-chat-text")
            .text(data.val());
        chatBox.append(newP);
    }

};

// Function for setting player selection in Firebase.
function submitSelection() {

    var selection = $(this).attr("data-choice");

    if ($(this).hasClass("player-1")) {
        database.ref("players/player-1/selection").set(selection);
    } else {
        database.ref("players/player-2/selection").set(selection);
    }

};

// Function that renders player's selections on the screen given a change in Firebase's "selection" value.
function renderSelection(data) {

    // Store selection type.
    var selection = data.val().selection;

    // Then add that image to the appropriate spot based on the corresponding database key.
    if (data.key === "player-1") {
        var target = $(".p1-choice");
        target.html("<img src='assets/images/" + selection + ".png' />");
    } else {
        var target = $(".p2-choice");
        target.html("<img src='assets/images/" + selection + ".png' />");
    }

};

// Function that renders wins.
function renderWins(data) {

    // Store wins value.
    var wins = data.val().wins;

    // Then add that image to the appropriate spot based on the corresponding database key.
    if (data.key === "player-1") {
        var target = $(".p1-score");
        target.text(wins);
    } else {
        var target = $(".p2-score");
        target.text(wins);
    }

};

// When player selects an option, set that value in Firebase.
$(".player-select-icon").on("click", submitSelection);

// If we submit messages, push them to Firebase.
$("#chat-submit").on("click", submitMessage);

// If a selection value changes, render that selection on the page.
player1Ref.on("value", renderSelection);
player2Ref.on("value", renderSelection);

// If wins change, render change.
player1Ref.on("value", renderWins);
player2Ref.on("value", renderWins);

// If messages are submitted, display them in the chat box.
// messagesRef.on("child_added", renderChat);
// messagesRef.child("player-2").on("child_added", renderChat);
player1MessagesRef.on("child_added", renderChat);
player2MessagesRef.on("child_added", renderChat);

// Listen for changes in client connection states.
connectedRef.on("value", function(data) {

    // If there is a connection..
    if (data.val()) {

        // Add user to the connections list.
        var connected = connectionsRef.push(true);
        
        // Remove user from the connection list on disconnect.
        connected.onDisconnect().remove();

    }

});

// Change player states to "true" based on the number of active connections.
connectionsRef.on("value", function(data) {

    console.log(data.val());
    database.ref("players/player-1/connected").set("false");
    database.ref("players/player-2/connected").set("false");

    if (data.numChildren() === 1) {
        database.ref("players/player-1/connected").set("true");
        player1Present = true; // SET THIS TO THE ACTUAL VALUE IN FIREBASE.
    } else if (data.numChildren() === 2) {
        database.ref("players/player-1/connected").set("true");
        database.ref("players/player-2/connected").set("true");
        player2Present = true; // SET THIS TO THE ACTUAL VALUE IN FIREBASE.
    } else if (data.numChildren() > 2) {
        return;
    }

    // Set the session stoarge based on presence.
    if (player1Present && !player2Present) {
        sessionStorage.setItem("player", "player1");
    } else if (player1Present && player2Present && !sessionStorage.getItem("player")) {
        sessionStorage.setItem("player", "player2");
    } else {
        return;
    }

});

// setID();
import './quiz.html';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import {
    RaceDB,
    StopWatch,
    WinnerRace,
    EnginePower,
    Players,
    Teams
} from '/imports/api/RaceDB/RaceDB.js';

//
var io = require('socket.io-client');
try {
    var socket = io.connect(Meteor.settings.public.socketIO);
} catch (error) {
    console.error('cant connect to websocket pusher.', error);
}

// var to adjust per player

var carRoom = "/game/app/ui/controller01";
var carNo = "";
var teamName = "";

// result Question submitted to:
var dbwriteRoom = "/game/app/ui/quiz";

/**
 * Qlik Questions
 */

var questions = [{
        question: "What is the USP of Qlik?",
        choices: ["A. Associative model", "B. Scripting ", "C. Database structure", "D. Green color"],
        correctAnswer: 0,
        points: mediumQuestion
    },

    {
        question: "What is the name of the CEO of Qlik?",
        choices: ["A. Satya Nade ", "B. Adam Selipsky ", "C. Lars Bjork", "D. Michael J. Saylor"],
        correctAnswer: 2,
        points: easyQuestion
    },
    {
        question: "How many customers does Qlik serve?",
        choices: ["A. <10.000", "B. <20.000 ", "C. <30.000", "D. >40.000"],
        correctAnswer: 3,
        points: easyQuestion
    },
    {
        question: "What do the colors green and light grey respectively mean",
        choices: ["A. Excluded, Possible", "B. Selected, Excluded ", "C. Selected, Alternative", "D. Selected, Possible"],
        correctAnswer: 2,
        points: hardQuestion
    },
    {
        question: "In which country did Qlik start?",
        choices: ["A. USA", "B. Belgium", "C. India", "D. Sweden"],
        correctAnswer: 3,
        points: easyQuestion
    },
    {
        question: "When was Qlik founded?",
        choices: ["A. 1993", "B. 1997", "C. 2003", "D. 2007"],
        correctAnswer: 1,
        points: mediumQuestion
    },
    {
        question: "How many years is Qlik successively positioned in the 'Leaders' Quadrant of Gartner Magic?",
        choices: ["A. 4", "B. 6", "C. 7", "D. 9"],
        correctAnswer: 2,
        points: easyQuestion
    },

    /**
     * Race Questions
     */

    {
        question: "How many races where there in 2016? (Dashboard)",
        choices: ["A. 9", "B. 12", "C. 21", "D. 24"],
        correctAnswer: 2,
        points: easyQuestion
    },
    {
        question: "In 2016 which country delivered the most drivers? (Dashboard)",
        choices: ["A. UK", "B. Germany", "C. Autralia", "D. Netherlands"],
        correctAnswer: 1,
        points: easyQuestion
    },
    {
        question: "In the period 2015-17 who was the best driver in terms of 1st positions and points? (Driver)",
        choices: ["A. Ricciardo", "B. Hamilton", "C. Rosberg", "D. Vettel"],
        correctAnswer: 1,
        points: easyQuestion
    },
    {
        question: "Which constructor won the most races in the last 5 years (2013-2017)? (Constructors)",
        choices: ["A. Red Bull, 2.344 points",
            "B. Red Bull, 1.830 points",
            "C. Mercedes, 2.859 points",
            "D. Mercedes, 2.102 points"
        ],
        correctAnswer: 2,
        points: easyQuestion
    },
    {
        question: "Which constructor had only 1 point over the last 5 years ('13-'17) ? (Constructors)",
        choices: ["A. Manor Marussia",
            "B. Toro Rosso",
            "C. Lotus F1",
            "D. Force India"
        ],
        correctAnswer: 2,
        points: easyQuestion
    },
    {
        question: "Who won the Monaco Grand Prix in 2016? (Race)",
        choices: ["A. Perez, 2:01:48",
            "B. Hamilton 1:59:29",
            "C. Perez, 1:58:45",
            "D. Hamilton, 2:00:57"
        ],
        correctAnswer: 1,
        points: easyQuestion
    },
    {
        question: "How many times did he overtake competitors? (Race)",
        choices: ["A. 1",
            "B. 2",
            "C. 3",
            "D. 4"
        ],
        correctAnswer: 1,
        points: easyQuestion
    },
    {
        question: "Which drivers have 5 stops in the Brazilian Grand Prix 2016? (Race)",
        choices: ["A. Bottas, Massa, Verstappen",
            "B. Alonso, Verstappen, Bottas",
            "D. Verstappen, Ricciardo, Button",
            "C. Vettel, Ricciardo, Verstappen"
        ],
        correctAnswer: 3,
        points: easyQuestion
    }

];
var easyQuestion = 2;
var mediumQuestion = 6;
var hardQuestion = 15;
var answerValue = "not set";
var currentQuestion = 0;
var correctAnswers = 0;
var incorrectAnswers = 0;
var quizOver = false;


Template.quiz.onCreated(function() {
    //get the team by checking the current url path
    if (Router.current().route.getName() === 'quiz01') {
        carNo = 'car01'
    } else {
        carNo = 'car02'
    }
})

Template.quiz.onRendered(function() {
    $(document).find(".endOfGame").hide();
    // Display the first question
    displayCurrentQuestion();
    $(this).find(".quizMessage").hide();
    $(document).find(".quizMessage").hide();
});

Template.quiz.helpers({
    teamName: function() {
        var team = Teams.findOne({ team: carNo });
        if (team) {
            return teamName = team.name
        }
    },
    question: function() {
        var question = currentQuestion + 1 + ": " + questions[currentQuestion].question + " (" + questions[currentQuestion].points + "% points)";
        return question;
    },
    options: function() {

    }
});

Template.quiz.events({
    'click .nextButton': function(event, template) {
        console.log('next question clicked');
        evaluateAnswer();
    }
});

function evaluateAnswer() {
    if (!quizOver) {
        value = $("input[type='radio']:checked").val();
        if (value == undefined) {
            $(document).find(".quizMessage").text("Please select an answer");
            $(document).find(".quizMessage").show();
        } else {
            // if question incorrect ////////////////////////////
            if (value == questions[currentQuestion].correctAnswer) {

                answerValue = "Correct";
                //                    $(document).find(".quizMessage").hide();
                $(document).find(".quizMessage").text('That answer was correct!');
                $(document).find(".quizMessage").show();
                correctAnswers++;
                //                    $(document).find(".quizContainer > .result").show();
                $(document).find(".quizContainer > .result").text("Your car engine power is increased with " + questions[currentQuestion].points + " % more motor power");
                // socket send message
                // f;50;l;100;0
                var increaseMotorPower = "0;0;0;0;" + questions[currentQuestion].points;

                console.log(increaseMotorPower + ' %power sent to socket: ' + carRoom);
                socket.emit('publish', {
                    room: carRoom,
                    message: increaseMotorPower
                });

            } // if question incorrect ////////////////////////////
            else {
                answerValue = "Incorrect";
                $(document).find(".quizContainer > .result").hide();
                var corrAnswer = questions[currentQuestion].choices[questions[currentQuestion].correctAnswer];
                $(document).find(".quizMessage").text('That answer was wrong. The correct answer was: ' + corrAnswer);
                $(document).find(".quizMessage").show();

                incorrectAnswers++;
            }

            if (value != undefined) {
                // insert into db
                var message = 'carNo,' + carNo; //[0]
                message += ';teamName,' + teamName; //[1]
                message += ';questionId,' + currentQuestion; //[2]
                message += ';answer,' + value; //[3]
                message += ';points,' + questions[currentQuestion].points; //[4]
                message += ';answerValue,' + answerValue; //[5]

                obj = {
                    room: dbwriteRoom,
                    message: message
                };

                //                        sessionId: "", 
                //                        carNo: carNo ,
                //                        teamName: teamName,
                //                        timeStamp: "now",
                //                        questionId: currentQuestion,
                //                        answer: value,
                //                        points: questions[currentQuestion].points,
                //                        answerValue: answerValue
                console.log(obj);
                socket.emit('publish', obj);
            }

            currentQuestion++; // Since we have already displayed the first question on DOM ready


            if (currentQuestion < questions.length) {
                displayCurrentQuestion() + displayScore();
            } else {
                //                    displayScore();
                //                    $(document).find(".nextButton").toggle();
                //                    $(document).find(".playAgainButton").toggle();
                // Change the text in the next button to ask if user wants to play again
                //                    $(document).find(".nextButton").text("End of Game!");
                $(document).find(".nextButton").hide();
                $(document).find(".endOfGame").show();
                quizOver = true;
            }
        }
    } else { // quiz is over and clicked the next button (which now displays 'Play Again?'
        quizOver = false;
        $(document).find(".nextButton").html('<div class="ui positive button"> Next bies Question</div>');
        resetQuiz();
        displayCurrentQuestion();
        hideScore();
    }

}

// This displays the current question AND the choices

function displayCurrentQuestion() {
    var question = currentQuestion + 1 + ": " + questions[currentQuestion].question + " (" + questions[currentQuestion].points + "% points)";
    console.log('questions', questions)
    console.log('questions[currentQuestion]', questions[currentQuestion])
    console.log('currentQuestion', currentQuestion)
    console.log('question', question)
    var questionClass = $(document).find(".quizContainer .question");
    var choiceList = $(document).find(".quizContainer .choiceList");
    var numChoices = questions[currentQuestion].choices.length;
    var pointsQuestion = questions[currentQuestion].points;

    console.log("Current question: " + currentQuestion + ". For " + pointsQuestion + " points");

    // Set the questionClass text to the current question
    $(questionClass).text(question);

    // Remove all current <li> elements (if any)
    $(choiceList).find(".field").remove();

    var choice;
    for (i = 0; i < numChoices; i++) {
        choice = questions[currentQuestion].choices[i];
        var selector = '<div class="field"><div class="ui radio checkbox"><input type="radio" value=' + i + ' name="dynradio" class="hidden"> <label>' + choice + '</label> </div> </div>'
        $(selector).appendTo(choiceList);
    }
    //enable semantic ui checkbox
    $('.ui.radio.checkbox')
        .checkbox();
}

function resetQuiz() {
    currentQuestion = 0;
    correctAnswers = 0;
    hideScore();
}

function displayScore() {

    //    $(document).find(".quizContainer > .result").text("You scored: " + correctAnswers 
    //        +" point. Your driver has earned " + increaseMotorPower + " % more motor power");
    // $(document).find(".quizContainer > .result").text("You scored: " + correctAnswers +" out of " + questions.length + ". Your driver has earned " + increaseMotorPower + " % more motor power");
    $(document).find(".quizContainer > .result").show();
    //    motorPowerIncrease(increaseMotorPower);
}

function hideScore() {
    $(document).find(".result").hide();
}

function mongodbInsertOne(coll, arg) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        db.collection(coll).insertOne(arg, function(err, res) {
            if (err) throw err;
            console.log("1 record inserted");
            db.close();
        });
    });
};
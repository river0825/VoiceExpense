'use strict';

angular.module('voiceExpenseApp')
// .controller('MainCtrl', ['$scope', '$speechRecognition', '$speechSynthetis', function ($scope, $speechRecognition, $speechSynthetis) {
.controller('MainCtrl', ['$scope', '$localForage',
    function($scope, $localForage) {
    	var ignore_onend = false;
    	var start_timestamp; 
    	var timeoutHandle;

        $scope.lang = "cmn-Hant-TW";
        $scope.info = "total";

        $scope.start = function(e) {
        	$scope.recognizing = true;
        	$scope.final_transcript = '';
			recognition.lang = $scope.lang;  //select_dialect.value;
			recognition.start();
			ignore_onend = false;
			start_timestamp = new Date();

			$scope.addExpense();
        }

        $scope.stop = function(e){
        	$scope.recognizing = false;
			recognition.stop();
			$scope.expenses.pop();
        }


        $scope.addExpense = function(e) {
            var expense = {
                date: new Date,
                caption: "請說你買了什麼",
                amount: parseInt("0") || 0,
                status: '_YET'
            };

            $scope.expenses.unshift(expense);

            if(timeoutHandle){
            	clearTimeout(timeoutHandle);
            }

			timeoutHandle = setTimeout(function() {
				console.log("auto stop");
				$scope.stop();
			}, 30 * 1000);
        };

        $scope.confirmExpense = function(e) {
            e.status = 'OKZ';
            console.log("confrm");

            $localForage.setItem('myExpense', $scope.expenses);
        };

        $scope.removeExpense = function(e) {
            e.status = 'RJT';
            console.log("remove");
            console.log(e);
        }

        $scope.sum = function() {
            var s = 0;
            for (var i in $scope.expenses) {
                var e = $scope.expenses[i];
                if (e.status == "OKZ") {
                    s = s + e.amount;
                }
            }

            return s;
        }

        $scope.statusFilter = function(expense) {
            return (expense.status == 'OKZ') || (expense.status == '_YET');
        }

        // init value
		$localForage.getItem('myExpense').then(function(data) {
			$scope.expenses = data || [];
		});


        function parseExpense(transcript){
        	var p = /(\d*)[元]?(.*)/ig ;
			var r = p.exec(transcript);

			if(r.length == 3){
        		return {caption:r[2], amount:r[1]};
        	}else{
        		return undefined;
        	}
        }

        //voice reconizer

        window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        var recognition = new window.SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = function() {
            $scope.recognizing = true;
            $scope.info = 'say something  200元午餐';
            // start_img.src = '/intl/en/chrome/assets/common/images/content/mic-animate.gif';
        }



        recognition.onerror = function(event) {
        	ignore_onend = true;

            if (event.error == 'no-speech') {
                $scope.info = 'info_no_speech';
                
            }
            if (event.error == 'audio-capture') {
            	$scope.info = 'info_no_microphone';
            }
            if (event.error == 'not-allowed') {
                if (event.timeStamp - start_timestamp < 100) {
                	$scope.info = 'not allowed microphone';
                } else {
                	$scope.info = 'microphone denied';
                }
            }
        };

        recognition.onend = function() {
            $scope.recognizing = false;
            if (ignore_onend) {
                return;
            }

            if (!$scope.final_transcript) {
                $scope.info = 'info_start';
                return;
            }
        };


        recognition.onresult = function(event) {
            $scope.interim_transcript = '';

            if (typeof(event.results) == 'undefined') {
                recognition.onend = null;
                recognition.stop();
                // upgrade();
                return;
            }

            for (var i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    $scope.final_transcript = event.results[i][0].transcript;
                  	
                  	$scope.$apply( function() {
				        var expense = parseExpense($scope.final_transcript);
	                    $scope.expenses[0].caption = expense.caption || "我聽不清楚";
	                    $scope.expenses[0].amount = parseInt( expense.amount) || 0;
	                    $scope.addExpense();
				    });

                    
                    
                } else {
                    $scope.interim_transcript = event.results[i][0].transcript;
                    $scope.$apply( function() {
				        $scope.expenses[0].caption = $scope.interim_transcript;
				    });
                    
                }
            }

			
            console.log($scope.expenses[0].caption);

            // if (final_transcript || interim_transcript) {
            //     showButtons('inline-block');
            // }
        };

    }
]);
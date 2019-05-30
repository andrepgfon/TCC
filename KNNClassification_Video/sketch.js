textArea// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
KNN Classification on Webcam Images with mobileNet. Built with p5.js
=== */
let video;
// Create a KNN classifier
const knnClassifier = ml5.KNNClassifier();
let featureExtractor;

let gestureNumber = 0
let gestures      = []

function setup() {
  // Create a featureExtractor that can extract the already learned features from MobileNet
  featureExtractor = ml5.featureExtractor('MobileNet', modelReady);
  noCanvas();
  // Create a video element
  video = createCapture(VIDEO);
  // Append it to the videoContainer DOM element
  video.parent('videoContainer');
  // Create the UI buttons
  createButtons();
}

function modelReady(){
  select('#status').html('FeatureExtractor(mobileNet model) Loaded')
}

// Add the current frame from the video to the classifier
function addExample(label) {
  // Get the features of the input video
  const features = featureExtractor.infer(video);
  // You can also pass in an optional endpoint, defaut to 'conv_preds'
  // const features = featureExtractor.infer(video, 'conv_preds');
  // You can list all the endpoints by calling the following function
  // console.log('All endpoints: ', featureExtractor.mobilenet.endpoints)

  // Add an example with a label to the classifier
  knnClassifier.addExample(features, label);
  updateCounts();
}

// Predict the current frame.
function classify() {
  // Get the total number of labels from knnClassifier
  const numLabels = knnClassifier.getNumLabels();
  if (numLabels <= 0) {
    console.error('There is no examples in any label');
    return;
  }
  // Get the features of the input video
  const features = featureExtractor.infer(video);

  // Use knnClassifier to classify which label do these features belong to
  // You can pass in a callback function `gotResults` to knnClassifier.classify function
  knnClassifier.classify(features, gotResults);
  // You can also pass in an optional K value, K default to 3
  // knnClassifier.classify(features, 3, gotResults);

  // You can also use the following async/await function to call knnClassifier.classify
  // Remember to add `async` before `function predictClass()`
  // const res = await knnClassifier.classify(features);
  // gotResults(null, res);
}

// A util function to create UI buttons
function createButtons() {


  // When the A button is Clicked, add the current frame
  // from the video with a label of "rock" to the classifier
  buttonA = select('#addClassRock');
  buttonA.mouseClicked(function() {
    addExample('Rock');
  });

  // When the B button is Clicked, add the current frame
  // from the video with a label of "paper" to the classifier
  buttonB = select('#addClassPaper');
  buttonB.mouseClicked(function() {
    addExample('Paper');
  });

  // When the C button is Clicked, add the current frame
  // from the video with a label of "scissor" to the classifier
  buttonC = select('#addClassScissor');
  buttonC.mouseClicked(function() {
    addExample('Scissor');
  });

  // Reset buttons
  resetBtnA = select('#resetRock');
  resetBtnA.mouseClicked(function() {
    clearLabel('Rock');
  });

  resetBtnB = select('#resetPaper');
  resetBtnB.mouseClicked(function() {
    clearLabel('Paper');
  });

  resetBtnC = select('#resetScissor');
  resetBtnC.mouseClicked(function() {
    clearLabel('Scissor');
  });

  // Predict button
  buttonPredict = select('#buttonPredict');
  buttonPredict.mouseClicked(classify);

  // Clear all classes button
  buttonClearAll = select('#clearAll');
  buttonClearAll.mouseClicked(clearAllLabels);

  // Load saved classifier dataset
  buttonSetData = select('#load');
  buttonSetData.mouseClicked(loadMyKNN);

  // Get classifier dataset
  buttonGetData = select('#save');
  buttonGetData.mouseClicked(saveMyKNN);

  buttonAddGesture = select('#addGesture');
  buttonAddGesture.mouseClicked(addGesture);

  textArea = $("#textArea").keyup(function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        document.getElementById("addGesture").click()
    }
  });
}

function addGesture(){

  gestureNumber++;

  textArea = select("input");
  gestureName = ((textArea.elt.value === undefined || textArea.elt.value === '') ? "Gesture"+gestureNumber : textArea.elt.value);
  buttonArea = document.getElementById('buttonArea');


  createGestureTitle();
  createGestureAddExample();
  createGestureClearLable();
//  createGestureExampleNumber();
  gestureExample = document.createElement("p");
  gestureExampleNumber = document.createElement("span");
  gestureExampleNumber.innerHTML = '0';
//  createGestureConfidence();

}

function createGestureTitle(){
  classTitle = document.createElement("h4");
  classTitle.innerHTML = gestureNumber+" "+gestureName;
  buttonArea.appendChild(classTitle);
}

function createGestureAddExample(){

    gesture = document.createElement("button");
    gesture.setAttribute("id", "addClassGesture"+gestureNumber);
    gesture.setAttribute('onclick','addExample(gestureName);');
    gesture.onclick = function() {addExample(gestureName);};
    gesture.innerHTML = "Add Example to "+gestureName;
    buttonArea.appendChild(gesture);
}

function createGestureClearLable(){
    clearLabelButton = document.createElement("button");
    clearLabelButton.setAttribute("id", "resetGesture"+gestureNumber);
    clearLabelButton.setAttribute("onclick", "clearLabel(gesureName)")
    clearLabelButton.onclick = function() {clearLabel(gestureName);};
    clearLabelButton.innerHTML = "Reset class"+gestureName;
    buttonArea.appendChild(clearLabelButton);
}

// Show the results
function gotResults(err, result) {
  // Display any error
  if (err) {
    console.error(err);
  }

  if (result.confidencesByLabel) {
    const confidences = result.confidencesByLabel;
    // result.label is the label that has the highest confidence
    if (result.label) {
      select('#result').html(result.label);
      select('#confidence').html(`${confidences[result.label] * 100} %`);
    }

    select('#confidenceRock').html(`${confidences['Rock'] ? confidences['Rock'] * 100 : 0} %`);
    select('#confidencePaper').html(`${confidences['Paper'] ? confidences['Paper'] * 100 : 0} %`);
    select('#confidenceScissor').html(`${confidences['Scissor'] ? confidences['Scissor'] * 100 : 0} %`);
  }

  classify();
}

// Update the example count for each label
function updateCounts() {
  const counts = knnClassifier.getCountByLabel();

  select('#exampleRock').html(counts['Rock'] || 0);
  select('#examplePaper').html(counts['Paper'] || 0);
  select('#exampleScissor').html(counts['Scissor'] || 0);
}

// Clear the examples in one label
function clearLabel(label) {
  knnClassifier.clearLabel(label);
  updateCounts();
}

// Clear all the examples in all labels
function clearAllLabels() {
  knnClassifier.clearAllLabels();
  updateCounts();
}

// Save dataset as myKNNDataset.json
function saveMyKNN() {
  knnClassifier.save('myKNNDataset');
}

// Load dataset to the classifier
function loadMyKNN() {
  knnClassifier.load('./myKNNDataset.json', updateCounts);
}

var userAgent = navigator.userAgent;
let stream;
let recorder;
let audioURL;

const slmUrl = {
  "bn-BD":
    "https://api-inference.huggingface.co/models/Afsara/cse_buet_bangla_t5",
  "en-US":
    "https://api-inference.huggingface.co/models/Afsara/fb_bart_large_cnn",
};

let chunks = [];

// async function query(data, lang) {
//   try {
//     const response = await fetch(slmUrl[lang], {
//       headers: {
//         Authorization: `Bearer ${import.meta.env.VITE_HF_TOKEN}`,
//       },
//       method: "POST",
//       body: JSON.stringify(data),
//     });
//     const result = await response.json();
//     return result;
//   } catch (error) {
//     console.log(error);
//   }
// }

function capitalizeSentences(text) {
      return text.replace(/(^\w|\.\s*\w)/g, function(match) {
        return match.toUpperCase();
      });
}

// Check if the user's browser is Google Chrome
if (userAgent.indexOf("Chrome") == -1) {
  // If the user's browser is not Google Chrome, display an error message
  alert(
    "Error: This website is only for for Google Chrome. Please use Google Chrome to access this site."
  );
} else {
  if ("webkitSpeechRecognition" in window) {
    // Initialize webkitSpeechRecognition
    let speechRecognition = new webkitSpeechRecognition();
    const languageSelector = document.getElementById("lang-select");

    // String for the Final Transcript
    let final_transcript = "";
    let isRecognitionStarted = false;
    // Set the properties for the Speech Recognition object
    speechRecognition.continuous = true;
    speechRecognition.interimResults = true;
    speechRecognition.lang = languageSelector.value;

    languageSelector.addEventListener("change", (event) => {
      speechRecognition.stop();
      speechRecognition.lang = event.target.value;
      if (isRecognitionStarted) {
        setTimeout(() => {
          isRecognitionStarted = true;
          speechRecognition.start();
        }, 1000); //We call recognition.start() in a timeout to make sure the abort() function is done
      }
    });


    speechRecognition.onresult = (event) => {
      // Create the interim transcript string locally because we don't want it to persist like final transcript
      let interim_transcript = "";

      // Loop through the results from the speech recognition object.
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        // If the result item is Final, add it to Final Transcript, Else add it to Interim transcript
        if (event.results[i].isFinal) {
          final_transcript += `${capitalizeSentences(event.results[i][0].transcript)}${
            languageSelector.value === "bn-BD" ? "।" : "."
          } `;

          speechRecognition.stop();
          if (isRecognitionStarted) {
            setTimeout(() => {
              speechRecognition.start();
            }, 500);
          }
        } else {                 
          interim_transcript += event.results[i][0].transcript + " ";
        }
      }

      // Set the Final transcript and Interim transcript.
      document.querySelector("#final").innerHTML = final_transcript;
      document.querySelector("#interim").innerHTML = interim_transcript;
    };

    // let timer = null;

    // Set the onClick property of the start button
    const startButton = document.getElementById("start");
    const stopButton = document.getElementById("stop");
    const editButton = document.getElementById('edit');
    const transcribeButton = document.querySelector("#transcribe");
    const clearButton = document.querySelector("#clear");
    const downloadButton = document.getElementById("downloadbutton");
    const deleteAudioButton = document.getElementById("deleteaudio");

    startButton.onclick = async () => {
      speechRecognition.start();
      isRecognitionStarted = true;
      stopButton.disabled = false;
      stopButton.setAttribute("aria-disabled", "false");
      document.getElementById('final').contentEditable = false;
      editButton.disabled = true;
      editButton.setAttribute("aria-disabled", true);
      startButton.disabled = true;
      startButton.setAttribute("aria-disabled", "true");
      transcribeButton.disabled = true;
      transcribeButton.setAttribute("aria-disabled", "true");
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recorder = new MediaRecorder(stream);
      let startTime = 0;
      // Start recording.
      recorder.start();
      recorder.ondataavailable = async (e) => {
        // Write chunks to the file.
        // const elapsedTime = Date.now() - startTime;
        // const elapsedMinutes = Math.floor(elapsedTime / 1000);
        // console.log("elapsed==", elapsedMinutes)

        // if (elapsedMinutes >= 10) {
        //   alert('its been one minute');
        //   return;
        // }
        chunks.push(e.data);
        if (recorder.state === "inactive") {
        }
      };

      recorder.onstop = (e) => {
        const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
        chunks = [];
        audioURL = window.URL.createObjectURL(blob);
        // Close the file when the recording stops.
        downloadButton.style = "display: block";
        deleteAudioButton.style = "display: block";
        downloadButton.href = audioURL;
        downloadButton.download = "sample.wav";
        // downloadButton.click();
        // window.URL.revokeObjectURL(audioURL);
        const tracks = stream.getTracks();
        // When all tracks have been stopped the stream will
        // no longer be active and release any permissioned input
        tracks.forEach((track) => track.stop());
      };
      document.querySelector(
        "#transcribed"
      ).innerHTML = `Press summarize after stopping if you want a summary. Please wait for summary, this may take a few minutes.`;
    };
    // Set the onClick property of the stop button
    stopButton.onclick = () => {
      // Stop the Speech Recognition

      setTimeout(() => {
        speechRecognition.stop();
      }, 320);
      isRecognitionStarted = false;
      stopButton.disabled = true;
      stopButton.setAttribute("aria-disabled", "true");
      editButton.disabled = false;
      editButton.setAttribute("aria-disabled", "false");
      startButton.disabled = false;
      startButton.setAttribute("aria-disabled", "false");
      transcribeButton.disabled = false;
      transcribeButton.setAttribute("aria-disabled", "false");
    };
    clearButton.onclick = () => {
      final_transcript = "";
      document.querySelector("#final").innerHTML = final_transcript;
      editButton.disabled = true;
      editButton.setAttribute("aria-disabled", true);
    };
    // document.querySelector("#transcribed").innerHTML = `
    // <div class="progress" role="progressbar" aria-label="Animated striped example" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">
    //       <div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 100%"></div>
    //     </div>`;
    // // Set the onClick property of the transcribe button
    transcribeButton.onclick = async () => {
      try {
        if (!["bn-BD", "en-US"].includes(languageSelector.value)) {
          alert(
            "This language is not supported yet. Only bangla and english is available."
          );
          return;
        }
        if (final_transcript.length === 0) {
          alert("Not enough text to transcribe");
          return;
        }
        document.querySelector(
          "#transcribed"
        ).innerHTML = `<div class="progress" role="progressbar" aria-label="Animated striped example" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">
          <div class="progress-bar progress-bar-striped progress-bar-animated" style="width: 100%"></div>
        </div>`;
        startButton.disabled = true;
        startButton.setAttribute("aria-disabled", "true");
        stopButton.disabled = true;
        stopButton.setAttribute("aria-disabled", "true");
        editButton.disabled = true;
        editButton.setAttribute("aria-disabled", "true");
        transcribeButton.disabled = true;
        transcribeButton.setAttribute("aria-disabled", "true");
        const response = await fetch(
          `${
            import.meta.env.DEV ? import.meta.env.VITE_SERVER_URL : ""
          }/transcribe`,
          {
            method: "post",
            body: JSON.stringify({
              message: final_transcript,
              lang: languageSelector.value,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        // if (Object.keys(slmUrl).includes(languageSelector.value)) {
        //   query({ inputs: final_transcript }, languageSelector.value).then(
        //     (response) => {
        //       console.log(JSON.stringify(response));
        //     }
        //   );
        // }
        const data = await response.json();
        document.querySelector("#transcribed").innerHTML = data.message;
      } catch (error) {
        console.log(error.message);
      }
      transcribeButton.disabled = false;
      transcribeButton.setAttribute("aria-disabled", "false");
      // final_transcript = "";
      startButton.disabled = false;
      startButton.setAttribute("aria-disabled", "false");
    };
    deleteAudioButton.onclick = (e) => {
      window.URL.revokeObjectURL(audioURL);
      deleteAudioButton.style = "display: none";
      downloadButton.style = "display: none";
    };
    editButton.onclick = () => {
       let finalTranscript = document.getElementById('final');
       finalTranscript.contentEditable = true;
       finalTranscript.focus()
    }
    // Callback Function for the onStart Event
    speechRecognition.onstart = (e) => {
      console.log("start");
      // Show the Status Element
      // document.querySelector("#status").style.display = "block";
    };
    speechRecognition.onerror = () => {
      console.log("error");
      // Hide the Status Element
      // document.querySelector("#status").style.display = "none";
    };
    speechRecognition.onend = () => {
      console.log("stopped");
      if (isRecognitionStarted) {
        speechRecognition.start();
      }
      if (!isRecognitionStarted) {
        recorder.stop();
      }
    };
  } else {
    console.log("Speech Recognition Not Available");
  }
}

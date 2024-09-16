let audioContext;
let source;
let stream;
let mediaRecorder;
let recordedChunks = [];

document.getElementById('start').addEventListener('click', async () => {
    try {
        // Set higher quality audio constraints
        const constraints = {
            audio: {
                sampleRate: 44100, // Standard sample rate
                channelCount: 1,   // Mono
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false
            }
        };

        stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('Microphone access granted:', stream);

        audioContext = new (window.AudioContext || window.webkitAudioContext)({
            sampleRate: 44100 // Match the sample rate
        });
        console.log('AudioContext created:', audioContext);

        source = audioContext.createMediaStreamSource(stream);
        console.log('MediaStreamSource created:', source);

        const destination = audioContext.destination;
        source.connect(destination);
        console.log('Audio connected to destination');

        // Enable the record button
        document.getElementById('record').disabled = false;
    } catch (err) {
        console.error('Error accessing microphone:', err);
    }
});

document.getElementById('stop').addEventListener('click', () => {
    if (source) {
        source.disconnect();
        console.log('Source disconnected');
    }
    if (audioContext) {
        audioContext.close();
        console.log('AudioContext closed');
    }
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        console.log('Stream tracks stopped');
    }

    // Disable the record button
    document.getElementById('record').disabled = true;
    document.getElementById('stopRecord').disabled = true;
});

document.getElementById('record').addEventListener('click', () => {
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };
    mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'recording.webm';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    };
    mediaRecorder.start();
    console.log('Recording started');

    // Enable the stop recording button and disable the record button
    document.getElementById('record').disabled = true;
    document.getElementById('stopRecord').disabled = false;
});

document.getElementById('stopRecord').addEventListener('click', () => {
    mediaRecorder.stop();
    console.log('Recording stopped');

    // Disable the stop recording button
    document.getElementById('stopRecord').disabled = true;
});

// Show Toastr notification when the modal is closed
$('#instructionModal').on('hidden.bs.modal', function () {
    toastr.info('Reload the page before starting another recording.', 'Info', {
        positionClass: 'toast-top-right',
        timeOut: 5000
    });
});
let audioContext;
let source;
let stream;
let mediaRecorder;
let recordedChunks = [];

document.addEventListener('DOMContentLoaded', function() {
    const startButton = document.getElementById('start');
    const stopButton = document.getElementById('stop');
    const recordButton = document.getElementById('record');
    const stopRecordButton = document.getElementById('stopRecord');

    startButton.addEventListener('click', async () => {
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
            recordButton.disabled = false;

            // Toggle button visibility
            startButton.style.display = 'none';
            stopButton.style.display = 'inline-block';
        } catch (err) {
            console.error('Error accessing microphone:', err);
        }
    });

    stopButton.addEventListener('click', () => {
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

        // Toggle button visibility
        stopButton.style.display = 'none';
        startButton.style.display = 'inline-block';

        // Disable the record button
        recordButton.disabled = true;
        stopRecordButton.disabled = true;
    });

    recordButton.addEventListener('click', () => {
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
        recordButton.disabled = true;
        stopRecordButton.disabled = false;
    });

    stopRecordButton.addEventListener('click', () => {
        mediaRecorder.stop();
        console.log('Recording stopped');

        // Disable the stop recording button
        stopRecordButton.disabled = true;
        recordButton.disabled = false;
    });

    
});
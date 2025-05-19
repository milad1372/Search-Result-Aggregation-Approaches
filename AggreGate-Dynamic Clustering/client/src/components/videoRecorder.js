import saveVideoInFileServer from "../api/saveVideoIntoFileSystem";
import RecordRTC from 'recordrtc';

class DHAVideoRecorder {

    constructor() {
        this.recorder = null;
    }

    async initRecorder() {
        const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
        this.recorder = RecordRTC(stream, {
            type: 'video',
            mimeType: 'video/webm'
        });
        this.recorder.startRecording();
        setInterval(() => {
            console.log("sending video ......");
            this.sendVideo();
        }, 120000);
    }

    async sendVideo() {
        if (!this.recorder) {
            console.log("recorder: ", this.recorder)
            return;
        }

        this.recorder.stopRecording(async () => {
            const blob = this.recorder.getBlob();
            console.log("blob", blob)
            const formData = new FormData();
            formData.append('video', blob, this.generateRandomString() + '.webm');
            await saveVideoInFileServer(formData).then(() => {
                this.recorder.clearRecordedData();
                this.recorder.startRecording();
            }).catch((error) => {
                console.error(error);
                this.recorder.resumeRecording();
            });
        });
        this.recorder.startRecording();
    }

    generateRandomString = () => {
        let username = localStorage.getItem('loggedInUser');
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const hour = String(currentDate.getHours()).padStart(2, '0');
        const minute = String(currentDate.getMinutes()).padStart(2, '0');
        const second = String(currentDate.getSeconds()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}-${hour}-${minute}-${second}`;
        console.log(formattedDate);
        if (window.crypto) {
            let a = window.crypto.getRandomValues(new Uint32Array(3)),
                token = '';
            for (let i = 0, l = a.length; i < l; i++) token += a[i].toString(36);
            return formattedDate + "_" + username + "_" + token;
        } else {
            return formattedDate + "_" + username + "_" + (Math.random() * new Date().getTime()).toString(36).replace(/\./g, '');
        }
    }
}

export default new DHAVideoRecorder();

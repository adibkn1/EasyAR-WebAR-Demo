/**
 * WebAR base class
 * For camera settings parameters, please refer to: https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints
 * If video playback stutters after opening the camera, try setting frameRate, height and width
 */
class WebAR {
    /**
     * Initialize Web AR
     * @param interval Recognition interval (milliseconds)
     * @param recognizeUrl Recognition service address
     * @param token Token for authentication
     * @param container Container required for webAR to run
     */
    constructor(interval, recognizeUrl, token, container) {
        // Recognition interval (milliseconds)
        this.interval = 1000;
        // Authentication token and Cloud Recognition Service AppId
        this.token = { crsAppId: '', token: '' };
        this.isRecognizing = false;
        this.interval = interval;
        this.recognizeUrl = recognizeUrl;
        this.token = token;
        this.container = container || document.querySelector('#easyar');
        this.initVideo();
        this.initCanvas();
    }
    closeCamera() {
        if (this.videoElement && this.videoElement.srcObject) {
            // @ts-ignore
            this.videoElement.srcObject.getTracks().forEach(track => {
                console.info('stop camera');
                track.stop();
            });
        }
    }
    /**
     * Open camera
     * For camera settings parameters, please refer to: https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints
     * @returns {Promise<T>}
     * @param constraints
     */
    openCamera(constraints) {
        // If camera is already open, close it first.
        this.closeCamera();
        return new Promise((resolve, reject) => {
            navigator.mediaDevices.getUserMedia(constraints).then(stream => {                
                this.videoElement.style.display = 'block';
                this.videoElement.srcObject = stream;
                this.videoElement.play().then(() => {
                }).catch(err => {
                    console.error(`Failed to bind camera video\n${err}`);
                    reject(err);
                });
                this.videoElement.onloadedmetadata = () => {
                    const cameraSize = {
                        width: this.videoElement.offsetWidth,
                        height: this.videoElement.offsetHeight
                    };
                    console.info(`camera size ${JSON.stringify(cameraSize)}`);
                    // Simple handling of landscape/portrait orientation
                    if (window.innerWidth < window.innerHeight) {
                        // Portrait
                        if (cameraSize.height < window.innerHeight) {
                            this.videoElement.setAttribute('height', `${window.innerHeight}px`);
                        }
                    }
                    else {
                        // Landscape
                        if (cameraSize.width < window.innerWidth) {
                            this.videoElement.setAttribute('width', `${window.innerWidth}px`);
                        }
                    }
                    resolve(true);
                };
            }).catch(err => {
                reject(err);
            });
        });
    }
    /**
     * Capture camera image
     * @returns {string}
     */
    captureVideo() {
        var _a;
        (_a = this.canvasContext) === null || _a === void 0 ? void 0 : _a.drawImage(this.videoElement, 0, 0, this.videoElement.offsetWidth, this.videoElement.offsetHeight);
        return this.canvasElement.toDataURL('image/jpeg', 0.5).split('base64,')[1];
    }
    /**
     * Create video element to play camera video stream
     */
    initVideo() {
        this.videoElement = document.createElement('video');
        this.videoElement.setAttribute('playsinline', 'playsinline');
        this.container.appendChild(this.videoElement);
    }
    /**
     * Create canvas, used when capturing camera images
     */
    initCanvas() {
        this.canvasElement = document.createElement('canvas');
        this.canvasElement.setAttribute('width', `${window.innerWidth}px`);
        this.canvasElement.setAttribute('height', `${window.innerHeight}px`);
        this.canvasContext = this.canvasElement.getContext('2d');
        // document.body.appendChild(this.canvasElement);
    }
    /**
     * Start recognition
     * @param callback
     */
    startRecognize(callback) {
        this.timer = window.setInterval(() => {
            // Wait for previous recognition result
            if (this.isRecognizing) {
                return;
            }
            this.isRecognizing = true;
            // Capture an image from the camera
            const image = { image: this.captureVideo(), notracking: true, appId: this.token.crsAppId };
            // Send to server for recognition
            this.httpPost(image).then((msg) => {
                this.stopRecognize();
                callback(msg);
            }).catch((err) => {
                this.isRecognizing = false;
                console.error(err);
            });
        }, this.interval);
    }
    /**
     * Stop recognition
     */
    stopRecognize() {
        this.isRecognizing = false;
        if (this.timer) {
            window.clearInterval(this.timer);
        }
    }
    httpPost(data) {
        return fetch(`${this.recognizeUrl}/search`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json;Charset=UTF-8',
                'Authorization': this.token.token
            }
        }).then(res => res.json()).then(data => {
            var _a;
            if (!data || data.statusCode != 0) {
                console.error(data);
                return Promise.reject(((_a = data === null || data === void 0 ? void 0 : data.result) === null || _a === void 0 ? void 0 : _a.message) || 'ERROR');
            }
            return Promise.resolve(data.result);
        });
    }
}

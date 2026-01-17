/**
 * WebAR base class
 * For camera settings parameters, please refer to: https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints
 * If video playback stutters after opening the camera, try setting frameRate, height and width
 */
class WebAR {
    // Recognition interval (milliseconds)
    private readonly interval: number = 1000;
    // Recognition service address
    private readonly recognizeUrl: string;
    // Authentication token and Cloud Recognition Service AppId
    private readonly token: any = { crsAppId: '', token: '' };
    private readonly container: HTMLElement;
    // Recognition timer
    private timer: number;
    private isRecognizing: boolean = false;

    // Canvas element
    private canvasElement: HTMLCanvasElement;
    private canvasContext: CanvasRenderingContext2D | null;
    // Video element
    private videoElement: HTMLVideoElement;

    /**
     * Initialize Web AR
     * @param interval Recognition interval (milliseconds)
     * @param recognizeUrl Recognition service address
     * @param token Token for authentication
     * @param container Container required for webAR to run
     */
    constructor(interval: number, recognizeUrl: string, token: any, container: HTMLElement) {
        this.interval = interval;
        this.recognizeUrl = recognizeUrl;
        this.token = token;
        this.container = container || document.querySelector('#easyar');

        this.initVideo();
        this.initCanvas();
    }

    public closeCamera(): void {
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
    public openCamera(constraints: MediaStreamConstraints): Promise<any> {
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
                    } else {
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
    public captureVideo(): string {
        this.canvasContext?.drawImage(this.videoElement, 0, 0, this.videoElement.offsetWidth, this.videoElement.offsetHeight);
        return this.canvasElement.toDataURL('image/jpeg', 0.5).split('base64,')[1];
    }

    /**
     * Create video element to play camera video stream
     */
    private initVideo(): void {
        this.videoElement = document.createElement('video');
        this.videoElement.setAttribute('playsinline', 'playsinline');
        this.container.appendChild(this.videoElement);
    }

    /**
     * Create canvas, used when capturing camera images
     */
    private initCanvas(): void {
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
    public startRecognize(callback: (msg) => void): void {
        this.timer = window.setInterval(() => {
            // Wait for previous recognition result
            if (this.isRecognizing) {
                return
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
    public stopRecognize(): void {
        this.isRecognizing = false;
        if (this.timer) {
            window.clearInterval(this.timer);
        }
    }

    private httpPost(data: any): Promise<any> {
        return fetch(`${this.recognizeUrl}/search`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json;Charset=UTF-8',
                'Authorization': this.token.token
            }
        }).then(res => res.json()).then(data => {
            if (!data || data.statusCode != 0) {
                console.error(data);
                return Promise.reject(data?.result?.message || 'ERROR')
            }
            return Promise.resolve(data.result);
        });
    }
}

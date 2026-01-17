class App {
    private readonly clientEndUrl: string = '';
    private webAR: WebAR;
    private cameraElement: HTMLSelectElement;
    // For camera settings parameters, please refer to: https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints
    // Preset camera opening parameters
    private cameras = [
        {label: 'Default Camera', value: {audio: false, video: true}},
        {label: 'Front Camera', value: {audio: false, video: {facingMode: {exact: 'user'}}}},
        {label: 'Back Camera', value: {audio: false, video: {facingMode: {exact: 'environment'}}}}
    ];
    // Callback after successful recognition
    public callback: (msg: any) => void;

    constructor(url: string = '') {
        this.clientEndUrl = url || 'https://cn1-crs.easyar.com:8443';
        this.listCamera();
        this.initEvent();
    }

    /**
     * Initialize WebAR object
     * @param token Authentication token
     */
    public setToken(token: any): void {
        this.webAR = new WebAR(1000, this.clientEndUrl, token, document.querySelector('#easyAR'));
    }

    /**
     * Use integrated method to get token and initialize WebAR object
     */
    public useEasyAr(): void {
        // expire: validity period (seconds)
        fetch('/webar/token?expire=86400', {
            method: 'POST',
        }).then(res => res.json()).then(data => {
            return data.statusCode === 0 ? Promise.resolve(data) : Promise.reject(data.result);
        }).catch(err => {
            console.info(err);
            alert(`Failed to get token\n${err}`);
        }).then(data => {
            this.setToken(data.result);
        });
    }

    public listCamera(): void {
        this.cameraElement = document.querySelector('#videoDevice');
        this.cameras.forEach((item, index) => this.cameraElement.appendChild(new Option(item.label, `${index}`)));
    }

    public show(target: string): void {
        document.querySelector(`#${target}`).classList.remove('none');
    }

    public hide(target: string): void {
        document.querySelector(`#${target}`).classList.add('none');
    }

    /**
     * Try to open camera
     * @param p Camera parameters
     */
    public openCamera(p: MediaStreamConstraints): void {
        this.stopRecognize();
        this.webAR.openCamera(p).then(() => {
            this.show('start');
        }).catch(err => {
            console.error(err);
            alert(`Failed to open camera\n${err}`);
        });
    }

    public initEvent(): void {
        // Open camera on device
        document.querySelector('#openCamera').addEventListener('click', () => {
            this.openCamera(this.cameras[this.cameraElement.value].value);
        });

        // Start recognition
        document.querySelector('#start').addEventListener('click', () => {
            // todo: Clear rendered content (depending on business requirements)

            this.show('scanLine');
            this.hide('start');
            this.show('stop');
            this.webAR.startRecognize((msg) => {
                this.stopRecognize();
                this.show('start');
                if (this.callback) {
                    this.callback(msg);
                }
            });
        }, false);

        // Pause recognition
        document.querySelector('#stop').addEventListener('click', () => {
            this.stopRecognize();
            this.show('start');
        }, false);
    }

    private stopRecognize(): void {
        this.hide('scanLine');
        this.hide('stop');
        this.webAR.stopRecognize();
    }
}

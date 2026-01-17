class App {
    constructor(url = '') {
        this.clientEndUrl = '';
        // For camera settings parameters, please refer to: https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints
        // Preset camera opening parameters
        this.cameras = [
            { label: 'Default Camera', value: { audio: false, video: true } },
            { label: 'Front Camera', value: { audio: false, video: { facingMode: { exact: 'user' } } } },
            { label: 'Back Camera', value: { audio: false, video: { facingMode: { exact: 'environment' } } } }
        ];
        this.clientEndUrl = url || 'https://cn1-crs.easyar.com:8443';
        this.listCamera();
        this.initEvent();
    }
    /**
     * Initialize WebAR object
     * @param token Authentication token
     */
    setToken(token) {
        this.webAR = new WebAR(1000, this.clientEndUrl, token, document.querySelector('#easyAR'));
    }
    /**
     * Use integrated method to get token and initialize WebAR object
     */
    useEasyAr() {
        // expire: validity period (seconds)
        fetch('/webar/token?expire=86400', {
            method: 'POST',
        }).then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        }).then(data => {
            if (data.statusCode === 0) {
                this.setToken(data.result);
            } else {
                // Show the actual error message from the server
                const errorMsg = data.msg || data.message || JSON.stringify(data.result) || 'Failed to get token';
                throw new Error(errorMsg);
            }
        }).catch(err => {
            console.error('Failed to get token:', err);
            alert(`Failed to get token\n${err.message || err}\n\nMake sure the EasyAR-WebAR server is running.`);
        });
    }
    listCamera() {
        this.cameraElement = document.querySelector('#videoDevice');
        this.cameras.forEach((item, index) => this.cameraElement.appendChild(new Option(item.label, `${index}`)));
    }
    show(target) {
        document.querySelector(`#${target}`).classList.remove('none');
    }
    hide(target) {
        document.querySelector(`#${target}`).classList.add('none');
    }
    /**
     * Try to open camera
     * @param p Camera parameters
     */
    openCamera(p) {
        this.stopRecognize();
        this.webAR.openCamera(p).then(() => {
            this.show('start');
        }).catch(err => {
            console.error(err);
            alert(`Failed to open camera\n${err}`);
        });
    }
    initEvent() {
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
    stopRecognize() {
        this.hide('scanLine');
        this.hide('stop');
        this.webAR.stopRecognize();
    }
}

// Please get "Client-end (Target Recognition) URL" from Developer Center,
// Format example: https://af0c1ca3b........0601c74.cn1.crs.easyar.com:8443
const app = new App('Client-end (Target Recognition) URL');

// If using custom method to get token
// app.setToken({
//     'crsAppId': '', // CRS AppId of the cloud recognition database
//     'token': '' // Token generated from APIKey+APISecret
// });

// If using EasyAR's integrated environment
app.useEasyAr();

// Callback after successful recognition
app.callback = (msg) => {
    console.info(msg);
    const setting = {
        video: '//staticfile-cdn.sightp.com/sightp/webar/webardemo-final.mp4',
    };

    // You can upload setting as meta to EasyAR cloud recognition, usage as follows:
    // const setting = JSON.parse(window.atob(msg.target.meta));

    playVideo(setting);
};

// May not auto-play on mobile devices
function playVideo(setting: any): void {
    let video: HTMLVideoElement = document.querySelector('#easyARVideo');
    if (video === null) {
        video = document.createElement('video');
        video.setAttribute('id', 'easyARVideo');
        video.setAttribute('controls', 'controls');
        video.setAttribute('playsinline', 'playsinline');
        video.setAttribute('preload', 'preload');
        video.setAttribute('style', 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:99');
        document.querySelector('#easyAR').appendChild(video);
    }

    video.setAttribute('src', setting.video);
    video.play().then(() => {
    }).catch((err) => {
        // Need to use click event to play.
        console.info('Failed to play video');
        console.info(err);
    });
}

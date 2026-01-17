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
        model: 'asset/model/trex_v3.fbx',
        scale: 0.02,
        position: [0, 0, 0]
    };
    // You can upload setting as meta to EasyAR cloud recognition, usage as follows:
    // const setting = JSON.parse(window.atob(msg.target.meta));
    showModel(setting);
};
function showModel(setting) {
    const canvas = document.querySelector('.easyARCanvas');
    if (canvas) {
        canvas.remove();
    }
    app.show('loadingWrap');
    // ThreeJS simple usage class
    const threeHelper = new ThreeHelper();
    threeHelper.loadObject(setting, (p) => {
        const val = Math.ceil(p.loaded / p.total * 100);
        document.querySelector('#loadingPercent').innerHTML = `${val}%`;
        if (val >= 100) {
            app.hide('loadingWrap');
        }
    });
}

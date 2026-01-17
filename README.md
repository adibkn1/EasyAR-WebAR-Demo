# EasyAR WebAR Introduction

WebAR is a new AR product developed by EasyAR, a global leading AR open platform and AR technology leader, specifically for Web platforms (such as WeChat, Safari browser).
WebAR consists of Web frontend and EasyAR cloud services, supporting features such as planar image recognition, cloud recognition, 3D rendering, and complex interactions. WebAR has the characteristics of lightweight mode, fast deployment, and strong propagation.

EasyAR Official Website: https://www.easyar.cn https://www.easyar.com

Technical Support: support@easyar.com



## EasyAR WebAR Integrated Runtime Package

To facilitate developers to quickly set up a development environment, EasyAR-WebAR_* is an integrated runtime package that includes HTTP service and token generation service.

### File and Directory Description

EasyAR-WebAR_* files are HTTP and token generation services. If you can configure HTTP service and token generation, please ignore this section.

* EasyAR-WebAR_linux: Linux system program
* EasyAR-WebAR_darwin: Mac OS system program
* EasyAR-WebAR_windows.exe: Windows system program
* config/application.txt: Program configuration (JSON format)
    * port: Program listening port
    * apiKey: EasyAR API Key
    * apiSecret: EasyAR API Secret
    * crsAppId: EasyAR Cloud Recognition Service Crs AppId
* html: HTML, JS and other file directories

### Development Usage

1. Modify config/application.txt
    
    Fill in your Cloud Recognition API Key, API Secret and Crs AppId.

2. Start HTTP Service

   Run the EasyAR-WebAR program. If started successfully, it will display the listening port number.
   * Linux system:
       ```shell
       ./EasyAR-WebAR_linux
       ```
   * Mac OS system:
       ```shell
       ./EasyAR-WebAR_darwin
       ```
   * Windows system:
       ```
       Double-click or run in cmd: EasyAR-WebAR_windows.exe
       ```
3. Access Examples
    Enter http://127.0.0.1:3000/<demo directory> in a PC browser (camera required),
    For example: http://127.0.0.1:3000/TokenVideoExample. It is recommended to use Firefox browser.

4. If everything goes well, the first Demo will appear in your browser.

5. If the integrated package cannot run, please refer to nginx or other configurations to set up the runtime environment.

## IV. Integration into Production Environment

Domain must support HTTPS protocol

### 1. Integration with nginx

In the server section of the nginx configuration file, add the following content:

``` 
location / {
    index  index.html;
    proxy_pass   http://127.0.0.1:3000/;
}     
```

### 2. Custom Token Generation Method

Please refer to the official documentation: https://www.easyar.cn
    
## V. Good Luck

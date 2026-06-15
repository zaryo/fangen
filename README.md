# Fangen

Browser extension to find backend streaming services addresses.

## Compatibility

Currently, Fangen has official tested support for the following browsers, although it might work for others, that is not guaranteed.

- Chrome
- Firefox

## Install

### Manual installation

### Unpacked

First, clone the repository:

```bash
git clone https://github.com/zaryo/fangen
```

After that, go to your browser and load the unpacked extension:

- Chrome: Navigate to `chrome://extensions`. Enable developer mode and press "Load unpacked". Select the repository you just cloned in the previous step.

- Firefox: Navigate to `about:debugging`. Click `This Firefox` > `Load Temporary Add-on...` and select the `manifest.json` file from the repository you just cloned. 

### Usage

Go to a streaming website which you want to discover streaming server addresses.

After you play the video, in extension pop-up, click in the "Get streaming servers addresses" button.

<p align="center">
<img src="https://github.com/user-attachments/assets/1a91b80c-5933-4c61-9313-e80c824905a1" alt="fangen-ui" />
</p>

After that, the streaming server addresses will show up in the middle, it will show all the available servers, so you can scroll them down.

<p align="center">
<img src="https://github.com/user-attachments/assets/79b45f24-5d3c-4f3b-a50f-2d0d0895fd24" alt="fangen-ui-with-links" />
</p>

### Themes

#### Dark

<p align="center">
<img src="https://github.com/user-attachments/assets/dd43390c-aca6-44cf-b5eb-fe5f414a4d87" alt="dark-fangen-ui" />

<img src="https://github.com/user-attachments/assets/d5534416-db11-4669-993b-b833125d290c" alt="dark-fangen-ui-with-links" />
</p>

### How it works

Fangen start a service worker in the background, which listens for the browser requests, which headers are checked against a set of MIME types to verify what establishes persistent connections and storing their origins. Those origins are shown on the button click event.

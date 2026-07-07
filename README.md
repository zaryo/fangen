# Fangen

Browser extension to find backend streaming services addresses.

## Compatibility

Currently, Fangen has official tested support for the following browsers, although it might work for others, that is not guaranteed.

- Chromium
- Firefox

## Install

### From the store

Fangen is available to install from the following stores:

- [Chrome Web Store](https://chromewebstore.google.com/detail/fangen-find-streaming-add/abiadimgdoddfinmmepejfjbmnncebho)
- [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/fangen/)

### Manual installation

### packed

Fangen is also available to install as a packed extension for the following browsers:

- Chromium: Download the CRX artifact from the [latest release](https://github.com/zaryo/fangen/releases). Do not use Chromium UI to download it, as it will automatically try to install it, that is not possible, since it lacks the official signing from Chrome, hence the error message `CRX_REQUIRED_PROOF_MISSING`. Instead, download it manually:

    ```bash
      wget https://github.com/zaryo/fangen/releases/download/<version>/fangen.crx
    ```

After that, navigate to `chrome://extensions`. Enable developer mode and simply drag the CRX file into this page and drop it.

### Unpacked

First, clone the repository:

```bash
git clone https://github.com/zaryo/fangen
```

After that, go to your browser and load the unpacked extension:

- Chromium: Navigate to `chrome://extensions`. Enable developer mode and press "**Load unpacked**". Select the repository you just cloned in the previous step.

- Firefox: Navigate to `about:debugging`. Click "**This Firefox**" > "**Load Temporary Add-on...**" and select the `manifest.json` file from the repository you just cloned. 

### Usage

Go to a streaming website which you want to discover streaming server addresses.

After you play the video, in extension pop-up, click on the "Get streaming servers addresses" button.
<p align="center">
<img src="https://github.com/user-attachments/assets/2e4052d5-ecea-4c92-90be-6c1d67454107" alt="fangen-ui" />
</p>

After that, the streaming server addresses will show up in the middle, it will show all the available servers, so you can scroll them down.

<p align="center">
<img src="https://github.com/user-attachments/assets/e998e339-ceb3-4ee4-b061-c673d4b546f4" alt="fangen-ui-with-links" />
</p>

### Themes

#### Dark

<p align="center">
<img src="https://github.com/user-attachments/assets/edb0de17-cdba-4313-9021-27b279d99223" alt="dark-fangen-ui" />

<img src="https://github.com/user-attachments/assets/7339c461-a861-48ed-ac54-3d33da542ae7" alt="dark-fangen-ui-with-links" />
</p>

### Testing

Fangen has unit and integration tests. Those tests have the following dependencies:

- NodeJS
- NPM 
- Make 

You can run the tests locally by entering the repository and running the following commands:

- Unit tests:

```bash
make test.unit
```

- Chromium tests:

> [!IMPORTANT]  
> The use of `CHROMIUM_BINARY` is required.

```bash
CHROMIUM_BINARY=</path/to/your/chromium/binary> make test.chromium
```

- Firefox tests:

> [!IMPORTANT]  
> The use of `FIREFOX_BINARY` is required.

```bash
FIREFOX_BINARY=</path/to/your/firefox/binary> make test.firefox
```

- Run all the tests:

> [!IMPORTANT]  
> The use of both `CHROMIUM_BINARY` and `FIREFOX_BINARY` are required.

  ```bash
CHROMIUM_BINARY=</path/to/your/chromium/binary> FIREFOX_BINARY=</path/to/your/firefox/binary> make test
```

### Development

Fangen provides utilities you can use during development, you can use a watcher which reloads the extension on your browser automatically whenever you make a change:

- Chromium:

> [!IMPORTANT]  
> The use of `CHROMIUM_BINARY` is required.

  ```bash
CHROMIUM_BINARY=</path/to/your/chromium/binary> make watch.chromium
```

- Firefox:

> [!IMPORTANT]  
> The use of `FIREFOX_BINARY` is required.

  ```bash
FIREFOX_BINARY=</path/to/your/firefox/binary> make watch.firefox
```

### How it works

Fangen starts a service worker in the background, which listens for browser requests whose headers are checked against a set of MIME types to verify what establishes persistent connections and storing their origins. Those origins are shown on the button click event.


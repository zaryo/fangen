# Fangen

Browser extension to find backend streaming services addresses.

## Compatibility

Currently, Fangen has official tested support for the following browsers, although it might work for others, that is not guaranteed.

- Chromium
- Firefox

## Install

### Manual installation

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
Chromium
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


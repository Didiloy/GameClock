<div id="top"></div>
<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Don't forget to give the project a star!
*** Thanks again! Now go create something AMAZING! :D
-->

<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->

[![latest-release][repo-release-shield]][repo-release-url]
[![repo-size][repo-size-shield]][repo-size-url]
[![License][license-shield]][license-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
    <img src="./resources/icon.png" alt="Logo" width="200" height="200">

  <h3 align="center">GameClock</h3>

  <p align="center">
    Track your Game time with your friends !
  </p>
</div>

## About The Project

GameClock is an Electron application with <a href="https://vuejs.org/">Vue</a> and <a href="https://firebase.google.com/">Firebase</a> that allow you to track your game time with anyone that has access to your database !

![Capture home](./resources/images/gameclock_home.png)
![Capture home 2](./resources/images/gameclock_home2.png)
![Capture home 2](./resources/images/gameclock_home3.png)

<p align="right">(<a href="#top">back to top</a>)</p>

### Built With

- [Vue.js](https://vuejs.org/)
- [Firebase](https://firebase.google.com/)
- [PrimeVue](https://primevue.org/)
- [SteamGridDB](https://www.steamgriddb.com/)

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- DOWNLOAD -->

## Download

Go to the <a href="https://github.com/Didiloy/GameClock/releases">Release page</a>

<!-- GETTING STARTED -->

## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

Have `node` installed.

Create a [SteamGridDB](https://www.steamgriddb.com/api/v2) API Key – To use the SteamGridDB API, you’ll need an API key. You can get it by signing up at [SteamGridDB](https://www.steamgriddb.com).



### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/Didiloy/GameClock.git
   ```
2. Navigate to the directory named GameClock
   ```sh
   cd GameClock
   ```
3. Install NPM packages
   ```sh
   npm install
   ```
4. Configure Environment Variables

   Create a `.env` file in the root of your project and add the following :

   You can also copy the `.env.example` file.

   ```env
   VITE_STEAMGRIDDB_API_KEY=YOUR_KEY
   VITE_LINKMI_BASE_API_URL=LINKMI_API_URL
   ```

   Make sure to replace `YOUR_KEY` with the actual API key you received from [SteamGridDB](https://www.steamgriddb.com/api/v2).

5. Launch the developpement server
   ```sh
   npm run dev
   ```

<p align="right">(<a href="#top">back to top</a>)</p>

## Linkmi Integration

Gameclock now supports LINKMI API integration (#6)

To use your LINKMI API KEY go to * Settings > General > Connect your LINKMI account using your API Key* and then paste your Api Key.

Available widgets built for Gameclock : *last-session* widget and *playing-status* widget.

When you add your LINKMI API Key to your Gameclock profile you will be able to update your LINKMI widgets if you trigger the clock timer and if you add a new Gameclock game session.

<p align="right">(<a href="#top">back to top</a>)</p>

## License

Distributed under the GPLv3 License.

<p align="right">(<a href="#top">back to top</a>)</p>

## Thanks

- Léa for the support and the suggestions
- Sébastien for all the help and the ideas
- all the users for the feedbacks and the ideas

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[repo-release-shield]: https://img.shields.io/github/release/didiloy/gameclock
[repo-size-shield]: https://img.shields.io/github/repo-size/didiloy/gameclock
[repo-release-url]: https://github.com/Didiloy/GameClock/releases/latest
[repo-size-url]: https://github.com/Didiloy/gameclock/graphs/contributors
[license-shield]: https://img.shields.io/badge/Licence-GPLv3-brightgreen
[license-url]: https://www.gnu.org/licenses/gpl-3.0.html
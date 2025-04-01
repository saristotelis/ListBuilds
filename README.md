# ListBuilds ReadMe - WIP

ListBuilds is an app developed by appteam to replace some of AppCenter's core features.
App is using Bitrise API to list available builds for a specific project.
Project is available here: https://github.com/saristotelis/ListBuilds

# Features
1) Bitrise API Integration: 
Fetches build details, logs, and artifacts from Bitrise using Release Management API.
Displays build information like status, branch, commit message, and timestamps.
Also when download page is available, users can navigate to the artifacts and download apps.


2) Filtering and Sorting:
Users can filter builds by app, build status & branch.
Also can search by build number.
Sorting by date or status is implemented.

3) Dynamic URLs:
Links to build logs, public install pages, and Bitrise download pages are dynamically generated.


## How to deploy

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

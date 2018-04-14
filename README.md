# RN-Network-Test
Testing react-native-tcp server on iOS

Check the [React Native Docs](https://facebook.github.io/react-native/docs/getting-started.html) (specifically) the Building Projects with Native Code tab to get your local environment set up.  You can run it on an Android phone using `react-native run-android`, but to run it on an iOS device you'll need to open the project in Xcode and use Product->Run.

The project is all set and good to go, just clone it and run `npm install` to install all the dependancies once you have the rest of your environment good to go.

The main package that's having issues on iOS is [react-native-tcp](https://github.com/PeelTechnologies/react-native-tcp).  Its server is failing to accept connections -- more details below.

For parity with the Scribe main app [react-native-network-info](https://github.com/pusherman/react-native-network-info) is used to fetch the IPv4 address of the device, and [react-native-keep-awake](https://github.com/corbt/react-native-keep-awake) is used to wakelock the host device so it doesn't go to sleep and kill the server.

## Reproducing the Issue
You will need 2 physical devices for this on the same Wi-Fi network.

1. Install and open the app on both devices
2. Tap "Start Host" on the iOS device to start the TCP server
3. Input the server's IP address on the other device and tap "Start Client" to attempt to connect
4. You will see no activity on the server device while the client device throws errors such as "connection refused" and "unable to connect to socket"

You can verify that the code works in general by using an Android device as the server host.  If you do, a client on either iOS or Android will be able to connect to the server just fine and you can tap the "Send Packet" buttons on either one and watch the traffic go across with no problems.

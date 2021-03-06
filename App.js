/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
    Text,
    View,
    Button,
    TextInput
} from 'react-native';

import { NetworkInfo } from 'react-native-network-info';
import TCP from 'react-native-tcp';
import KeepAwake from 'react-native-keep-awake';
import UDP from 'react-native-udp';

const PORT = 55666;

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {server: null, socket: null, client: null, myIpAddress: '', serverIpAddress: '', clients: []}
    }

    componentDidMount = () => {
        NetworkInfo.getIPV4Address(ip => {
            this.setState({myIpAddress: ip});
        });
    }

    render() {
        return (
            <View>
                <Text>My IP Address: {this.state.myIpAddress}</Text>
                {(this.state.server === null && this.state.client === null) && <Button title="Start Host" onPress={this.startHost} />}
                {(this.state.server !== null && this.state.client === null) && <Button title="Stop Host" onPress={this.stopHost} />}
                {this.state.server !== null && <View style={{paddingTop: 10}}><Button title="Send data packet" onPress={this.sendServerPacket}/></View>}
                {this.state.server === null && <View>
                    <View style={{height: 50}} />
                    <Text>Enter remote IP address to connect to below</Text>
                    <TextInput returnKeyType="done" keyboardType='numeric' value={this.state.serverIpAddress} onChangeText={this.onIPEntered} onSubmitEditing={this.enterPressed}/>
                    {this.state.client === null && <Button title="Start Client" onPress={this.startClient} disabled={this.state.serverIpAddress === ''}/>}
                    {this.state.client !== null && <Button title="Stop Client" onPress={this.stopClient}/>}
                    {this.state.client !== null && <View style={{paddingTop: 10}}><Button title="Send Data Packet" onPress={this.sendClientPacket}/></View>}
                </View>}

            </View>
        );
    }

    startClient = () => {
        // let client = TCP.createConnection({host: this.state.serverIpAddress, port: PORT}, () => {
        //     client.write("Initial Client Packet");
        // });

        // client.on('data', (data) => {
        //     console.warn('Client Received data: '+data.toString('ascii'));
        // });

        // client.on('error', (data) => {
        //     console.warn('Error on client', data.toString('ascii'));
        // });

        // this.setState({client});

        let client = UDP.createSocket('udp4');
        client.bind(PORT);
        client.once('listening', () => {
            let msg = new Buffer("INIT");
            client.send(msg, 0, msg.length, PORT, this.state.serverIpAddress);
        });

        client.on('message', (message, rinfo) => {
            console.warn('Client Received data: '+message);
        });

        this.setState({client});
    }

    stopClient = () => {
        this.state.client.close();
        this.setState({client: null});
    }

    sendClientPacket = () => {
        // this.state.client.write("Packet from client");
        // let msg = toByteArray("Packet from client")
        let msg = new Buffer("Packet from client");
        this.state.client.send(msg, 0, msg.length, PORT, this.state.serverIpAddress);
    }

    onIPEntered = (val) => {
        this.setState({serverIpAddress: val});
    }

    enterPressed = (event) => {
        this.onIPEntered(event.nativeEvent.text);
    }

    startHost = () => {
        KeepAwake.activate();

        // let server = TCP.createServer((socket) => {
        //     socket.on('data', (data) => {
        //         console.warn('Server Received data: '+data.toString('ascii'));
        //     });

        //     socket.on('error', (e) => {
        //         console.warn('Error on server socket: '+e.toString('ascii'));
        //     });

        //     this.setState({socket});

        // }).listen({port: PORT}, () => {});

        let server = UDP.createSocket('udp4');
        server.bind(PORT);
        server.on('message', (message, rinfo) => {
            console.warn('Server Received data: '+message);

            if(message == "INIT") {
                let ip = rinfo.address;
                console.warn('Init received from '+ip);
                if(this.state.clients.indexOf(ip) === -1) {
                    let clients = [...this.state.clients];
                    clients.push(ip);
                    this.setState({clients});
                }

                return;
            }

        });

        this.setState({server});
    }

    stopHost = () => {
        KeepAwake.deactivate();
        this.state.server.close();
        this.setState({server: null, socket: null});
    }

    sendServerPacket = () => {
        for(let i = 0; i < this.state.clients.length; i++) {
            let msg = new Buffer("Packet from server");
            this.state.server.send(msg, 0, msg.length, PORT, this.state.clients[i]);
        }
        // this.state.socket.write("Packet from server");
    }
}

import React, { Component, Fragment } from 'react';
import { ListGroup } from 'react-bootstrap';
import { HubConnectionBuilder } from '@microsoft/signalr'

class Chat extends Component {

    constructor(props) {
        super(props);

        this.state = {
            nick: '',
            message: '',
            temperatures: [],
            alerted: [],
            hubConnection: null,
            ready: false,
        };
    }

    componentDidMount = async () => {
        const nick = window.prompt('Your name:', 'John');
        this.setState({
            nick
        })
        const hubConnection = new HubConnectionBuilder()
            .withUrl('https://eprocbackend.azurewebsites.net/api')
            .build();
        console.log(hubConnection);

        await hubConnection.start();
        this.setState({ ready: true })

        // change below to display in APP
        console.log('Connected to SignalR server')
        console.log(this.state.nick + ' connected....')

        hubConnection.on('newMessage', (alert) => {
            console.log('new alert received')
            let alerted = this.state.alerted;
            if (alerted.indexOf(alert.device_id) === -1)
                alerted.push(alert.device_id)
            this.setState({ alerted });
            let temperatures = this.state.temperatures;
            var idx = -1;
            for (var i = 0; i < temperatures.length; i++) {
                if (temperatures[i].device_id == alert.device_id) {
                    idx = i;
                }
            }
            if (idx === -1) {
                temperatures.push(alert);
            } else {
                let slask = temperatures.splice(idx, 1, alert);
                this.setState({ temperatures })
            }
        });
    }

    renderItems = () => {
        const data = this.state.temperatures;
        const mapRows = data.map((item, index) => (
            <Fragment key={item.id}>
                <ListGroup.Item>
                    <span>[ {item.device_id} ] >> {item.temperature}</span>
                </ListGroup.Item>
            </Fragment>
        ));
        return mapRows;
    };

    render() {
        return <ListGroup>{this.renderItems()}</ListGroup>;
    }
}

export default Chat;
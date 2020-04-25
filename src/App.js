import React, { Component } from 'react';
import Peer from 'peerjs';

let peer = null;
let conn = null;

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      joinText: null,
      lastPeerId: null,
    };

    this.sendMessage = this.sendMessage.bind(this);
    this.connectPatientToPeer = this.connectPatientToPeer.bind(this);
  }

  componentDidMount() {
    peer = new Peer(null, { debug: 2 });
    this.peerListeners();
  }

  componentWillUnmount() {

  }

  componentDidUpdate() {

  }

  //#region Actions
  sendMessage() {
    if (!conn) {
      return alert('Todavía no se ha establecido una conexión');
    }

    const isDoctor = this.isDoctor();
    conn.send(`Mensaje de ${isDoctor ? 'doctor' : 'paciente'}`);
  }
  //#endregion Actions

  //#region functions
  isDoctor() {
    return process.env.REACT_APP_ROL === 'doctor';
  }

  peerListeners() {
    peer.on('connection', (connListener) => {
      conn = connListener;
      this.connectionListeners();
    });

    peer.on('open', (id) => {
      console.log('My peer ID is: ' + id);
      let lastPeerId = this.state.lastPeerId;

      // Workaround for peer.reconnect deleting previous id
      if (peer.id === null) {
        console.log('Received null id from peer open');
        peer.id = lastPeerId;
      } else {
        lastPeerId = peer.id;
      }

      this.setState({ lastPeerId });
    });

    peer.on('disconnected', function () {
      console.log('Connection lost. Please reconnect');

      // Workaround for peer.reconnect deleting previous id
      // peer.id = lastPeerId; // Commented because cause an error releated with is only getter value
      peer._lastServerId = this.state.lastPeerId;
      peer.reconnect();
    });

    peer.on('error', (err) => {
      console.log('30 peer on err in doctor >>> ', err);
    });
  }

  connectionListeners() {
    const isDoctor = this.isDoctor();
    conn.on('open', () => {
      if (!isDoctor) {
        console.log('************ !!!PACIENTE CONECTADO AL DOCTOR!!!! *********** ');
        conn.send('Hello!');
      }
    });

    // Receive messages
    conn.on('data', (data) => {
      if (isDoctor) {
        console.log('84 Mensaje recibido del paciente >>>>>>>>> ');
      } else {
        console.log('84 Mensaje recibido del doctor >>>>>>>>> ');
      }

      console.log('88 data >>> ', data);
    });

    conn.on('close', () => {
      console.log('96 HERE CLOSE CONNECTION >>>>>>>>> ');
      if (isDoctor) {
        console.log('Doctor Closed ');
      } else {
        console.log('Patient Closed ');
      }
    });

    conn.on('error', (err) => {
      console.log('100 HERE ERROR >>>>>>>>> ', err);
      if (isDoctor) {
        console.log('Doctor error ');
      } else {
        console.log('Patient error ');
      }
      alert(err);
    });
  }

  connectPatientToPeer() {
    if (!this.state.joinText) {
      alert('Por favor digite el id de la conexión generado desde el lado del doctor');
      return;
    }

    conn = peer.connect(this.state.joinText, { label: 'Patient Connection', reliable: true });
    this.connectionListeners();
  }

  //#endregion functions

  //#region Render Functions
  buildPatientConnectionForm() {
    if (this.isDoctor()) {
      return null;
    }

    return (
      <div style={{ margin: '20px' }}>
        <input type="text" id="receiver-id" title="Peer ID desde el paciente" onChange={(e) => { this.setState({ joinText: e.target.value }); }} />
        <button id="connect-button" onClick={this.connectPatientToPeer}>{`Connectarse al doctor`}</button>
      </div>
    );
  }

  buildSessionIdLabel() {
    if (!this.isDoctor() || !this.state.lastPeerId) {
      return null;
    }

    return (
      <div style={{ margin: '20px' }}>
        <label>{`Copiar en el paciente:`}</label>
        <label>{`ID: ${this.state.lastPeerId}`}</label>
      </div>
    );
  }

  render() {
    return (
      <div style={{ width: '100%' }}>
        {this.buildSessionIdLabel()}
        {this.buildPatientConnectionForm()}
        <button onClick={this.sendMessage}>{`Enviar mensaje de prueba`}</button>
      </div>
    );
  }
  //#endregion Render Functions
}

export default App;

//export default App;
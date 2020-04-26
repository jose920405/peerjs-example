import React, { Component } from 'react';

// Libraries
import to from 'await-to-js';
import Peer from 'peerjs';

// Styles
import styles from './Styles';

let peer = null;
let conn = null;
let call = null;

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      joinText: null,
      lastPeerId: null,
      buildAnswerButton: null,
    };

    this.sendMessage = this.sendMessage.bind(this);
    this.hangUp = this.hangUp.bind(this);
    this.connectPatientToPeer = this.connectPatientToPeer.bind(this);
    this.startCall = this.startCall.bind(this);
    this.answerCall = this.answerCall.bind(this);
  }

  componentDidMount() {
    peer = new Peer(null, { debug: 2 });
    this.peerListeners();
  }

  componentWillUnmount() {
    if (call) {
      call.close();
    }
  }

  componentDidUpdate() {

  }

  //#region functions
  isDoctor() {
    return process.env.REACT_APP_ROL === 'doctor';
  }

  async connectMediaDevices() {
    return new Promise((resolve, reject) => {
      const constraints = {
        video: true,
        audio: true
      };

      navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        resolve(stream);
      }).catch((error) => {
        reject(`The following error occurred: ${error.message}`);
      });
    });
  }

  loadVideoStream(stream) {
    var video = document.querySelector('video');
    video.srcObject = stream;
    video.onloadedmetadata = (e) => {
      console.log('79 e >>> ', e);
      console.log('now playing the video');
      video.play();
    };
  }
  //#endregion functions

  //#region Actions
  sendMessage() {
    if (!conn) {
      return alert('Todavía no se ha establecido una conexión');
    }

    const isDoctor = this.isDoctor();
    conn.send(`Mensaje de ${isDoctor ? 'doctor' : 'paciente'}`);
  }

  hangUp() {
    peer.destroy();
  }

  connectPatientToPeer() {
    if (!this.state.joinText) {
      alert('Por favor digite el id de la conexión generado desde el lado del doctor');
      return;
    }

    conn = peer.connect(this.state.joinText, { label: 'Patient Connection', reliable: true });
    this.connectionListeners();
  }

  async startCall() {
    const [error, stream] = await to(this.connectMediaDevices());
    if (error) {
      alert(error);
      return;
    }

    if (!conn) {
      return alert('Todavía no se ha establecido una conexión');
    }

    const patientPeer = conn.peer;
    call = peer.call(patientPeer, stream);

    this.callListener();
  }

  async answerCall() {
    const [error, stream] = await to(this.connectMediaDevices());
    if (error) {
      alert(error);
      return;
    }

    call.answer(stream);

    this.callListener();
  }
  //#endregion Actions


  //#region Listeners
  peerListeners() {
    const me = this;
    peer.on('connection', (connInfo) => {
      conn = connInfo;
      me.connectionListeners();
    });

    peer.on('open', (id) => {
      console.log('My peer ID is: ' + id);
      let lastPeerId = me.state.lastPeerId;

      // Workaround for peer.reconnect deleting previous id
      if (peer.id === null) {
        console.log('Received null id from peer open');
        peer.id = lastPeerId;
      } else {
        lastPeerId = peer.id;
      }

      me.setState({ lastPeerId });
    });

    peer.on('call', function (callInfo) {
      call = callInfo;
      me.setState({ buildAnswerButton: true });
    });

    peer.on('disconnected', function () {
      console.log('Connection lost. Please reconnect');

      // Workaround for peer.reconnect deleting previous id
      // peer.id = lastPeerId; // Commented because cause an error releated with is only getter value
      peer._lastServerId = me.state.lastPeerId;
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
        conn.send('Hola doctor, me he conectado');
      }
    });

    // Receive messages
    conn.on('data', (data) => {
      if (isDoctor) {
        console.log('84 Mensaje recibido del paciente >>>>>>>>> ');
      } else {
        console.log('84 Mensaje recibido del doctor >>>>>>>>> ');
      }

      console.log(data);
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

  callListener() {
    const isDoctor = this.isDoctor();
    const me = this;

    call.on('stream', (stream) => {
      if (isDoctor) {
        console.log('210 Stream Doctor >>>>>>>>> ');
      } else {
        console.log('210 Stream Paciente >>>>>>>>> ');
      }

      console.log(stream);
      me.loadVideoStream(stream);
    });

    // Only Necessary
    call.on('close', () => {
      if (isDoctor) {
        console.log('210 CALL CLOSED Doctor >>>>>>>>> ');
      } else {
        console.log('210 CALL CLOSED Paciente >>>>>>>>> ');
      }
    });

    call.on('error', (err) => {
      if (isDoctor) {
        console.log('210 CALL ERROR Doctor >>>>>>>>> ');
      } else {
        console.log('210 CALL ERROR Paciente >>>>>>>>> ');
      }

      console.log(err);
    });
  }
  //#endregion Listeners

  //#region Render Functions
  buildPatientConnectionForm() {
    if (this.isDoctor()) {
      return null;
    }

    return (
      <div style={{ margin: '20px' }}>
        <input
          type="text"
          style={styles.joinText}
          title="Peer ID desde el paciente"
          onChange={(e) => { this.setState({ joinText: e.target.value }); }}
        />
        <button id="connect-button" onClick={this.connectPatientToPeer}>{`Connectarse al doctor`}</button>
      </div>
    );
  }

  buildSessionIdLabel() {
    if (!this.isDoctor() || !this.state.lastPeerId) {
      return null;
    }

    return (
      <div style={styles.buttons}>
        <label>{`Copiar en el paciente:`}</label>
        <label>{`ID: ${this.state.lastPeerId}`}</label>
      </div>
    );
  }

  buildCallButton() {
    if (!this.isDoctor()) {
      return null;
    }

    return (
      <button style={styles.buttons} onClick={this.startCall}>{`Llamar a paciente`}</button>
    );
  }

  buildAnswerButton() {
    if (!this.state.buildAnswerButton || this.isDoctor()) {
      return null;
    }

    return (
      <button style={styles.buttons} onClick={this.answerCall}>{`Contestar llamada del médico`}</button>
    );
  }

  render() {
    return (
      <div style={styles.parentContainer}>
        {this.buildSessionIdLabel()}
        {this.buildPatientConnectionForm()}
        <button style={styles.buttons} onClick={this.sendMessage}>{`Enviar mensaje de prueba`}</button>
        <button style={styles.buttons} onClick={this.hangUp}>{`Colgar`}</button>
        {this.buildCallButton()}
        {this.buildAnswerButton()}
        <video controls></video>
      </div>
    );
  }
  //#endregion Render Functions
}

export default App;

//export default App;
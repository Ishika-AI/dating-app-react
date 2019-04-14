import React, { Component } from 'react';
// import logo from './logo.svg'; 
import './App.css';
import AuthService from './components/AuthService';
import withAuth from './components/withAuth';
import FileUpload from './components/FileUpload';
import socketIOClient from "socket.io-client";
import $ from 'jquery';
const Auth = new AuthService();

class App extends Component {

  constructor(props){
    super(props);
    this.state = {
      endpoint: "http://localhost:4001",
      data: [] ,
      feeddata:[],
      uid : this.props.user.id,
      like: null,
      superlike:null,
      sendlike:this.sendlike(this),
      sendsuperlike:this.sendsuperlike(this)
    };


  } 
  sendlike (evt) {
    if(evt.target!==undefined){
    const id  = evt.target.dataset.id;
    const uid  = evt.target.dataset.uid;
    var payload = {by:this.state.uid,img:id,uid:uid};
    const socket = socketIOClient(this.state.endpoint);
    socket.emit('like',payload) 
    }
  }
  setlike = (id) => {
    this.setState({ like : id })
  }
  sendsuperlike (evt) {
    if(evt.target!==undefined){
      const id  = evt.target.dataset.id;
      const uid  = evt.target.dataset.uid;
      var payload = {by:this.state.uid,img:id,uid:uid};
      const socket = socketIOClient(this.state.endpoint);
      socket.emit('superlike', payload); 
      }
  }
  setsuperlike = (id) => {
    this.setState({superlike : id })
  }
  componentDidMount = async () => {

    const socket = socketIOClient(this.state.endpoint);
    socket.on('likeby', (data) => {
      if(data.uid==this.state.uid)
      $('#4b').prepend('<p>some one liked your post <img style="width:25px;" src="./uploads/'+data.imgname+'"/></p>');
    });
    socket.on('superlikeby', (data) => {
    // document.body.insertBefore(e, document.body.childNodes[0]);
    if(data.uid==this.state.uid)
    $('#4b').prepend('<p>'+data.byname+ ' gave you a superlike <img style="width:25px;" src="./uploads/'+data.imgname+'"/></p>');
    //  document.getElementById('4b').insertBefore('<p>'+data+'</p>', document.getElementById('4b').childNodes[0])
    });
    try {
      this.fetchuserprofile();
      this.fetchfeeds();
    } catch (error) {
     alert(error)
    }
  };
  
  handleLogout(){
    Auth.logout()
    this.props.history.replace('/login');
  }
  fetchuserprofile () {
        
        const payload = {'user':this.state.uid};
        const data = JSON.stringify(payload)
        fetch('http://localhost:4000/listuserimages', {
        method: 'POST',
        mode: 'cors',
        body: data,
        headers: {
            'Content-Type': 'application/json'
        }
        })
        .then(response => response.json())
        .then(data => this.setState({ data:data }));
        // .then(res =>{
        //     this.setState({
        //       result: res
        //     });
        // })       ;
        // .then(res => { const listItems = this.state.result.map((d) =><li>{d.imagename}</li> );}) ;
  }
  fetchfeeds () {
        
    const payload = {'user':this.state.uid};
    const data = JSON.stringify(payload)
    fetch('http://localhost:4000/showfeeds', {
    method: 'POST',
    mode: 'cors',
    body: data,
    headers: {
        'Content-Type': 'application/json'
    }
    })
    .then(response => response.json())
    .then(data => this.setState({ feeddata:data }));
   
}
  render() {
    const { data,feeddata } = this.state;
    return (
      <div className="App ">
        <div className="App-header">
          {/* <img src={logo} className="App-logo" alt="logo" /> */}
          <h2>Welcome {this.props.user.username}</h2>
          {/* <h2>Welcome {this.props.user.id}</h2> */}
        </div>
        <p className="App-intro">
          <button type="button" className="form-submit" onClick={this.handleLogout.bind(this)}>Logout</button>
        </p>
        
        <h1>tags - dating,socket.io, react, expressjs, jwt, rethinkdb</h1>
        <div id="exTab3" class="container">	
        <ul  class="nav nav-pills">
              <li >
                <a  href="#1b" data-toggle="tab">upload image</a>
              </li>
              <li><a href="#2b" data-toggle="tab">feeds</a>
              </li>
              <li class="active"><a href="#3b" data-toggle="tab">your images</a>
              </li>
              <li ><a href="#4b" data-toggle="tab">notifications</a>
              </li>
            </ul>
            <br/><br/>
              <div class="tab-content clearfix">
                <div class="tab-pane" id="1b">
                <FileUpload/>

                </div>
                <div class="tab-pane " id="2b">
                  <h3>feeds</h3>
                  {feeddata.map(hit =>
                      <div class="container">
                        <div class="row">
                          <div class="col-md-6">
                          <img style={{ width: '30%' }} src={`./uploads/${hit.imagename}`} alt='' />
                          </div>
                          <div class="col-md-6">
                          {/* {hit.imagename} */}
                          <button data-id={hit.id} data-uid={hit.userid} onClick={this.sendlike.bind(this)}>like</button>
                          <button data-id={hit.id} data-uid={hit.userid} onClick={this.sendsuperlike.bind(this)}>superlike</button>
                          </div>
                          <hr/>
                        </div>
                       </div> 
                    )}
                  
                </div>
                <div class="tab-pane active" id="3b">
                <ul>
                    {data.map(hit =>
                      <div class="container">
                        <div class="row">
                          <div class="col-md-6">
                          <img style={{ width: '30%' }} src={`./uploads/${hit.imagename}`} alt='' />
                          </div>
                          <div class="col-md-6">
                          {/* {hit.imagename} */}
                          {/* <button>like</button>
                          <button>superlike</button>
                          <button>block</button> */}
                          </div>
                          <hr/>
                        </div>
                       </div> 
                    )}
                  </ul>
                </div>
                <div class="tab-pane " id="4b">
                <p></p>
                </div>
              </div>
          </div>
      </div>
    );
  }
}

export default withAuth(App);

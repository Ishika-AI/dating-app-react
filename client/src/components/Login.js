import React, { Component } from 'react';
import './Login.css';
import AuthService from './AuthService';
class Login extends Component {
    constructor(){
        super();
        this.handleChange = this.handleChange.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.taketosignup = this.taketosignup.bind(this);
        this.Auth = new AuthService();

    }
    componentWillMount(){
        if(this.Auth.loggedIn())
            this.props.history.replace('/');
            
    }
    taketosignup(){
        this.props.history.replace('register');

        // this.props.history.push('register');
    }
    render() {
        return (
            <div className="center">
                <div className="card">
                    <h1>Login</h1>
                    <form onSubmit={this.handleFormSubmit}>
                        <input
                            className="form-item"
                            placeholder="Username goes here..."
                            name="username"
                            type="text"
                            onChange={this.handleChange}
                        />
                        <input
                            className="form-item"
                            placeholder="Password goes here..."
                            name="password"
                            type="password"
                            onChange={this.handleChange}
                        />
                        <input
                            className="form-submit"
                            value="SUBMIT"
                            type="submit"
                        />
                    </form>
                    <p onClick={this.taketosignup}>signup</p>
                </div>
            </div>
        );
    }

    handleFormSubmit(e){
        e.preventDefault();
      if(this.state.username.length>0 && this.state.password){
        this.Auth.login(this.state.username,this.state.password)
            .then(res =>{
               this.props.history.replace('/');
            })
            .catch(err =>{
                alert(err);
            })
        }else{
            alert('fill in something');
        }
    }

    handleChange(e){
        this.setState(
            {
                [e.target.name]: e.target.value
            }
        )
    }
}

export default Login;
import React, { Component } from 'react';
import './Register.css';
import AuthService from './AuthService';

class Register extends Component {
    constructor(){
        super();
        this.handleChange = this.handleChange.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.taketologin = this.taketologin.bind(this);

        this.Auth = new AuthService();
    }
    componentWillMount(){
        if(this.Auth.loggedIn())
            this.props.history.replace('/');
    }
    taketologin(){
        this.props.history.replace('login');
    }
    render() {
        return (
            <div className="center1">
                <div className="card">
                    <h1>Signup</h1>
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
                    <p onClick={this.taketologin}>login</p>
                </div>
            </div>
        );
    }

    handleFormSubmit(e){
        e.preventDefault();
        if(this.state.username.length>0 && this.state.password){
        this.Auth.register(this.state.username,this.state.password)
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

export default Register;
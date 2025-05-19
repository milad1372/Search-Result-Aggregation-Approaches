import React, {useState, useEffect} from "react";

import  '../css/login.css';
import {useMutation} from "@apollo/react-hooks";
import {LOGIN_USER} from "../utils/mutations";
import Auth from "../utils/auth";

const LoginForm = () => {
    const [userFormData, setUserFormData] = useState({email: "", password: ""});
    const [validated] = useState(false);
    const [showAlert, setShowAlert] = useState(false);

    // declaring loginUser with useMutation
    const [loginUser, {error}] = useMutation(LOGIN_USER);

    useEffect(() => {
        if (error) setShowAlert(true);
        else setShowAlert(false);
    }, [error])


    const handleInputChange = (event) => {
        const {name, value} = event.target;
        setUserFormData({...userFormData, [name]: value});
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();

        // check if form has everything (as per react-bootstrap docs)
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        }
        if (window.LogUI && window.LogUI.isActive()) {
            window.LogUI.updateApplicationSpecificData({
                userID: userFormData.email,
                interface:"serp-focused-interface"
            });
        }
        localStorage.setItem('loggedInUser',userFormData.email);
        window.location.href = '/';
        // use loginUser function
        // try {
        //     const {data} = await loginUser({
        //         variables: {...userFormData},
        //     });
        //
        //     Auth.login(data.login.token);
        // } catch (e) {
        //     console.error(e);
        // }

        setUserFormData({
            username: "",
            email: "",
            password: "",
        });
    };

    return (


        <div className="kccontainer">
            <div className="kcinner container-fluid">
                <div className="row justify-content-center">
                    <div className="kcbox">
                        {/* <header className="login-header">
                            <a href="/" id="referrer" aria-label="Europeana Home">
                                <img src="./europeana.svg" alt="Europeana logo"/>
                            </a>
                        </header> */}
                        <main>
                            <ul id="nav" className="nav justify-content-center">
                            </ul>
                            <div className="divider"></div>
                            <div className="kcform">
                                <h1 id="kc-page-title">
                                    Log in
                                </h1>
                                <form  onSubmit={handleFormSubmit}>
                                    <div className="form-group">
                                        <div className="col-12">
                                            <label htmlFor="email">Email or username</label>
                                        </div>
                                        <div className="col-12">
                                            <input id="email" className="form-control" name="email" value={userFormData.email}
                                                   type="text" autoFocus autoComplete="off" required=""  onChange={handleInputChange}/>
                                        </div>
                                    </div>


                                    <div className="form-group">
                                        <div className="col-12">
                                            <div className="form-buttons">
                                                <div className="flex-grow-1">
                                                </div>
                                                <div className="flex">
                                                    <input className="btn btn-primary" name="login" disabled={!(userFormData.email)}
                                                           type="submit"
                                                           value="Log in"/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>

                        </main>
                    </div>
                </div>
            </div>
        </div>


    );
};

export default LoginForm;

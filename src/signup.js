import React, { useState } from 'react'
import withFirebaseAuth from 'react-with-firebase-auth'
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import firebaseAppAuth from './firebaseConfig';
import { OverlayTrigger, Popover, Form, Button, Card, InputGroup, Modal, Spinner } from 'react-bootstrap'
import { AiFillEye, AiFillEyeInvisible, AiFillTwitterCircle } from 'react-icons/ai'
import { FcGoogle } from 'react-icons/fc'
import { RiFacebookCircleFill } from 'react-icons/ri'
import { FaCookieBite } from 'react-icons/fa'
import './signup.css'
import Home from './home.js'
import Profile from './profile.js'


export const register = async({email, password})=>{
    await firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((e) => {e.user.sendEmailVerification();
        firebaseAppAuth.signOut()});}
export const login = async({email, password})=>{
    await firebase.auth().signInWithEmailAndPassword(email, password);}
export const reset = async({email})=>{
    await firebase.auth().sendPasswordResetEmail(email);}

const Signup = (props) => {
    const [form, setForm] = useState({email:'', password:''})
    const [usern, setUsern] = useState(3)
    const [check, setCheck] = useState(0)
    const [resetpassmodal, setResetpassmodal] = useState(0)
    const [incorrectpass, setIncorrectpass] = useState(false)
    const [alert, setAlert] = useState(false)
    const [dark, setDark] = useState(localStorage.getItem('doc') === null ? 0 : Number(localStorage.getItem('doc')))
    const [eye, setEye] = useState('password')
    const [invalidresetmail, setInvalidresetmail] = useState(false)
    const [profileornot, setProfileornot] = useState('')
    const [halt, setHalt] = useState('')
    window.onpopstate = function(event) {if(event){
        setResetpassmodal(false)
        if(alert){setAlert(false); setUsern(4)}
    }}
    if(dark === 1){document.body.style.backgroundColor = "#171717"}
    if(window.location.href === 'https://bingers-play.web.app/' || window.location.href === 'https://bingers-play.web.app/#hithere'){
        const handleSubmitlog = async(e)=>{
            e.preventDefault();
            await login(form)
            .then((e) => {
                if(!firebase.auth().currentUser.emailVerified){
                    firebase.auth().currentUser.sendEmailVerification();
                    firebaseAppAuth.signOut()
                    window.location.assign('#hithere')
                    setAlert(true) //toast.info('Verification mail sent')
                }else{setForm({...form, email: ''})}
            })
            .catch((error) => {
                register(form)
                .then(() => {window.location.assign('#hithere'); setAlert(true)}) //toast.info('Verification mail sent')
                .catch((error) => {setIncorrectpass(true)}) //toast.error('Incorrect password!')
            })}
        const resetpass = async(e) => {
            e.preventDefault();
            let thappu = await firebase.auth().fetchSignInMethodsForEmail(form.email)
            .then(providers => {return providers});
            if(thappu.length === 0){setInvalidresetmail(1)}
            else if(thappu[0] === 'password'){await reset(form).then(() => {setInvalidresetmail(2)}).catch(() => {console.log("Reset mail can't be sent - may be network or server error")})}
            else{setInvalidresetmail(3)}
        }
        const setusername = async(e) => {
            e.preventDefault();
            let name = form.email
            setForm({...form, email: 'submitted'})
            await firebase.firestore().collection('users').doc(user.uid).set({username: name, movies: [], series: []})
            un()
        }
        const un = async () => {
            if (user){
            setUsern(await firebase.firestore().collection('users').doc(user.uid).get()
            .then((e)=>{return e.data().username}).catch(()=>{}))
        }}
        const ucheck = (e) => {
            firebase.firestore().collection('users')
            .onSnapshot((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    if(doc.data().username === e){setCheck(1)}
                })
            })
        }
        
    const { user, signInWithGoogle, signInWithFacebook, signInWithTwitter } = props;
    if(usern === 3){ un() }else if(usern === 4){ window.location.reload() }
    if (user){
        if ((usern !== '' && usern !== undefined && usern !== 3)){  // || (user.providerData[0].providerId !== 'password' )
            return(
                <div>
                    <Home />
                </div>
            )
        } else if (usern === 3){return(<div style={{textAlign: 'center', marginTop: '250px'}}><Spinner animation='grow' variant='success' /></div>)
        } else {
            var error = 0
            return(
                <div className='fullscreen'>
                {form.email !== 'submitted' ?
                <Card className='card' style={{maxWidth: '500px', borderRadius: '50px', borderColor: 'transparent', backgroundColor: (dark === 0 ? '' : '#171717')}}>
                    <Card.Body>
                        <h1 style={{cursor: 'default', color: (dark === 0 ? 'green' : 'limegreen'), textAlign: 'center', marginTop: '20px'}}>Bingers Play</h1>
                        <h1 style={{cursor: 'default', color: (dark === 0 ? 'black' : '#EDEDED')}} className='text-center mb-4 mt-4'>Be Unique</h1>
                    <Form onSubmit={setusername}>
                        <Form.Group style={{marginBottom: '20px'}}>
                            <Form.Control id={dark === 0 ? '' : 'placeholderun'} style={{backgroundColor: (dark === 0 ? '' : '#171717'), color: (dark === 0 ? '' : '#EDEDED')}} placeholder='Username' type='text' value={form.email} onChange={(e) => {setForm({...form, email: e.target.value}); ucheck(e.target.value); setCheck(0); un()}} required />
                            {(((form.email).match(/^[0-9a-z\-.]+$/) === null) && form.email !== '') && (error = 1, <p style={{color: (dark === 0 ? 'red' : 'tomato')}}>Usernames can only use small letters, numbers, hyphen and periods.</p>)}
                            {(form.email).length > 20 && (error = 1, <p style={{color: (dark === 0 ? 'red' : 'tomato')}}>Please be within 20 characters.</p>)}
                            {check === 1 && (<p style={{color: (dark === 0 ? 'red' : 'tomato')}}>Username already taken.</p>)}
                        </Form.Group>
                        <Button variant="success" className='w-100 mb-4' type='submit' disabled={(error||check) === 1 || form.email === ''}>Join</Button>
                    </Form> 
                </Card.Body></Card>: <div style={{textAlign: 'center', marginTop: '250px'}}><Spinner animation='grow' variant='success' /></div>}
                </div>
            )
        }
    } else if(user === undefined) {
        return(<div style={{textAlign: 'center', marginTop: '250px'}}><Spinner animation='grow' variant='success' /></div>)
    } else {
        return (
            <div className='fullscreen'>
                <Card className='card' style={{maxWidth: '500px', borderRadius: '50px', borderColor: 'transparent', backgroundColor: (dark === 0 ? '' : 'transparent')}}>
                    <Card.Body>
                        <h1 style={{cursor: 'default', color: (dark === 0 ? 'green' : 'limegreen'), textAlign: 'center', marginTop: '20px'}}>Bingers Play</h1>
                        <h1 style={{cursor: 'default', color: (dark === 0 ? 'black' : '#EDEDED')}} className='text-center mb-4 mt-4'>Account Verification</h1>
                        <Form onSubmit={handleSubmitlog}>
                            <Form.Group>
                                <Form.Control id={dark === 0 ? '' : 'placeholderun'} style={{color: (dark === 0 ? '' : '#EDEDED'), backgroundColor: (dark === 0 ? '' : '#171717')}} placeholder='Email address' type='email' onChange={(e) => {setForm({...form, email: e.target.value}); setIncorrectpass(false)}} required />
                            </Form.Group>
                            <Form.Group className='mb-4 mt-4'>
                                <InputGroup className="mb-3">
                                    <Form.Control id={dark === 0 ? '' : 'placeholderun'} aria-describedby="basic-addon2" style={{borderRightColor: 'white', width: '50%', display: 'inline', color: (dark === 0 ? '' : '#EDEDED'), backgroundColor: (dark === 0 ? '' : '#171717')}} placeholder='Password' type={eye} onChange={(e) => {setForm({...form, password: e.target.value}); setIncorrectpass(false)}} required />
                                    <Button variant='none' onClick={() => {if(eye === 'password'){setEye('text')}else{setEye('password')}}} style={{borderColor: 'lightgray', borderLeftColor: 'white'}}>{eye === 'password' ? <AiFillEye style={{color: (dark === 0 ? 'gray' : '#EDEDED')}}/> : <AiFillEyeInvisible style={{color: (dark === 0 ? 'gray' : '#EDEDED')}}/> }</Button>
                                </InputGroup>
                                {incorrectpass && <p style={{color: (dark === 0 ? 'red' : 'tomato')}}>Incorrect password</p>}
                                {(form.password!==''&&(form.password).length<6) && (<p style={{color: (dark === 0 ? 'red' : 'tomato')}}>Password atleast contain 6 characters.</p>)}
                            </Form.Group>
                            <Button className='w-100' type='submit' variant='success' disabled={((form.email&&form.password) === '') || (form.password).length<6}>Verify</Button>
                        </Form>
                        <Button variant='outlined' style={{color: 'gray', paddingLeft: '0%'}} onClick={() => {window.location.assign('#hithere'); setResetpassmodal(true)}}>Forgot password?</Button>
                        <Modal show={resetpassmodal} onHide={() => {setResetpassmodal(false); setInvalidresetmail(0); window.history.go(-1)}}>
                            <Modal.Header style={{backgroundColor: (dark === 0 ? '' : '#2c2c30')}}><Modal.Title style={{color: (dark === 0 ? 'green' : 'limegreen')}}>Bingers Play</Modal.Title></Modal.Header>
                            {invalidresetmail === 3 ? <h4 style={{backgroundColor: (dark === 0 ? '' : '#2c2c30'), width: '90%', marginLeft: '5%', color: 'orange', textAlign: 'center', marginTop: '15px', marginBottom: '15px'}}>We can't change password for third party authenticated mail. If you want to do so, then change password from your origin provider.</h4> : <>
                            {invalidresetmail === 2 ? <h1 style={{backgroundColor: (dark === 0 ? '' : '#2c2c30'), color: (dark === 0 ? 'green' : 'limegreen'), textAlign: 'center', marginTop: '15px', marginBottom: '15px'}}>Reset mail sent</h1> : <>
                            <Modal.Body style={{backgroundColor: (dark === 0 ? '' : '#2c2c30')}}>
                            <Form onSubmit={resetpass}>
                                <Form.Group>
                                    <Form.Control id={dark === 0 ? '' : 'placeholderun'} style={{color: (dark === 0 ? '' : '#EDEDED'), backgroundColor: (dark === 0 ? '' : '#2c2c30')}} placeholder='Email address' type='email' onChange={(e) => setForm({...form, email: e.target.value})} required />
                                </Form.Group>
                                {invalidresetmail === 1 && <p style={{color: (dark === 0 ? 'red' : 'tomato')}}>Invalid reset mail</p>}
                                <Button className='w-100 mt-4' type='submit' variant='success' disabled={(form.email) === ''}>Send reset mail</Button>
                                </Form>
                            </Modal.Body></>}</>}
                        </Modal>
                        <Modal show={alert} onHide={() => {setAlert(false); setUsern(4); window.history.go(-1)}}>
                        <Modal.Header><Modal.Title style={{backgroundColor: (dark === 0 ? '' : '#2c2c30'), color: (dark === 0 ? 'green' : 'limegreen')}}>Bingers Play</Modal.Title></Modal.Header>
                            <Modal.Body><h1 style={{color: (dark === 0 ? 'green' : 'limegreen'), backgroundColor: (dark === 0 ? '' : '#2c2c30'), textAlign: 'center', marginTop: '15px', marginBottom: '15px'}}>Verification mail sent</h1></Modal.Body>
                        </Modal>
                        <hr style={{color: (dark === 0 ? 'gray' : '#EDEDED'), marginTop: '20px', width: '50%', marginLeft: '25%'}} />
                        <div style={{marginTop: '25px', marginBottom: '25px', display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly'}}>
                        <FcGoogle style={{cursor: 'pointer', width: '60', height: '60'}} onClick={signInWithGoogle}/>
                        <RiFacebookCircleFill style={{cursor: 'pointer', width: '60', height: '60', color:'#4267B2'}} onClick={signInWithFacebook} />
                        <AiFillTwitterCircle style={{cursor: 'pointer', width: '60', height: '60', color: '#1DA1F2'}} onClick={signInWithTwitter}/>
                        </div>
                    </Card.Body>
                </Card>
                <OverlayTrigger trigger="click" placement='right'
                overlay={
                    <Popover style={{border: 'none', fontSize: '12px'}}>
                    <Popover.Content style={{cursor: 'default', paddingBottom: '5px', paddingTop: '5px', color: (dark === 0 ? '' : '#EDEDED'), backgroundColor: (dark === 0 ? '' : '#171717')}}>
                        We use cookies for your better experience. <a style={{color: (dark === 0 ? 'green' : 'limegreen')}} href='https://www.freeprivacypolicy.com/live/82494e72-5518-47af-9fcf-42d485163057'>Learn more</a> about our privacy policy.
                    </Popover.Content>
                    </Popover>
                }
                >
                <FaCookieBite style={{cursor: 'pointer', color: (dark === 0 ? 'brown' : 'sandybrown'), marginLeft: '10px', position:'absolute', bottom: '10px'}}/>
                </OverlayTrigger>
            </div>
        )
    }} else {
        const total = async () => {
            firebase.firestore().collection('users')
                .onSnapshot((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        if(doc.data().username === (window.location.href).replace('https://bingers-play.web.app/#', '')){setProfileornot(doc.data())}
                        setHalt(true)
                })
            })
        }
        if(profileornot === ''){total()}
        return(
            <>
            {halt === '' && <div style={{textAlign: 'center', marginTop: '250px'}}><Spinner animation='grow' variant='success' /></div>}
            {(profileornot !== '' && halt === true) && <Profile profiledata={profileornot}/>}
            {(profileornot === '' && halt === true) && <><h1 style={{cursor: 'default', color: (dark === 0 ? 'green' : 'limegreen'), textAlign: 'center', marginTop: '50px'}}>Bingers Play</h1><h1 style={{cursor: 'default', color: 'tomato', textAlign: 'center', marginTop: '35px'}}>Profile doesn't exist!</h1></>}  
            </>
        )
    }
}
const providers = {googleProvider: new firebase.auth.GoogleAuthProvider(),
    facebookProvider: new firebase.auth.FacebookAuthProvider(),
    twitterProvider: new firebase.auth.TwitterAuthProvider()}
export default withFirebaseAuth({providers, firebaseAppAuth})(Signup)

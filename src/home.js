import React, { useState } from 'react'
import withFirebaseAuth from 'react-with-firebase-auth'
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import firebaseAppAuth from './firebaseConfig';
import { Form, Button, Card, ListGroup, InputGroup, Modal, Dropdown, OverlayTrigger, Popover, Spinner, ButtonGroup } from 'react-bootstrap'
import { AiOutlinePlus } from 'react-icons/ai'
import { MdModeEdit } from 'react-icons/md'
import { BiArrowBack, BiUpArrowCircle } from 'react-icons/bi'
import './home.css'
import { useSwipeable } from 'react-swipeable';
import {WhatsappShareButton, FacebookShareButton, TwitterShareButton, LivejournalIcon, WhatsappIcon, FacebookIcon, TwitterIcon} from "react-share";

const Home = () => {
    const [word, setWord] = useState('')
    const [results, setResults] = useState([])
    const [rating, setRating] = useState(0)
    const [genre, setGenre] = useState(['one', 'one'])
    const [alreadythere, setAlreadythere] = useState([])
    const [disable_popup, setDisable_popup] = useState(false)
    const [whichbutton, setWhichbutton] = useState('')
    const [searchbar, setSearchbar] = useState()
    const [moviesshowresult, setMoviesshowresult] = useState(3)
    const [seriesshowresult, setSeriesshowresult] = useState(3)
    const [seriesormovies, setSeriesormovies] = useState(localStorage.getItem('mos') === null ? 0 : Number(localStorage.getItem('mos')))
    const [dark, setDark] = useState(localStorage.getItem('doc') === null ? 0 : Number(localStorage.getItem('doc')))  
    const [changeun, setChangeun] = useState(false)
    const [request, setRequest] = useState(0)
    const [bttview, setBttview] = useState(false)
    const [tempgenre, setTempgenre] = useState('')
    const [cardmodal, setCardmodal] = useState(false)
    const [cardclicked, setCardclicked] = useState([])
    const [deletesure, setDeletesure] = useState(0)
    const [outsure, setOutsure] = useState(0)
    const [checkcu, setCheckcu] = useState(0)
    const [usernameval, setUsernameval] = useState('')
    const [viewby, setViewby] = useState(false)
    const [smoothdelay, setSmootdelay] = useState(false)
    const [usermodal, setUsermodal] = useState(false)
    const [showmoreresults, setShowmoreresults] = useState(10)
    const [media, setMedia] = useState(false)
    const [genremode, setGenremode] = useState(false)
    const [sortgenre, setSortgenre] = useState(false)
    const [userid, setUserid] = useState('Not Available')
    window.onpopstate = function(event) {if(event){
        setDisable_popup(false)
        setCardmodal(false)
        setSortgenre(false)
        if(changeun){window.location.assign('#hithere'); setChangeun(false); setUsermodal(true)}else{setUsermodal(false)}
    }}
    var user = firebase.auth().currentUser
    if(genre.length > 2){genre.shift()}
    localStorage.setItem('mos', seriesormovies)
    localStorage.setItem('doc', dark)
    const onChange = (e) => {
        let onlyms = []
        e.preventDefault()
        setWord(e.target.value)
        fetch(`https://api.themoviedb.org/3/search/multi?api_key=${process.env.REACT_APP_TMDB_API_KEY}&language=en-US&query=${e.target.value}&page=1&include_adult=false`)
        .then((res) => {return res.clone().json()})
        .then((data) => {
            if(!data.errors){
                for(let result of data.results){
                    if(result.media_type !== 'person'){
                        onlyms.push(result)
                    }
                }
                setResults(onlyms)
            } // ; console.log(data)
            else {setResults([])}
        })
        setShowmoreresults(10)
        Alreadythere()
    }
    const Homeshow = async (filter) => {
        var moviesshows = await firebase.firestore().collection('users').doc(user.uid).get()
        .then((e)=>{return e.data().movies}).catch(() => Homeshow(0))
        var seriesshows = await firebase.firestore().collection('users').doc(user.uid).get()
        .then((e)=>{return e.data().series})
        setUserid(await firebase.firestore().collection('users').doc(user.uid).get()
        .then((e)=>{return e.data().username}))
        var revealed = []
            for (var moviesshow of moviesshows){
                var splitted = (moviesshow).split('::')
                const res = await fetch(`https://api.themoviedb.org/3/movie/${splitted[0]}?api_key=${process.env.REACT_APP_TMDB_API_KEY}&language=en-US`)
                const data = await res.clone().json()
                if(!data.errors){revealed.push(data.poster_path+'::'+data.title+'::'+(data.release_date === '' ? 'No date!' : (data.release_date).slice(0, 4) )+'::'+splitted[1]+'::'+splitted[2]+'::'+splitted[3]+'::'+splitted[0])} //Adding splitted[0] (id) coz it needed when we update movie/series stuffs.
            }
        if(filter === '0'){setMoviesshowresult(revealed.reverse())}
        else{setMoviesshowresult(revealed)}

        revealed = []
            for (var seriesshow of seriesshows){ 
                splitted = (seriesshow).split('::')
                const res = await fetch(`https://api.themoviedb.org/3/tv/${splitted[0]}?api_key=${process.env.REACT_APP_TMDB_API_KEY}&language=en-US`)
                const data = await res.clone().json()
                if(!data.errors){revealed.push(data.poster_path+'::'+data.name+'::'+(data.first_air_date === ('' || null) ? 'No date!' : (data.first_air_date).slice(0, 4) )+'::'+splitted[1]+'::'+splitted[2]+'::'+splitted[3]+'::'+splitted[0])}
                }
        if(filter === '0'){setSeriesshowresult(revealed.reverse())}
        else{setSeriesshowresult(revealed)}
    }
    const oneenough = (e) => {
        if(genre.indexOf(e) !== 1){genre[0] = 'one'}
        else if(genre[0] === 'one'){}
        else{genre[1] = genre[0] }
        setGenre([...genre])
    }
    const Added = async (e) => {
        if(e.media_type === 'movie'){
        await firebase.firestore().collection('users').doc(user.uid).update({movies: firebase.firestore.FieldValue.arrayUnion(e.id+'::'+rating+'::'+genre.join('::'))})
        Alreadythere()
        Homeshow('0')}
        else{await firebase.firestore().collection('users').doc(user.uid).update({series: firebase.firestore.FieldValue.arrayUnion(e.id+'::'+rating+'::'+genre.join('::'))})
        Alreadythere()
        Homeshow('0')}
        window.history.go(-1)
    }
    const Updated = async () => {
        if(seriesormovies === 0){
        await firebase.firestore().collection('users').doc(user.uid).update({movies: firebase.firestore.FieldValue.arrayRemove(cardclicked[6]+'::'+cardclicked[3]+'::'+cardclicked[4]+'::'+cardclicked[5])})
        await firebase.firestore().collection('users').doc(user.uid).update({movies: firebase.firestore.FieldValue.arrayUnion(cardclicked[6]+'::'+rating+'::'+genre.join('::'))})
        Homeshow('0')}
        else{
            await firebase.firestore().collection('users').doc(user.uid).update({series: firebase.firestore.FieldValue.arrayRemove(cardclicked[6]+'::'+cardclicked[3]+'::'+cardclicked[4]+'::'+cardclicked[5])})
            await firebase.firestore().collection('users').doc(user.uid).update({series: firebase.firestore.FieldValue.arrayUnion(cardclicked[6]+'::'+rating+'::'+genre.join('::'))})
            Homeshow('0')}
        window.history.go(-1)
    }
    const Deleted = async () => {
        setDeletesure(0)
        setCardmodal(false)
        if(seriesormovies === 0){
            await firebase.firestore().collection('users').doc(user.uid).update({movies: firebase.firestore.FieldValue.arrayRemove(cardclicked[6]+'::'+cardclicked[3]+'::'+cardclicked[4]+'::'+cardclicked[5])})
            Homeshow('0')}
        else{
            await firebase.firestore().collection('users').doc(user.uid).update({series: firebase.firestore.FieldValue.arrayRemove(cardclicked[6]+'::'+cardclicked[3]+'::'+cardclicked[4]+'::'+cardclicked[5])})
            Homeshow('0')}     
        window.history.go(-1)   
    }
    const Alreadythere = async () => {
        var at = []
        var k = await firebase.firestore().collection('users').doc(user.uid).get()
        .then((e)=>{return e.data().movies})
        var l = await firebase.firestore().collection('users').doc(user.uid).get()
        .then((e)=>{return e.data().series})
        var m = k.concat(l)
        for (var j = 0; j < m.length; j++){
            at.push(((m[j]).split('::'))[0])
        }
        setAlreadythere(at)
    }
    const AtoZ = async (filter) => {
        let names = []
        let sortednames = []
        let s_names = []
        for(let az of moviesshowresult){
            let splitname = az.split('::')
            names.push(splitname[1])
        }
        names.sort()
        for(let azz of names){
            for(let azzz of moviesshowresult){
                let splitname = azzz.split('::')
                if(azz === splitname[1]){
                    sortednames.push(azzz)
                }
            }
        }
        names = []
        for(let az of seriesshowresult){
            let splitname = az.split('::')
            names.push(splitname[1])
        }
        names.sort()
        for(let azz of names){
            for(let azzz of seriesshowresult){
                let splitname = azzz.split('::')
                if(azz === splitname[1]){
                    s_names.push(azzz)
                }
            }
        }
        if(filter === '0'){setMoviesshowresult(sortednames); setSeriesshowresult(s_names)}
        else{setMoviesshowresult(sortednames.reverse()); setSeriesshowresult(s_names.reverse())}
    }
    const Raterange = async (filter) => {
        let names = []
        let sortednames = []
        let s_names = []
        for(let az of moviesshowresult){
            let splitname = az.split('::')
            names.push(splitname[3])
        }
        names.sort((a, b) => a - b)
        for(let azz of names){
            for(let azzz of moviesshowresult){
                let splitname = azzz.split('::')
                if(azz === splitname[3]){
                    moviesshowresult.splice(moviesshowresult.indexOf(azzz), 1)
                    sortednames.push(azzz)
                }
            }
        }
        names = []
        for(let az of seriesshowresult){
            let splitname = az.split('::')
            names.push(splitname[3])
        }
        names.sort((a, b) => a - b)
        for(let azz of names){
            for(let azzz of seriesshowresult){
                let splitname = azzz.split('::')
                if(azz === splitname[3]){
                    seriesshowresult.splice(seriesshowresult.indexOf(azzz), 1)
                    s_names.push(azzz)
                }
            }
        }
        if(filter === '0'){setMoviesshowresult(sortednames); setSeriesshowresult(s_names)}
        else{setMoviesshowresult(sortednames.reverse()); setSeriesshowresult(s_names.reverse())}
    }
    const handlers = useSwipeable({
        onSwipedLeft: () => {seriesormovies === 0 ? setSeriesormovies(1) : setSeriesormovies(0)},
        onSwipedRight: () => {seriesormovies === 0 ? setSeriesormovies(1) : setSeriesormovies(0)}
    })
    const Smoothdelay = () => {
        if(smoothdelay){setTimeout(() => {setSmootdelay(false)}, 350)}
        else{setSmootdelay(true)}
    }
    const cucheck = (e) => {
        firebase.firestore().collection('users')
        .onSnapshot((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                if(doc.data().username === e){setCheckcu(1)}
            })
        })
    }
    const Changingun = async (e) => {
        e.preventDefault()
        let temp = usernameval
        setUsernameval('submitted')
        await firebase.firestore().collection('users').doc(user.uid).update({username: temp})
        setChangeun(false)
        setUsermodal(true)
        Homeshow(0)
    }
    /*    ---for data transferring from doc to doc---
    firebase.firestore().collection('users').doc(user.uid).get().then((doc) => {
        var data = doc.data();
        firebase.firestore().collection('users').doc('sTDzPgqTo8bIJZiBAUf4xAyMoQ22').set(data)
    })*/
    const theend = async() => {
        await firebase.auth().signOut()
        window.location.reload()
        window.location.href = 'https://bingers-play.web.app/'
    }
    if(request == 0 && user !== null && (user.emailVerified || user.providerData[0].providerId !== 'password')){
        Homeshow('0')
        setRequest(1)
    }
    window.onscroll = function(){scrollf()}
    const scrollf = () => {
        if(document.body.scrollTop > 500 || document.documentElement.scrollTop > 500){
            setBttview(true)
        } else {
            setBttview(false)
        }
    }
    var badgestyle = {borderColor: (dark === 0 ? '' : '#2c2c30'), marginBottom: '8px', borderRadius: '50px', color: 'gray', fontWeight: '700', backgroundColor: (dark === 0 ? 'rgba(52, 52, 52, 0.2' : 'rgba(55, 55, 55, 1')}
    var flagbadgestyle = {borderColor: (dark === 0 ? '' : '#2c2c30'), marginBottom: '8px', borderRadius: '50px', color: 'tomato', fontWeight: '700', backgroundColor: 'rgba(255, 99, 71, 0.2)'}
    var selbadgestyle = {borderColor: (dark === 0 ? '' : '#2c2c30'), marginBottom: '8px', borderRadius: '50px', fontWeight: '700', color: 'orange', backgroundColor: 'rgba(254, 216, 177, 0.2)'}
    var final = []
    var shareurl = `https://bingers-play.web.app/#${userid}`
    var sharetitle = `Hey, View my watched Series and Movies list @BingersPlay. My BPId: ${userid}, Check it out here `
    var countofshowresult = 0
    var error = 0
    var showresult
    if(dark === 1){document.body.style.backgroundColor = "#171717"}
    else{document.body.style.backgroundColor = "white"}
    if(seriesormovies === 0){showresult = moviesshowresult}
    else{showresult = seriesshowresult}
    return (<div style={{maxWidth: '1130px', margin: '0 auto'}}>{user !== null && (user.emailVerified  || user.providerData[0].providerId !== 'password') ?
        <>
        <div className='topfield'>
            <Button style={{marginLeft: '2%', marginRight: '1.2%', paddingTop: '4px', paddingLeft: '0px'}} variant="none"><AiOutlinePlus turn={searchbar ? '1': '2'} style={{width: '22', height: '22', color: (dark === 0 ? '' : '#EDEDED')}} className='plustocross' onClick={() => {setResults([]); setWord(''); Smoothdelay(); searchbar ? <>{setSearchbar(false)}</> : <>{setSearchbar(true)}</>}} /></Button>
            {searchbar !== undefined && <Form.Control  id={dark === 0 ? '' : 'placeholderun'} style={{color: (dark === 0 ? '' : '#EDEDED'), backgroundColor: (dark === 0 ? '' : '#171717')}} smooth={searchbar ? '1' : '2'} className='slidebar' type='text' placeholder='Add Movie/Series' value={word} onChange={onChange}/>}
            {!smoothdelay && <>
            <h4 style={{cursor: 'default', marginTop: '5px', marginBottom: '5px', color: (dark === 0 ? 'green' : 'limegreen'), width:'100%'}}>Bingers Play</h4>
            <Button onClick={() => {window.location.assign('#hithere'); setUsermodal(true)}} style={{paddingTop: '0px'}} variant="none"><img style={user.providerData[0].photoURL !== null ? {width: '35px', borderRadius: '30px'} : {width: '24px', height: '24px'}} alt='menu' src={user.providerData[0].photoURL !== null ? user.providerData[0].photoURL : "https://img.icons8.com/material-rounded/48/000000/user.png"} type='button'/></Button>
            </>}
            <Modal onHide={() => {setUsermodal(false); setOutsure(0); setMedia(false); window.history.go(-1)}} contentClassName='popup' show={usermodal} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
                        <Modal.Body style={{backgroundColor: (dark === 0 ? '' : '#2c2c30'), borderRadius: '25px'}}>
                            <div style={{color: (dark === 0 ? '' : '#EDEDED'), display: 'flex', paddingTop: '15px'}}>
                            <div>
                            <img style={user.providerData[0].photoURL !== null ? {width: '48px', height: '48px', borderRadius: '10px'} : {width: '48px', height: '48px', borderRadius: '10px'}} alt='menu' src={user.providerData[0].photoURL !== null ? user.providerData[0].photoURL : "https://img.icons8.com/material-rounded/96/000000/user.png"} />
                            </div>
                            <div style={{paddingLeft: '10px', width: '76%', display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly'}}>
                            <h5 style={{cursor: 'default', fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden', paddingTop: '3px'}}>{userid}</h5>
                            </div>
                            <div style={{margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly'}}>
                            <MdModeEdit style={{cursor: 'pointer'}} onClick={() => {setChangeun(true); setUsermodal(false); setUsernameval(''); setCheckcu(0)}}/>
                            </div>
                            </div>
                            <h6 style={{cursor: 'default', paddingTop: '10px', textOverflow: 'ellipsis', overflow: 'hidden', fontSize: '86%', color: 'gray'}}>{user.providerData[0].providerId !== 'password' ? `Signed with ${(user.providerData[0].providerId).slice(0, -4)}` : 'Signed with Email'}{user.providerData[0].displayName !== null && ` (${user.providerData[0].displayName})`}</h6>
                            <h6 style={{cursor: 'default', textOverflow: 'ellipsis', overflow: 'hidden', fontSize: '86%', color: 'gray'}}>{user.providerData[0].email !== null && user.providerData[0].email}</h6>
                            <div style={{paddingTop: '20px', paddingBottom: '20px'}}>
                            </div>
                            {media ? 
                            <div style={{display: 'flex', justifyContent: 'space-evenly'}}><BiArrowBack onClick={() => setMedia(false)} style={{color: (dark === 0 ? '' : '#EDEDED'), cursor: 'pointer', marginTop: '6px', height: '24px', width: '24px'}}/><OverlayTrigger rootClose trigger='click' placement='top' overlay={<Popover style={{borderRadius: '50px', marginBottom: '5px'}}><Popover.Content style={{cursor: 'default', height: '30px', paddingTop: '5px'}}>Copied to clipboard</Popover.Content></Popover>}><LivejournalIcon style={{cursor: 'pointer'}} size={38} round onClick={() =>  navigator.clipboard.writeText(sharetitle+shareurl)}/></OverlayTrigger><WhatsappShareButton url={shareurl} title={sharetitle}><WhatsappIcon size={38} round /></WhatsappShareButton><FacebookShareButton url={shareurl} title={sharetitle}><FacebookIcon size={38} round /></FacebookShareButton><TwitterShareButton url={shareurl} title={sharetitle}><TwitterIcon size={38} round /></TwitterShareButton></div> :
                            <div style={{display: 'flex', justifyContent: 'space-between'}}><Button style={outsure === 0 ? {color: 'gray', width: '30%'} : {width: '30%'}} onClick={() => {outsure === 0 ? setOutsure(1) : theend()}} variant={outsure === 0 ? 'none' : 'danger'}>{outsure === 0 ? 'Sign out' : 'Sure' }</Button>
                            <Button onClick={() => setMedia(true)} style={{color: (dark === 0 ? '' : 'limegreen'), borderColor: (dark === 0 ? '' : 'limegreen')}} variant={dark === 0 ? 'outline-success' : 'none'}>Share profile</Button></div>}
                        </Modal.Body>
                        </Modal>
            <Modal show={changeun} onHide={() => {setChangeun(false); setUsermodal(true)}}>
                <Modal.Header style={{backgroundColor: (dark === 0 ? '' : '#2c2c30')}}>
                    <Modal.Title style={{cursor: 'default', color: (dark === 0 ? 'green' : 'limegreen')}}>Bingers Play</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{backgroundColor: (dark === 0 ? '' : '#2c2c30')}}>
                {usernameval !== 'submitted' ? 
                <Form onSubmit={Changingun}>
                    <Form.Group style={{marginBottom: '20px'}}>
                        <Form.Control id={dark === 0 ? '' : 'placeholderun'} style={{color: (dark === 0 ? '' : '#EDEDED'), backgroundColor: (dark === 0 ? '' : '#2c2c30')}} placeholder='Change username' type='text' onChange={(e) => {setUsernameval(e.target.value); cucheck(e.target.value); setCheckcu(0)}} required />
                        {((usernameval.match(/^[0-9a-z\-.]+$/) === null) && usernameval !== '') && (error = 1, <p style={{color: (dark === 0 ? 'red' : 'tomato')}}>Usernames can only use small letters, numbers, hyphen and periods.</p>)}
                        {usernameval.length > 20 && (error = 1, <p style={{color: (dark === 0 ? 'red' : 'tomato')}}>Please be within 20 characters.</p>)}
                        {checkcu === 1 && (<p style={{color: (dark === 0 ? 'red' : 'tomato')}}>Username already taken.</p>)}
                        </Form.Group>
                        <Button variant='success' className='w-100' type='submit' disabled={(error||checkcu) === 1 || usernameval === ''}>Change</Button>
                    </Form> : <h1 style={{color: (dark === 0 ? 'green' : 'limegreen'), textAlign: 'center'}}>Changed Successfully</h1>}
                </Modal.Body>
            </Modal>
        </div>
        <div>
            {results.length > 0 && (
                <div>
                    {results.slice(0, showmoreresults).map((e) => (e.media_type !== 'person' && (
                    <div><ListGroup variant="flush">{alreadythere.includes((e.id).toString()) ? <ListGroup.Item disabled style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', backgroundColor: (dark === 0 ? '' : '#171717')}}><div style={{width: '60%'}}>{e.name || e.title} {<Button variant='danger' style={{paddingTop: '0px', paddingBottom: '0px', paddingLeft: '4px', paddingRight: '4px', fontSize: '12px', fontWeight: '700', borderRadius: '10px', color: (dark === 0 ? '' : '#171717')}}>Added</Button>}</div><div>{(e.first_air_date && (e.first_air_date).slice(0,4)) || (e.release_date && (e.release_date).slice(0,4))} . {e.media_type === 'tv' ? 'series' : 'movie'}</div></ListGroup.Item> : <ListGroup.Item className='searchbtns' onClick={() => {window.location.assign('#hithere'); setRating(0); setGenre(['one', 'one']); setDisable_popup(true); setWhichbutton(e)}} style={{backgroundColor: (dark === 0 ? '' : '#171717'), color: (dark === 0 ? '' : '#EDEDED'), cursor: 'pointer', display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}><div style={{width: '60%', fontWeight:'600'}}>{e.name || e.title}</div><div>{(e.first_air_date && (e.first_air_date).slice(0,4)) || (e.release_date && (e.release_date).slice(0,4))} . {e.media_type === 'tv' ? 'series' : 'movie'}</div></ListGroup.Item>}</ListGroup></div>)))}
                        {(results.length > 10 && showmoreresults === 10) ? <Button onClick={() => setShowmoreresults(20)} style={{width: '100%', height: '75px', color: (dark === 0 ? '' : '#EDEDED')}} variant='none'>Show more results</Button> : <><br/><br/><br/><br/><br/><br/></>}
                        <Modal onHide={() => {setDisable_popup(false); window.history.go(-1)}} contentClassName='popup' show={disable_popup} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
                        <Modal.Body  style={{backgroundColor: (dark === 0 ? '' : '#2c2c30'), borderRadius: '25px'}}>
                        <div style={{display: 'flex', marginTop: '10px'}}>
                                    <img style={{marginLeft: '5px', width: '25%', height: '50%', borderRadius: '7px'}} src={whichbutton.poster_path === null ? 'https://allmovies.tube/assets/img/no-poster.png' : "https://image.tmdb.org/t/p/w500"+whichbutton.poster_path} alt="Poster" />
                                    <div style={{paddingLeft: '15px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                                    <div><h5 style={{color: (dark === 0 ? '' : '#EDEDED')}} className='titletextedit'>{whichbutton.name||whichbutton.title}</h5></div>
                                    <div style={{cursor: 'default', color:'gray'}}><h6 className='mb-1'>{whichbutton.media_type === 'movie' ? 'Movie' : 'Series'}</h6>
                                    <h6 className='mb-1'>{(whichbutton.first_air_date && ((whichbutton.first_air_date).slice(0, 4))) || (whichbutton.release_date && ((whichbutton.release_date).slice(0, 4)))}</h6></div>
                                    </div>
                                    </div>
                                    <Form>
                                    <Form.Group controlId="formBasicRange">
                                        <InputGroup className="mb-3 mt-3" style={{justifyContent: 'space-around'}}>
                                        <Form.Control style={{cursor: 'pointer', width: '60%'}} value={rating} onChange={(e) => setRating(e.target.value)} type="range" min={0} max={10} step={0.5}/>
                                        <InputGroup.Append>
                                        <div class="circular">
                                        <div class="inner" style={{background: (dark === 0 ? 'white' : '#2c2c30')}}></div>
                                        <div class="number">{rating}</div>
                                        <div class="circle">
                                        {rating == 0.5 && (
                                            <div class="bar" style={{clipPath: 'polygon(50% 0%, 50% 46%, 66% 0)'}}>
                                                <div class="progress"></div>
                                            </div>)}
                                        {rating == 1 && (
                                            <div class="bar" style={{clipPath: 'polygon(50% 0%, 50% 46%, 85% 0)'}}>
                                                <div class="progress"></div>
                                            </div>)}
                                        {rating == 1.5 && (
                                            <div class="bar" style={{clipPath: 'polygon(50% 0%, 50% 46%, 100% 0)'}}>
                                                <div class="progress"></div>
                                            </div>)}
                                        {rating == 2 && (
                                            <div class="bar" style={{clipPath: 'polygon(50% 0%, 50% 46%, 175% 0)'}}>
                                                <div class="progress"></div>
                                            </div>)}
                                        {rating == 2.5 && (
                                            <div class="bar" style={{clipPath: 'inset(0 0 50% 50%)'}}>
                                                <div class="progress"></div>
                                            </div>)}
                                        {rating == 3 && (
                                            <div class="bar" style={{clipPath: 'polygon(50% 0%, 100% 0%, 100% 65%, 50% 50%)'}}>
                                                <div class="progress"></div>
                                            </div>)}
                                        {rating == 3.5 && (
                                            <div class="bar" style={{clipPath: 'polygon(50% 0%, 100% 0%, 100% 85%, 50% 50%)'}}>
                                                <div class="progress"></div>
                                            </div>)}
                                        {rating == 4 && (
                                            <div class="bar" style={{clipPath: 'polygon(50% 0%, 100% 0%, 100% 110%, 50% 50%)'}}>
                                                <div class="progress"></div>
                                            </div>)}
                                        {rating == 4.5 && (
                                            <div class="bar" style={{clipPath: 'polygon(50% 0%, 100% 0%, 100% 190%, 50% 50%)'}}>
                                                <div class="progress"></div>
                                            </div>)}
                                        {rating == 5 && (
                                            <div class="bar" style={{clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)'}}>
                                                <div class="progress"></div>
                                            </div>)}
                                        {rating == 5.5 && (
                                            <div class="bar" style={{clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 35% 100%, 50% 50%)'}}>
                                                <div class="progress"></div>
                                            </div>)}
                                        {rating == 6 && (
                                            <div class="bar" style={{clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 10% 100%, 50% 50%)'}}>
                                                <div class="progress"></div>
                                            </div>)}
                                        {rating == 6.5 && (
                                            <div class="bar" style={{clipPath: 'polygon(50% 0, 100% 0, 100% 100%, -20% 100%, 50% 50%)'}}>
                                                <div class="progress"></div>
                                            </div>)}
                                        {rating == 7 && (
                                            <div class="bar" style={{clipPath: 'polygon(50% 0, 100% 0, 100% 100%, -90% 100%, 50% 50%)'}}>
                                                <div class="progress"></div>
                                            </div>)}
                                        {rating == 7.5 && (
                                            <div class="bar" style={{clipPath: 'polygon(50% 0, 100% 0, 100% 100%, -5000% 100%, 50% 50%)'}}>
                                                <div class="progress"></div>
                                            </div>)}
                                        {rating == 8 && (
                                            <div class="bar" style={{clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 50%, 0 35%)'}}>
                                                <div class="progress"></div>
                                            </div>)}
                                        {rating == 8.5 && (
                                            <div class="bar left" style={{clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 50%, 0 10%)'}}>
                                                <div class="progress"></div>
                                            </div>)}
                                        {rating == 9 && (
                                            <div class="bar left" style={{clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 50%, 0 -20%)'}}>
                                                <div class="progress"></div>
                                            </div>)}
                                        {rating == 9.5 && (
                                            <div class="bar left" style={{clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 50%, 0 -50%)'}}>
                                                <div class="progress"></div>
                                            </div>)}
                                        {rating == 10 && (
                                            <div class="bar left" style={{clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 50%, 0 -50000%)'}}>
                                                <div class="progress"></div>
                                            </div>)}
                                        </div>
                                        </div>
                                        </InputGroup.Append>
                                        </InputGroup>
                                    </Form.Group>
                                    <p style={{cursor: 'default', color: 'gray'}}>Select 1 or 2 genre</p>
                                    <Form.Group>
                                        <div style={{height: '142px', overflow: 'hidden', overflowY: 'scroll'}}>
                                        <Button className='genrebtn' onClick={() => {genre.indexOf('Action') !== -1 ? oneenough('Action') : setGenre([...genre, 'Action'])}} style={genre.indexOf('Action') !== -1 ? selbadgestyle : badgestyle} variant='light' active>Action</Button>{' '}
                                        <Button className='genrebtn' onClick={() => {genre.indexOf('Adventure') !== -1 ? oneenough('Adventure') : setGenre([...genre, 'Adventure'])}} style={genre.indexOf('Adventure') !== -1 ? selbadgestyle : badgestyle} variant='light'>Adventure</Button>{' '}
                                        <Button className='genrebtn' onClick={() => {genre.indexOf('Comedy') !== -1 ? oneenough('Comedy') : setGenre([...genre, 'Comedy'])}} style={genre.indexOf('Comedy') !== -1 ? selbadgestyle : badgestyle} variant='light'>Comedy</Button>{' '}
                                        <Button className='genrebtn' onClick={() => {genre.indexOf('Crime') !== -1 ? oneenough('Crime') : setGenre([...genre, 'Crime'])}} style={genre.indexOf('Crime') !== -1 ? selbadgestyle : badgestyle} variant='light'>Crime</Button>{' '}
                                        <Button className='genrebtn' onClick={() => {genre.indexOf('Drama') !== -1 ? oneenough('Drama') : setGenre([...genre, 'Drama'])}} style={genre.indexOf('Drama') !== -1 ? selbadgestyle : badgestyle} variant='light'>Drama</Button>{' '}
                                        <Button className='genrebtn' onClick={() => {genre.indexOf('Fantasy') !== -1 ? oneenough('Fantasy') : setGenre([...genre, 'Fantasy'])}} style={genre.indexOf('Fantasy') !== -1 ? selbadgestyle : badgestyle} variant='light'>Fantasy</Button>{' '}
                                        <Button className='genrebtn' onClick={() => {genre.indexOf('Feel good') !== -1 ? oneenough('Feel good') : setGenre([...genre, 'Feel good'])}} style={genre.indexOf('Feel good') !== -1 ? selbadgestyle : badgestyle} variant='light'>Feel good</Button>{' '}
                                        <Button className='genrebtn' onClick={() => {genre.indexOf('Horror') !== -1 ? oneenough('Horror') : setGenre([...genre, 'Horror'])}} style={genre.indexOf('Horror') !== -1 ? selbadgestyle : badgestyle} variant='light'>Horror</Button>{' '}
                                        <Button className='genrebtn' onClick={() => {genre.indexOf('Love') !== -1 ? oneenough('Love') : setGenre([...genre, 'Love'])}} style={genre.indexOf('Love') !== -1 ? selbadgestyle : badgestyle} variant='light'>Love</Button>{' '}
                                        <Button className='genrebtn' onClick={() => {genre.indexOf('Mystery') !== -1 ? oneenough('Mystery') : setGenre([...genre, 'Mystery'])}} style={genre.indexOf('Mystery') !== -1 ? selbadgestyle : badgestyle} variant='light'>Mystery</Button>{' '}
                                        <Button className='genrebtn' onClick={() => {genre.indexOf('Romance') !== -1 ? oneenough('Romance') : setGenre([...genre, 'Romance'])}} style={genre.indexOf('Romance') !== -1 ? selbadgestyle : badgestyle} variant='light'>Romance</Button>{' '}
                                        <Button className='genrebtn' onClick={() => {genre.indexOf('Sci-fi') !== -1 ? oneenough('Sci-fi') : setGenre([...genre, 'Sci-fi'])}} style={genre.indexOf('Sci-fi') !== -1 ? selbadgestyle : badgestyle} variant='light'>Sci-fi</Button>{' '}
                                        <Button className='genrebtn' onClick={() => {genre.indexOf('Thriller') !== -1 ? oneenough('Thriller') : setGenre([...genre, 'Thriller'])}} style={genre.indexOf('Thriller') !== -1 ? selbadgestyle : badgestyle} variant='light'>Thriller</Button>{' '}
                                        <Button className='genrebtn' onClick={() => {genre.indexOf('Weird') !== -1 ? oneenough('Weird') : setGenre([...genre, 'Weird'])}} style={genre.indexOf('Weird') !== -1 ? selbadgestyle : badgestyle} variant='light'>Weird</Button>{' '}
                                        <Button className='genrebtn' onClick={() => {genre.indexOf('Boring') !== -1 ? oneenough('Boring') : setGenre([...genre, 'Boring'])}} style={genre.indexOf('Boring') !== -1 ? selbadgestyle : badgestyle} variant='light'>Boring</Button>{' '}
                                        <Button className='flaggenrebtn' onClick={() => {genre.indexOf('Flag') !== -1 ? oneenough('Flag') : setGenre([...genre, 'Flag'])}} style={genre.indexOf('Flag') !== -1 ? flagbadgestyle : badgestyle} variant='light'>Flag</Button>
                                        </div>
                                    </Form.Group>
                                    <Button style={{marginTop: '30px', width: '100%'}} onClick={() => {Added(whichbutton); setDisable_popup(false)}} variant='success' disabled={(genre[0])&&(genre[1]) === 'one'}>Add</Button>
                                    </Form>
                        </Modal.Body>
                        </Modal>
                </div>
            )}{(word.length > 1 && results.length === 0) && <><br/><br/><br/><h1 style={{color: 'green', textAlign: 'center'}}>Searching...</h1><br/><br/><br/></>}
        </div>
        {word === '' &&
        <div style={{marginTop: '-1%', paddingLeft: '10px', display: 'flex', justifyContent:'space-between'}}>
        <h1 style={{cursor: 'default', paddingLeft: '4px', fontWeight: '700', color: (dark === 0 ? 'gray' : '#EDEDED')}}>{seriesormovies === 0 ? 'Movies' : 'Series'} <Button variant='light' style={{cursor: 'default', height: '22px',paddingTop: '0px', marginBottom: '3px', paddingLeft: '4px', paddingRight: '4px', fontSize: '15px', fontWeight: '700', borderRadius: '50px', color: (dark === 0 ? 'white' : 'black'), backgroundColor: (dark === 0 ? 'black' : '#EDEDED')}}>{seriesormovies === 0 ? <>{moviesshowresult === 3 ? 0 : moviesshowresult.length}</> : <>{seriesshowresult === 3 ? 0 : seriesshowresult.length}</>}</Button></h1>
            <Dropdown as={ButtonGroup} className='equalize'>
                <Dropdown.Toggle variant={dark === 0 ? 'none' : 'dark'} menuAlign="right">
                    <Dropdown.Menu style={{backgroundColor: (dark === 0 ? '' : '#2c2c30')}}>
                    <Dropdown.Header style={{color: (dark === 0 ? '' : 'gray')}} >Switch to</Dropdown.Header>
                    <Dropdown.Item style={{color: (dark === 0 ? '' : '#EDEDED')}} onClick={()=> {seriesormovies === 0 ? setSeriesormovies(1) : setSeriesormovies(0)}}>{seriesormovies === 0 ? 'Series' : 'Movies'}</Dropdown.Item>
                    <Dropdown.Divider style={{backgroundColor: (dark === 0 ? '' : '#EDEDED'), marginLeft: '25%', width: '50%'}}/>
                    <Dropdown.Header style={{color: (dark === 0 ? '' : 'gray')}}>View by</Dropdown.Header>
                    <Dropdown.Item style={{color: (dark === 0 ? '' : '#EDEDED')}} onClick={()=> {viewby ? setViewby(false) : setViewby(true)}}>{viewby ? 'Sherlock view' : 'Groot view'}</Dropdown.Item>
                    <Dropdown.Divider style={{backgroundColor: (dark === 0 ? '' : '#EDEDED'), marginLeft: '25%', width: '50%'}}/>
                    <Dropdown.Header style={{color: (dark === 0 ? '' : 'gray')}}>Mode</Dropdown.Header>
                    <Dropdown.Item style={{color: (dark === 0 ? '' : '#EDEDED')}} onClick={()=> {dark === 0 ? setDark(1) : setDark(0)}}>{dark === 0 ? 'Batman mode' : 'Classic mode'}</Dropdown.Item>
                    <Dropdown.Divider style={{backgroundColor: (dark === 0 ? '' : '#EDEDED'), marginLeft: '25%', width: '50%'}}/>
                    <Dropdown.Header style={{color: (dark === 0 ? '' : 'gray')}}>Sort by</Dropdown.Header>
                    <Dropdown.Item style={{color: (dark === 0 ? '' : '#EDEDED')}} onClick={()=> {Homeshow('0'); setGenremode(false)}}>Date (Newest)</Dropdown.Item>
                    <Dropdown.Item style={{color: (dark === 0 ? '' : '#EDEDED')}} onClick={()=> {Homeshow('1'); setGenremode(false)}}>Date (Oldest)</Dropdown.Item>
                    <Dropdown.Item style={{color: (dark === 0 ? '' : '#EDEDED')}} onClick={()=> {AtoZ('0'); setGenremode(false)}}>A-Z</Dropdown.Item>
                    <Dropdown.Item style={{color: (dark === 0 ? '' : '#EDEDED')}} onClick={()=> {AtoZ('1'); setGenremode(false)}}>Z-A</Dropdown.Item>
                    <Dropdown.Item style={{color: (dark === 0 ? '' : '#EDEDED')}} onClick={()=> {Raterange('1'); setGenremode(false)}}>Rating (10-0)</Dropdown.Item>
                    <Dropdown.Item style={{color: (dark === 0 ? '' : '#EDEDED')}} onClick={()=> {Raterange('0'); setGenremode(false)}}>Rating (0-10)</Dropdown.Item>
                    <Dropdown.Item style={{color: (dark === 0 ? '' : '#EDEDED')}} onClick={()=> {window.location.assign('#hithere'); setSortgenre(true)}}>Genre</Dropdown.Item>
                    &nbsp;
                    </Dropdown.Menu>
                </Dropdown.Toggle>
            </Dropdown>
        </div>}
        <Modal size="lg" aria-labelledby="contained-modal-title-vcenter" centered contentClassName='popup' show={sortgenre} onHide={() => {setSortgenre(false); window.history.go(-1)}}>
                <Modal.Body style={{backgroundColor: (dark === 0 ? '' : '#2c2c30'), borderRadius: '25px'}}>
                    <h1 style={{color: (dark === 0 ? 'gray' : '#EDEDED'), paddingBottom: '15px', marginLeft: '5px'}}><strong>Sort genre by</strong></h1>
                    <Button className='genrebtn' onClick={() => {setTempgenre('Action'); setGenremode(true); setSortgenre(false); window.history.go(-1)}} style={badgestyle} variant='light' active>Action</Button>{' '}
                    <Button className='genrebtn' onClick={() => {setTempgenre('Adventure'); setGenremode(true); setSortgenre(false); window.history.go(-1)}} style={badgestyle} variant='light'>Adventure</Button>{' '}
                    <Button className='genrebtn' onClick={() => {setTempgenre('Comedy'); setGenremode(true); setSortgenre(false); window.history.go(-1)}} style={badgestyle} variant='light'>Comedy</Button>{' '}
                    <Button className='genrebtn' onClick={() => {setTempgenre('Crime'); setGenremode(true); setSortgenre(false); window.history.go(-1)}} style={badgestyle} variant='light'>Crime</Button>{' '}
                    <Button className='genrebtn' onClick={() => {setTempgenre('Drama'); setGenremode(true); setSortgenre(false); window.history.go(-1)}} style={badgestyle} variant='light'>Drama</Button>{' '}
                    <Button className='genrebtn' onClick={() => {setTempgenre('Fantasy'); setGenremode(true); setSortgenre(false); window.history.go(-1)}} style={badgestyle} variant='light'>Fantasy</Button>{' '}
                    <Button className='genrebtn' onClick={() => {setTempgenre('Feel good'); setGenremode(true); setSortgenre(false); window.history.go(-1)}} style={badgestyle} variant='light'>Feel good</Button>{' '}
                    <Button className='genrebtn' onClick={() => {setTempgenre('Horror'); setGenremode(true); setSortgenre(false); window.history.go(-1)}} style={badgestyle} variant='light'>Horror</Button>{' '}
                    <Button className='genrebtn' onClick={() => {setTempgenre('Love'); setGenremode(true); setSortgenre(false); window.history.go(-1)}} style={badgestyle} variant='light'>Love</Button>{' '}
                    <Button className='genrebtn' onClick={() => {setTempgenre('Mystery'); setGenremode(true); setSortgenre(false); window.history.go(-1)}} style={badgestyle} variant='light'>Mystery</Button>{' '}
                    <Button className='genrebtn' onClick={() => {setTempgenre('Romance'); setGenremode(true); setSortgenre(false); window.history.go(-1)}} style={badgestyle} variant='light'>Romance</Button>{' '}
                    <Button className='genrebtn' onClick={() => {setTempgenre('Sci-fi'); setGenremode(true); setSortgenre(false); window.history.go(-1)}} style={badgestyle} variant='light'>Sci-fi</Button>{' '}
                    <Button className='genrebtn' onClick={() => {setTempgenre('Thriller'); setGenremode(true); setSortgenre(false); window.history.go(-1)}} style={badgestyle} variant='light'>Thriller</Button>{' '}
                    <Button className='genrebtn' onClick={() => {setTempgenre('Weird'); setGenremode(true); setSortgenre(false); window.history.go(-1)}} style={badgestyle} variant='light'>Weird</Button>{' '}
                    <Button className='genrebtn' onClick={() => {setTempgenre('Boring'); setGenremode(true); setSortgenre(false); window.history.go(-1)}} style={badgestyle} variant='light'>Boring</Button>{' '}
                    <Button className='genrebtn' onClick={() => {setTempgenre('Flag'); setGenremode(true); setSortgenre(false); window.history.go(-1)}} style={badgestyle} variant='light'>Flag</Button>
                </Modal.Body>
            </Modal>
        {word === '' && <>
        {showresult.length > 0 ? (
        <div style={{minHeight: '87vh'}} {...handlers}>
        <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center'}}>
            {showresult.map((e) => (final = e.split('::'), <>{genremode ? ((tempgenre === final[4] || tempgenre ===  final[5]) && (countofshowresult = 1)) : countofshowresult = 1}</>, 
            <div>{viewby ? <>
                <Card className={dark === 0 ? 'hulkcardstyle' : 'hulkcardstyledark'} style={{display: (genremode && ((tempgenre === final[4] || tempgenre ===  final[5]) ? '' : 'none'))}} onClick={()=>{window.location.assign('#hithere'); setCardclicked(e.split('::')); setCardmodal(true); setRating(e.split('::')[3]); setGenre([e.split('::')[4], e.split('::')[5]])}}>
                    <Card.Title className='titletext'>{final[1]}</Card.Title>
                </Card>
                </> : <>
            <Card className={dark === 0 ? 'sherlockcardstyle' : 'sherlockcardstyledark'} style={{display: (genremode && ((tempgenre === final[4] || tempgenre ===  final[5]) ? '' : 'none'))}} onClick={()=>{window.location.assign('#hithere'); setCardclicked(e.split('::')); setCardmodal(true); setRating(e.split('::')[3]); setGenre([e.split('::')[4], e.split('::')[5]])}}>
                <Card.Img style={{borderRadius: '20px', width: '25%', height: 'auto'}} alt='Poster' src={final[0] === 'null' ? 'https://allmovies.tube/assets/img/no-poster.png' : "https://image.tmdb.org/t/p/w500"+final[0]} />
                <Card.Body style={{padding: '0px', paddingLeft: '2%'}}>
                    <div style={{height: '45%',  paddingLeft: '2.5%'}}>
                    <Card.Title className='titletext'>{final[1]}</Card.Title>
                    <Card.Text style={{color: 'gray', marginTop: '-4%'}}>{final[2]}</Card.Text>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly'}}>
                    <div style={{display: 'flex', flexDirection: 'column', width:'50%', justifyContent: 'space-evenly'}}>
                    {final[4] === 'one' && <Button style={{marginBottom: '3%', paddingTop: '0%', paddingBottom: '0%', borderRadius: '50px', fontWeight: '500', color: 'orange', backgroundColor: 'rgba(254, 216, 177, 0.2)', border: 'none'}} variant='light'>{final[5]}</Button>}
                    {final[5] === 'one' && <Button style={{marginBottom: '3%', paddingTop: '0%', paddingBottom: '0%', borderRadius: '50px', fontWeight: '500', color: 'orange', backgroundColor: 'rgba(254, 216, 177, 0.2)', border: 'none'}} variant='light'>{final[4]}</Button>}
                    {final[4] === final[5] && <Button style={{marginBottom: '3%', paddingTop: '0%', paddingBottom: '0%', borderRadius: '50px', fontWeight: '500', color: 'orange', backgroundColor: 'rgba(254, 216, 177, 0.2)', border: 'none'}} variant='light'>{final[4]}</Button>}
                    {(((final[4] || final[5]) !== 'one')&&(final[4] !== final[5])) && <>
                        <Button style={{marginBottom: '3%', paddingTop: '0%', paddingBottom: '0%', borderRadius: '50px', fontWeight: '500', color: 'orange', backgroundColor: 'rgba(254, 216, 177, 0.2)', border: 'none'}} variant='light'>{final[4]}</Button>
                        <Button style={{marginBottom: '3%', paddingTop: '0%', paddingBottom: '0%', borderRadius: '50px', fontWeight: '500', color: 'orange', backgroundColor: 'rgba(254, 216, 177, 0.2)', border: 'none'}} variant='light'>{final[5]}</Button>
                    </>}
                    </div>
                    <div class="cirshow">
                            <div class="innershow" style={{background: (dark === 0 ? 'white' : '#2c2c30')}}></div>
                            <div class="numbershow">{final[3]}</div>
                            <div class="circleshow">
                            {final[3] == 0.5 && (
                                            <div class="barshow" style={{clipPath: 'polygon(50% 0%, 50% 46%, 66% 0)'}}>
                                                <div class="progressshow"></div>
                                            </div>)}
                                        {final[3] == 1 && (
                                            <div class="barshow" style={{clipPath: 'polygon(50% 0%, 50% 46%, 85% 0)'}}>
                                                <div class="progressshow"></div>
                                            </div>)}
                                        {final[3] == 1.5 && (
                                            <div class="barshow" style={{clipPath: 'polygon(50% 0%, 50% 46%, 100% 0)'}}>
                                                <div class="progressshow"></div>
                                            </div>)}
                                        {final[3] == 2 && (
                                            <div class="barshow" style={{clipPath: 'polygon(50% 0%, 50% 46%, 175% 0)'}}>
                                                <div class="progressshow"></div>
                                            </div>)}
                                        {final[3] == 2.5 && (
                                            <div class="barshow" style={{clipPath: 'inset(0 0 50% 50%)'}}>
                                                <div class="progressshow"></div>
                                            </div>)}
                                        {final[3] == 3 && (
                                            <div class="barshow" style={{clipPath: 'polygon(50% 0%, 100% 0%, 100% 65%, 50% 50%)'}}>
                                                <div class="progressshow"></div>
                                            </div>)}
                                        {final[3] == 3.5 && (
                                            <div class="barshow" style={{clipPath: 'polygon(50% 0%, 100% 0%, 100% 85%, 50% 50%)'}}>
                                                <div class="progressshow"></div>
                                            </div>)}
                                        {final[3] == 4 && (
                                            <div class="barshow" style={{clipPath: 'polygon(50% 0%, 100% 0%, 100% 110%, 50% 50%)'}}>
                                                <div class="progressshow"></div>
                                            </div>)}
                                        {final[3] == 4.5 && (
                                            <div class="barshow" style={{clipPath: 'polygon(50% 0%, 100% 0%, 100% 190%, 50% 50%)'}}>
                                                <div class="progressshow"></div>
                                            </div>)}
                                        {final[3] == 5 && (
                                            <div class="barshow" style={{clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)'}}>
                                                <div class="progressshow"></div>
                                            </div>)}
                                        {final[3] == 5.5 && (
                                            <div class="barshow" style={{clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 35% 100%, 50% 50%)'}}>
                                                <div class="progressshow"></div>
                                            </div>)}
                                        {final[3] == 6 && (
                                            <div class="barshow" style={{clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 10% 100%, 50% 50%)'}}>
                                                <div class="progressshow"></div>
                                            </div>)}
                                        {final[3] == 6.5 && (
                                            <div class="barshow" style={{clipPath: 'polygon(50% 0, 100% 0, 100% 100%, -20% 100%, 50% 50%)'}}>
                                                <div class="progressshow"></div>
                                            </div>)}
                                        {final[3] == 7 && (
                                            <div class="barshow" style={{clipPath: 'polygon(50% 0, 100% 0, 100% 100%, -90% 100%, 50% 50%)'}}>
                                                <div class="progressshow"></div>
                                            </div>)}
                                        {final[3] == 7.5 && (
                                            <div class="barshow" style={{clipPath: 'polygon(50% 0, 100% 0, 100% 100%, -5000% 100%, 50% 50%)'}}>
                                                <div class="progressshow"></div>
                                            </div>)}
                                        {final[3] == 8 && (
                                            <div class="barshow" style={{clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 50%, 0 35%)'}}>
                                                <div class="progressshow"></div>
                                            </div>)}
                                        {final[3] == 8.5 && (
                                            <div class="barshow leftshow" style={{clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 50%, 0 10%)'}}>
                                                <div class="progressshow"></div>
                                            </div>)}
                                        {final[3] == 9 && (
                                            <div class="barshow leftshow" style={{clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 50%, 0 -20%)'}}>
                                                <div class="progressshow"></div>
                                            </div>)}
                                        {final[3] == 9.5 && (
                                            <div class="barshow leftshow" style={{clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 50%, 0 -50%)'}}>
                                                <div class="progressshow"></div>
                                            </div>)}
                                        {final[3] == 10 && (
                                            <div class="barshow leftshow" style={{clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 50%, 0 -50000%)'}}>
                                                <div class="progressshow"></div>
                                            </div>)}
                            </div>
                        </div>
                    </div>
                </Card.Body>
            </Card></>}</div>))}
            <Modal onHide={() => {setCardmodal(false); setDeletesure(0); window.history.go(-1)}} contentClassName='popup' show={cardmodal} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
                        <Modal.Body style={{backgroundColor: (dark === 0 ? '' : '#2c2c30'), borderRadius: '25px'}}>
                        <div style={{cursor: 'default', display: 'flex', marginTop: '10px'}}>
                                    <img style={{marginLeft: '5px', width: '25%', height: '50%', borderRadius: '7px'}} src={cardclicked[0] === 'null' ? 'https://allmovies.tube/assets/img/no-poster.png' : "https://image.tmdb.org/t/p/w500"+cardclicked[0]} alt="Poster" />
                                    <div style={{paddingLeft: '15px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                                    <div><h5 style={{color: (dark === 0 ? '' : '#EDEDED')}} className='titletextedit'>{cardclicked[1]}</h5></div>
                                    <div style={{color:'gray'}}><h6 className='mb-1'>{seriesormovies === 0 ? 'Movie' : 'Series'}</h6>
                                    <h6 className='mb-1'>{cardclicked[2] === 'No date!' ? 'No date!' : cardclicked[2]}</h6></div>
                                    </div>
                                    </div>
                                    <Form>
                                    <Form.Group controlId="formBasicRange">
                                        <InputGroup className="mb-3 mt-3" style={{justifyContent: 'space-around'}}>
                                        <Form.Control style={{cursor: 'pointer', width: '60%'}} value={rating} onChange={(e) => setRating(e.target.value)} type="range" min={0} max={10} step={0.5} />
                                        <InputGroup.Append>
                                        <div class="circular">
                                        <div class="inner" style={{background: (dark === 0 ? 'white' : '#2c2c30')}}></div>
                                        <div class="number">{rating}</div>
                                        <div class="circle">
                                        {rating == 0.5 && (
                                            <div class="bar" style={{clipPath: 'polygon(50% 0%, 50% 46%, 66% 0)'}}>
                                                <div class="progress"></div>
                                            </div>)}
                                        {rating == 1 && (
                                            <div class="bar" style={{clipPath: 'polygon(50% 0%, 50% 46%, 85% 0)'}}>
                                                <div class="progress"></div>
                                            </div>)}
                                        {rating == 1.5 && (
                                            <div class="bar" style={{clipPath: 'polygon(50% 0%, 50% 46%, 100% 0)'}}>
                                                <div class="progress"></div>
                                            </div>)}
                                        {rating == 2 && (
                                            <div class="bar" style={{clipPath: 'polygon(50% 0%, 50% 46%, 175% 0)'}}>
                                                <div class="progress"></div>
                                            </div>)}
                                        {rating == 2.5 && (
                                            <div class="bar" style={{clipPath: 'inset(0 0 50% 50%)'}}>
                                                <div class="progress"></div>
                                            </div>)}
                                        {rating == 3 && (
                                            <div class="bar" style={{clipPath: 'polygon(50% 0%, 100% 0%, 100% 65%, 50% 50%)'}}>
                                                <div class="progress"></div>
                                            </div>)}
                                        {rating == 3.5 && (
                                            <div class="bar" style={{clipPath: 'polygon(50% 0%, 100% 0%, 100% 85%, 50% 50%)'}}>
                                                <div class="progress"></div>
                                            </div>)}
                                        {rating == 4 && (
                                            <div class="bar" style={{clipPath: 'polygon(50% 0%, 100% 0%, 100% 110%, 50% 50%)'}}>
                                                <div class="progress"></div>
                                            </div>)}
                                        {rating == 4.5 && (
                                            <div class="bar" style={{clipPath: 'polygon(50% 0%, 100% 0%, 100% 190%, 50% 50%)'}}>
                                                <div class="progress"></div>
                                            </div>)}
                                        {rating == 5 && (
                                            <div class="bar" style={{clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)'}}>
                                                <div class="progress"></div>
                                            </div>)}
                                        {rating == 5.5 && (
                                            <div class="bar" style={{clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 35% 100%, 50% 50%)'}}>
                                                <div class="progress"></div>
                                            </div>)}
                                        {rating == 6 && (
                                            <div class="bar" style={{clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 10% 100%, 50% 50%)'}}>
                                                <div class="progress"></div>
                                            </div>)}
                                        {rating == 6.5 && (
                                            <div class="bar" style={{clipPath: 'polygon(50% 0, 100% 0, 100% 100%, -20% 100%, 50% 50%)'}}>
                                                <div class="progress"></div>
                                            </div>)}
                                        {rating == 7 && (
                                            <div class="bar" style={{clipPath: 'polygon(50% 0, 100% 0, 100% 100%, -90% 100%, 50% 50%)'}}>
                                                <div class="progress"></div>
                                            </div>)}
                                        {rating == 7.5 && (
                                            <div class="bar" style={{clipPath: 'polygon(50% 0, 100% 0, 100% 100%, -5000% 100%, 50% 50%)'}}>
                                                <div class="progress"></div>
                                            </div>)}
                                        {rating == 8 && (
                                            <div class="bar" style={{clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 50%, 0 35%)'}}>
                                                <div class="progress"></div>
                                            </div>)}
                                        {rating == 8.5 && (
                                            <div class="bar left" style={{clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 50%, 0 10%)'}}>
                                                <div class="progress"></div>
                                            </div>)}
                                        {rating == 9 && (
                                            <div class="bar left" style={{clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 50%, 0 -20%)'}}>
                                                <div class="progress"></div>
                                            </div>)}
                                        {rating == 9.5 && (
                                            <div class="bar left" style={{clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 50%, 0 -50%)'}}>
                                                <div class="progress"></div>
                                            </div>)}
                                        {rating == 10 && (
                                            <div class="bar left" style={{clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 50%, 0 -50000%)'}}>
                                                <div class="progress"></div>
                                            </div>)}
                                        </div>
                                        </div>
                                        </InputGroup.Append>
                                        </InputGroup>
                                    </Form.Group>
                                    <p style={{cursor: 'default', color: 'gray'}}>Select 1 or 2 genre</p>
                                    <Form.Group>
                                        <div style={{height: '142px', overflow: 'hidden', overflowY: 'scroll'}}>
                                        <Button className='genrebtn' onClick={() => {genre.indexOf('Action') !== -1 ? oneenough('Action') : setGenre([...genre, 'Action'])}} style={genre.indexOf('Action') !== -1 ? selbadgestyle : badgestyle} variant='light' active>Action</Button>{' '}
                                        <Button className='genrebtn' onClick={() => {genre.indexOf('Adventure') !== -1 ? oneenough('Adventure') : setGenre([...genre, 'Adventure'])}} style={genre.indexOf('Adventure') !== -1 ? selbadgestyle : badgestyle} variant='light'>Adventure</Button>{' '}
                                        <Button className='genrebtn' onClick={() => {genre.indexOf('Comedy') !== -1 ? oneenough('Comedy') : setGenre([...genre, 'Comedy'])}} style={genre.indexOf('Comedy') !== -1 ? selbadgestyle : badgestyle} variant='light'>Comedy</Button>{' '}
                                        <Button className='genrebtn' onClick={() => {genre.indexOf('Crime') !== -1 ? oneenough('Crime') : setGenre([...genre, 'Crime'])}} style={genre.indexOf('Crime') !== -1 ? selbadgestyle : badgestyle} variant='light'>Crime</Button>{' '}
                                        <Button className='genrebtn' onClick={() => {genre.indexOf('Drama') !== -1 ? oneenough('Drama') : setGenre([...genre, 'Drama'])}} style={genre.indexOf('Drama') !== -1 ? selbadgestyle : badgestyle} variant='light'>Drama</Button>{' '}
                                        <Button className='genrebtn' onClick={() => {genre.indexOf('Fantasy') !== -1 ? oneenough('Fantasy') : setGenre([...genre, 'Fantasy'])}} style={genre.indexOf('Fantasy') !== -1 ? selbadgestyle : badgestyle} variant='light'>Fantasy</Button>{' '}
                                        <Button className='genrebtn' onClick={() => {genre.indexOf('Feel good') !== -1 ? oneenough('Feel good') : setGenre([...genre, 'Feel good'])}} style={genre.indexOf('Feel good') !== -1 ? selbadgestyle : badgestyle} variant='light'>Feel good</Button>{' '}
                                        <Button className='genrebtn' onClick={() => {genre.indexOf('Horror') !== -1 ? oneenough('Horror') : setGenre([...genre, 'Horror'])}} style={genre.indexOf('Horror') !== -1 ? selbadgestyle : badgestyle} variant='light'>Horror</Button>{' '}
                                        <Button className='genrebtn' onClick={() => {genre.indexOf('Love') !== -1 ? oneenough('Love') : setGenre([...genre, 'Love'])}} style={genre.indexOf('Love') !== -1 ? selbadgestyle : badgestyle} variant='light'>Love</Button>{' '}
                                        <Button className='genrebtn' onClick={() => {genre.indexOf('Mystery') !== -1 ? oneenough('Mystery') : setGenre([...genre, 'Mystery'])}} style={genre.indexOf('Mystery') !== -1 ? selbadgestyle : badgestyle} variant='light'>Mystery</Button>{' '}
                                        <Button className='genrebtn' onClick={() => {genre.indexOf('Romance') !== -1 ? oneenough('Romance') : setGenre([...genre, 'Romance'])}} style={genre.indexOf('Romance') !== -1 ? selbadgestyle : badgestyle} variant='light'>Romance</Button>{' '}
                                        <Button className='genrebtn' onClick={() => {genre.indexOf('Sci-fi') !== -1 ? oneenough('Sci-fi') : setGenre([...genre, 'Sci-fi'])}} style={genre.indexOf('Sci-fi') !== -1 ? selbadgestyle : badgestyle} variant='light'>Sci-fi</Button>{' '}
                                        <Button className='genrebtn' onClick={() => {genre.indexOf('Thriller') !== -1 ? oneenough('Thriller') : setGenre([...genre, 'Thriller'])}} style={genre.indexOf('Thriller') !== -1 ? selbadgestyle : badgestyle} variant='light'>Thriller</Button>{' '}
                                        <Button className='genrebtn' onClick={() => {genre.indexOf('Weird') !== -1 ? oneenough('Weird') : setGenre([...genre, 'Weird'])}} style={genre.indexOf('Weird') !== -1 ? selbadgestyle : badgestyle} variant='light'>Weird</Button>{' '}
                                        <Button className='genrebtn' onClick={() => {genre.indexOf('Boring') !== -1 ? oneenough('Boring') : setGenre([...genre, 'Boring'])}} style={genre.indexOf('Boring') !== -1 ? selbadgestyle : badgestyle} variant='light'>Boring</Button>{' '}
                                        <Button className='flaggenrebtn' onClick={() => {genre.indexOf('Flag') !== -1 ? oneenough('Flag') : setGenre([...genre, 'Flag'])}} style={genre.indexOf('Flag') !== -1 ? flagbadgestyle : badgestyle} variant='light'>Flag</Button>
                                        </div>
                                    </Form.Group>
                                    <Button style={deletesure === 0 ? {color: 'gray', marginTop: '30px', width: '20%', marginLeft: '7%'} : {marginTop: '30px', width: '20%', marginLeft: '7%'}} onClick={() => {deletesure === 0 ? setDeletesure(1) : Deleted()}} variant={deletesure === 0 ? 'none' : 'danger'}>{deletesure === 0 ? 'Delete' : 'Sure' }</Button>
                                    <Button style={{marginTop: '30px', width: '60%', marginLeft: '7%'}} onClick={() => {Updated(); setCardmodal(false)}} variant='success'>Update</Button>
                                    </Form>
                        </Modal.Body>
                        </Modal>
                        {countofshowresult === 0 && <h5 style={{color: (dark === 0 ? 'gray' : '#EDEDED'), fontWeight: '600',  paddingTop: '50px', width: '80%', textAlign: "center"}}>Nothing matched with sort by genre!</h5>}
        </div></div>) : (<div style={{display: 'flex', flexDirection: 'column', height: '87vh'}} {...handlers}>
            {showresult !== 3 ? <>
            <h5 style={{color: (dark === 0 ? 'green' : 'limegreen'), fontWeight: '600',  paddingTop: '50px', marginLeft: '10%',  width: '80%', textAlign: "center"}}>Welcome Bingers</h5>
            <h6 style={{color: (dark === 0 ? 'gray' : '#EDEDED'), paddingTop: '25px', marginLeft: '10%',  width: '80%', textAlign: "center"}}>Bingers Play is all about reflecting your perspective of Movies and Series.</h6>
            <h6 style={{color: (dark === 0 ? 'gray' : '#EDEDED'), paddingTop: '25px', marginLeft: '10%',  width: '80%', textAlign: "center"}}>Did anyone ask for your watched Movies/Series list? Just share your Bingers Play profile with them.</h6>
            <h6 style={{color: (dark === 0 ? 'gray' : '#EDEDED'), paddingTop: '25px', marginLeft: '10%',  width: '80%', textAlign: "center"}}>OK, Let's explore</h6>
            <Button onClick={() => {setResults([]); setWord(''); Smoothdelay(); searchbar ? setSearchbar(false) : setSearchbar(true)}} style={{maxWidth: '250px', margin: '0 auto', marginTop: '25px'}} variant="success">Add Movies/Series</Button></>
            : <div style={{textAlign: 'center', marginTop: '250px'}}><Spinner animation='grow' variant='success' /></div>}
            </div>)}<BiUpArrowCircle className='btt' onClick={() => {window.scrollTo({top: 0})}} size={38} style={{color: (dark === 0 ? '' : '#EDEDED'), cursor: 'pointer', right: '0px', marginRight: '10px', position:'fixed', zIndex: '1000', bottom: '10px', display: (bttview ? 'block' : 'none')}}/></>}
        </> : <div style={{textAlign: 'center', marginTop: '250px'}}><Spinner animation='grow' variant='success' /></div>}<br/></div>
    )
}
export default Home;